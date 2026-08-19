import { permissions } from "../access";
import { refundPayment } from "../utils/paymentProviderAdapter";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { findIdempotencyAttempt, getOrCreateIdempotencyAttempt } from "../utils/idempotency";

function providerPaymentReference(payment: any): string | undefined {
  return (
    payment.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
    payment.data?.payment_intent_id ||
    payment.data?.paymentIntentId ||
    payment.data?.orderId ||
    payment.data?.id
  );
}

async function processReturnRefund(
  root: any,
  { returnId, paymentId, idempotencyKey }: { returnId: string; paymentId: string; idempotencyKey: string },
  context: any
) {
  if (
    !permissions.canManageReturns({ session: context.session }) ||
    !permissions.canManagePayments({ session: context.session })
  ) {
    throw new Error("Access denied");
  }
  if (!idempotencyKey?.trim()) throw new Error("Idempotency key is required");

  const sudo = context.sudo();
  const businessKey = `refund:${idempotencyKey.trim()}`;
  const idempotencyRequest = {
    key: businessKey,
    requestPath: "processReturnRefund",
    requestParams: { returnId, paymentId },
  };
  const priorAttempt = await findIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (priorAttempt?.recoveryPoint === "completed" && priorAttempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: priorAttempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }",
    });
  }

  const returnRecord = await sudo.query.Return.findOne({
    where: { id: returnId },
    query: `id status refundAmount metadata order { id payments { id } }`,
  });
  if (!returnRecord?.order?.id || returnRecord.refundAmount <= 0) {
    throw new Error("Return is not refundable");
  }
  if (!returnRecord.order.payments?.some((payment: any) => payment.id === paymentId)) {
    throw new Error("Payment does not belong to return order");
  }

  const payment = await sudo.query.Payment.findOne({
    where: { id: paymentId },
    query: `
      id amount amountRefunded currencyCode data
      refunds { id amount idempotencyKey }
      paymentCollection {
        paymentSessions {
          isSelected
          paymentProvider {
            id code refundPaymentFunction credentials
          }
        }
      }
    `,
  });
  if (!payment) throw new Error("Payment not found");
  const alreadyRefunded = payment.refunds?.reduce((sum: number, refund: any) => sum + refund.amount, 0) || 0;
  if (alreadyRefunded + returnRecord.refundAmount > payment.amount) {
    throw new Error("Refund exceeds captured payment amount");
  }

  const provider =
    payment.paymentCollection?.paymentSessions?.find((session: any) => session.isSelected)?.paymentProvider ||
    payment.paymentCollection?.paymentSessions?.[0]?.paymentProvider;
  const providerReference = providerPaymentReference(payment);
  if (!provider || !providerReference) throw new Error("Refund provider reference is missing");
  if (provider.code?.includes("manual")) {
    throw new Error("Manual tender refunds require operator verification");
  }

  const { attempt, replay } = priorAttempt
    ? { attempt: priorAttempt, replay: true }
    : await getOrCreateIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (attempt.recoveryPoint === "completed" && attempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: attempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }",
    });
  }
  if (replay) {
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
    if (acquired.count !== 1) throw new Error("Refund is already in progress");
  }

  if (attempt.recoveryPoint === "started") {
    await sudo.prisma.$transaction(async (tx: any) => {
      const reserved = await tx.payment.updateMany({
        where: {
          id: paymentId,
          amountRefunded: { lte: payment.amount - returnRecord.refundAmount },
        },
        data: { amountRefunded: { increment: returnRecord.refundAmount } },
      });
      if (reserved.count !== 1) {
        throw new Error("Concurrent refund exceeds captured payment amount");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: { recoveryPoint: "amount_reserved", lockedAt: new Date() },
      });
    });
    attempt.recoveryPoint = "amount_reserved";
  }

  let providerResult = attempt.responseBody?.providerResult;
  if (attempt.recoveryPoint !== "provider_refunded" || !providerResult) {
    providerResult = await refundPayment({
      provider,
      paymentId: providerReference,
      amount: returnRecord.refundAmount,
      currency: payment.currencyCode,
      idempotencyKey: businessKey,
    });
    const status = String(providerResult.status || "").toLowerCase();
    if (!["succeeded", "completed", "refunded"].includes(status)) {
      throw new Error(`Provider refund is not complete: ${providerResult.status}`);
    }
    if (Number(providerResult.amount) !== returnRecord.refundAmount) {
      throw new Error("Provider refund amount mismatch");
    }
    if (
      providerResult.currency &&
      String(providerResult.currency).toUpperCase() !== String(payment.currencyCode).toUpperCase()
    ) {
      throw new Error("Provider refund currency mismatch");
    }
    await sudo.prisma.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "provider_refunded",
        responseBody: { providerResult },
        lockedAt: new Date(),
      },
    });
  }

  const refundWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "refund.created"
  );
  const refund = await sudo.prisma.$transaction(async (tx: any) => {
    const duplicate = await tx.refund.findFirst({
      where: { idempotencyKey: businessKey },
    });
    if (duplicate) return duplicate;

    const created = await tx.refund.create({
      data: {
        amount: returnRecord.refundAmount,
        reason: "return",
        note: `Return ${returnId}`,
        idempotencyKey: businessKey,
        paymentId,
        metadata: { providerId: provider.id, providerResult },
      },
    });
    await tx.return.update({
      where: { id: returnId },
      data: {
        status: "received",
        receivedAt: new Date(),
        metadata: {
          ...(returnRecord.metadata || {}),
          refundId: created.id,
          refundStatus: "completed",
        },
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: returnRecord.order.id,
        type: "REFUND_PROCESSED",
        data: { returnId, refundId: created.id, amount: created.amount },
        time: new Date(),
        userId: context.session.itemId,
        createdById: context.session.itemId,
      },
    });
    await enqueueWebhookOutbox(
      tx,
      refundWebhookEndpointIds,
      "refund.created",
      "Refund",
      created.id,
      { id: created.id, returnId, paymentId, orderId: returnRecord.order.id, amount: created.amount }
    );
    return created;
  });

  await sudo.prisma.idempotencyKey.update({
    where: { id: attempt.id },
    data: {
      recoveryPoint: "completed",
      responseCode: 200,
      responseBody: { refundId: refund.id, providerResult },
      lockedAt: null,
    },
  });

  return sudo.query.Refund.findOne({
    where: { id: refund.id },
    query: "id amount reason idempotencyKey payment { id amount amountRefunded }",
  });
}

export default processReturnRefund;
