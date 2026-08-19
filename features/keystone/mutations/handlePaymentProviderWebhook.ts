"use server";

import { handleWebhook } from "../utils/paymentProviderAdapter";
import { reconcileOrderFulfillmentStatus } from "../orders/order-lifecycle";

const NO_DIVISION_CURRENCIES = new Set([
  "JPY", "KRW", "VND", "CLP", "PYG", "XAF", "XOF", "BIF", "DJF",
  "GNF", "KMF", "MGA", "RWF", "XPF", "HTG", "VUV", "XAG", "XDR", "XAU",
]);

function assertProviderAmount(providerCode: string, resource: any, payment: any) {
  const expectedCurrency = String(payment.currencyCode).toUpperCase();
  if (providerCode.includes("stripe")) {
    const amount = Number(resource.amount_received ?? resource.amount);
    if (amount !== payment.amount || String(resource.currency).toUpperCase() !== expectedCurrency) {
      throw new Error("Provider webhook amount or currency mismatch");
    }
    return;
  }
  if (providerCode.includes("paypal")) {
    const evidence = resource.amount;
    const divisor = NO_DIVISION_CURRENCIES.has(expectedCurrency) ? 1 : 100;
    if (
      !evidence ||
      Number(evidence.value) !== payment.amount / divisor ||
      String(evidence.currency_code).toUpperCase() !== expectedCurrency
    ) {
      throw new Error("Provider webhook amount or currency mismatch");
    }
  }
}

function normalizedHeaders(headers: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? String(value[0] || "") : String(value || ""),
    ])
  );
}

async function handlePaymentProviderWebhook(
  root: any,
  { providerId, event, headers }: { providerId: string; event: any; headers: Record<string, unknown> },
  context: any
) {
  const sudo = context.sudo();
  const provider = await sudo.query.PaymentProvider.findOne({
    where: { id: providerId },
    query: `
      id code isInstalled handleWebhookFunction credentials
    `,
  });
  if (!provider?.isInstalled) throw new Error("Payment provider not found");

  // Provider verification is the authorization boundary for this external
  // callback. Stripe receives the exact raw body from the thin HTTP ingress.
  const verified = await handleWebhook({
    provider,
    event,
    headers: normalizedHeaders(headers),
  });
  const type = String(verified.type || "");
  const resource = verified.resource || {};
  const providerEventId = String(verified.event?.id || event?.id || resource.id || "");
  if (!providerEventId) throw new Error("Provider event ID is required");

  const dedupeKey = `provider-webhook:${provider.id}:${providerEventId}`;
  const existing = await sudo.prisma.idempotencyKey.findUnique({
    where: { idempotencyKey: dedupeKey },
  });
  if (existing?.recoveryPoint === "completed") {
    return { success: true, message: "Duplicate event acknowledged" };
  }

  let attempt = existing;
  if (attempt) {
    const acquired = await sudo.prisma.idempotencyKey.updateMany({
      where: {
        id: attempt.id,
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } },
        ],
      },
      data: { lockedAt: new Date() },
    });
    if (acquired.count !== 1) {
      throw new Error("Event is already being processed");
    }
  }
  if (!attempt) {
    try {
      attempt = await sudo.prisma.idempotencyKey.create({
        data: {
          idempotencyKey: dedupeKey,
          requestMethod: "POST",
          requestPath: "payment-provider-webhook",
          requestParams: { providerId: provider.id, providerEventId, type },
          recoveryPoint: "verified",
          lockedAt: new Date(),
        },
      });
    } catch (error) {
      attempt = await sudo.prisma.idempotencyKey.findUnique({
        where: { idempotencyKey: dedupeKey },
      });
      if (attempt?.recoveryPoint === "completed") {
        return { success: true, message: "Duplicate event acknowledged" };
      }
      if (attempt) {
        throw new Error("Event is already being processed");
      }
      throw error;
    }
  }

  const succeeded = /payment_intent\.succeeded|PAYMENT\.CAPTURE\.COMPLETED/.test(type);
  const failed = /payment_intent\.payment_failed|PAYMENT\.CAPTURE\.DENIED/.test(type);
  const authorized = /payment_intent\.amount_capturable_updated|PAYMENT\.AUTHORIZATION\.CREATED/.test(type);
  const voided = /payment_intent\.canceled|PAYMENT\.AUTHORIZATION\.VOIDED/.test(type);

  const cartId = resource.metadata?.cartId || resource.custom_id;
  const explicitPaymentId = resource.metadata?.paymentId;
  let orderId = resource.metadata?.orderId;
  let paymentId = explicitPaymentId;
  let checkoutAttemptId: string | undefined;
  let checkoutPaymentResult: any;

  if (cartId && (!paymentId || !orderId)) {
    const cart = await sudo.query.Cart.findOne({
      where: { id: cartId },
      query: `
        id rawTotal
        region { currency { code } }
        paymentCollection {
          paymentSessions { id amount data isSelected paymentProvider { id } }
        }
        order {
          id payments { id data paymentCollection { paymentSessions { isSelected paymentProvider { id } } } }
        }
      `,
    });
    orderId ||= cart?.order?.id;
    paymentId ||=
      cart?.order?.payments?.find((payment: any) =>
        payment.paymentCollection?.paymentSessions?.some(
          (session: any) => session.isSelected && session.paymentProvider?.id === provider.id
        )
      )?.id;

    if (succeeded && !paymentId) {
      const selectedSession = cart?.paymentCollection?.paymentSessions?.find(
        (session: any) => session.isSelected && session.paymentProvider?.id === provider.id
      );
      if (selectedSession) {
        assertProviderAmount(provider.code, resource, {
          amount: selectedSession.amount,
          currencyCode: cart.region.currency.code,
        });
        const checkoutAttempt = await sudo.prisma.idempotencyKey.findUnique({
          where: { idempotencyKey: `checkout:${cartId}` },
        });
        checkoutAttemptId = checkoutAttempt?.id;
        checkoutPaymentResult = {
          status: "succeeded",
          paymentIntentId:
            selectedSession.data?.paymentIntentId || selectedSession.data?.orderId || resource.id,
          amount: selectedSession.amount,
          currency: cart.region.currency.code,
          data: resource,
        };
      }
    }
  }

  await sudo.prisma.$transaction(async (tx: any) => {
    if (succeeded && checkoutAttemptId && checkoutPaymentResult) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: {
          recoveryPoint: "payment_confirmed",
          responseBody: { paymentResult: checkoutPaymentResult },
          lockedAt: null,
        },
      });
    }
    if (paymentId) {
      if (succeeded) {
        const currentPayment = await tx.payment.findUnique({
          where: { id: paymentId },
          select: { amount: true, currencyCode: true },
        });
        if (!currentPayment) throw new Error("Payment not found for provider event");
        assertProviderAmount(provider.code, resource, currentPayment);
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "captured",
            capturedAt: new Date(),
            data: resource,
          },
        });
        const captureExists = await tx.capture.findFirst({
          where: { paymentId, metadata: { path: ["providerEventId"], equals: providerEventId } },
        });
        if (!captureExists && currentPayment) {
          await tx.capture.create({
            data: {
              amount: currentPayment.amount,
              paymentId,
              metadata: { providerId: provider.id, providerEventId, resourceId: resource.id },
              createdBy: "provider-webhook",
            },
          });
        }
      } else if (failed) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "failed", data: resource },
        });
      } else if (authorized) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "authorized", data: resource },
        });
      } else if (voided) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "canceled", canceledAt: new Date(), data: resource },
        });
      }
    }

    if (orderId) {
      if (succeeded) {
        await reconcileOrderFulfillmentStatus(tx, orderId, {
          reason: "payment_provider_capture_reconciled",
          paymentRecovered: true,
        });
        await tx.orderEvent.create({
          data: {
            orderId,
            type: "PAYMENT_CAPTURED",
            data: { paymentId: paymentId || null, providerId: provider.id, providerEventId },
          },
        });
      } else if (failed || voided) {
        const currentOrder = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true },
        });
        if (currentOrder && !["completed", "canceled", "archived"].includes(currentOrder.status)) {
          await tx.order.update({ where: { id: orderId }, data: { status: "requires_action" } });
          if (currentOrder.status !== "requires_action") {
            await tx.orderEvent.create({
              data: {
                orderId,
                type: "STATUS_CHANGE",
                data: {
                  previousStatus: currentOrder.status,
                  newStatus: "requires_action",
                  reason: failed ? "payment_provider_failed" : "payment_provider_voided",
                  providerEventId,
                },
              },
            });
          }
        }
      }
    }

    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "completed",
        responseCode: 200,
        responseBody: { providerEventId, type, paymentId: paymentId || null, orderId: orderId || null },
        lockedAt: null,
      },
    });
  });

  return {
    success: true,
    message: paymentId || orderId ? "Provider event reconciled" : "Provider event recorded for manual reconciliation",
  };
}

export default handlePaymentProviderWebhook;
