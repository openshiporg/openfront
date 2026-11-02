import { GraphQLError } from "graphql";
import { permissions } from "../access";
import { refundPayment } from "../utils/paymentProviderAdapter";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { findIdempotencyAttempt, getOrCreateIdempotencyAttempt } from "../utils/idempotency";

function refundRuleError(message: string, code: "REFUND_EXCEEDS_BALANCE" | "PAYMENT_NOT_CAPTURED" | "REFUND_IN_PROGRESS") {
  return new GraphQLError(message, { extensions: { code } });
}

function providerPaymentReference(payment: any): string | undefined {
  return (
    payment.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
    payment.data?.payment_intent_id ||
    payment.data?.paymentIntentId ||
    payment.data?.orderId ||
    payment.data?.id
  );
}

async function refundOrderPayment(
  root: any,
  { orderId, paymentId, amount, reason, idempotencyKey }: { orderId: string; paymentId: string; amount: number; reason: string; idempotencyKey: string },
  context: any
) {
  if (
    !permissions.canManageReturns({ session: context.session }) ||
    !permissions.canManagePayments({ session: context.session })
  ) {
    throw new Error("Access denied");
  }
  if (!idempotencyKey?.trim()) throw new Error("Idempotency key is required");

  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Refund amount must be positive minor units");
  if (!reason?.trim() || reason.trim().length > 1000) throw new Error("Refund reason is required (maximum 1000 characters)");

  const sudo = context.sudo();
  const businessKey = `refund:${idempotencyKey.trim()}`;
  const idempotencyRequest = {
    key: businessKey,
    requestPath: "refundOrderPayment",
    requestParams: { orderId, paymentId, amount, reason: reason.trim() },
  };
  const priorAttempt = await findIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (priorAttempt?.recoveryPoint === "completed" && priorAttempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: priorAttempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }",
    });
  }

  const payment = await sudo.query.Payment.findOne({
    where: { id: paymentId },
    query: `
      id status amount amountRefunded currencyCode data order { id }
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
  if (!payment || payment.order?.id !== orderId) throw new Error("Payment does not belong to order");
  if (payment.status !== "captured") throw refundRuleError("Only captured payments can be refunded", "PAYMENT_NOT_CAPTURED");
  const alreadyRefunded = payment.refunds?.reduce((sum: number, refund: any) => sum + refund.amount, 0) || 0;
  // A replay already owns its reservation. New requests must include all in-flight reservations.
  const reserved = Math.max(alreadyRefunded, payment.amountRefunded || 0);
  if (!priorAttempt && reserved + amount > payment.amount) {
    throw refundRuleError("Refund exceeds captured payment amount", "REFUND_EXCEEDS_BALANCE");
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
    if (Date.now() - new Date(attempt.createdAt).getTime() > 60 * 60 * 1000 && !attempt.responseBody?.providerResult) {
      throw refundRuleError("Refund requires provider reconciliation before retrying", "REFUND_IN_PROGRESS");
    }
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
    if (acquired.count !== 1) throw refundRuleError("Refund is already in progress", "REFUND_IN_PROGRESS");
  }

  if (attempt.recoveryPoint === "started") {
    await sudo.prisma.$transaction(async (tx: any) => {
      const reserved = await tx.payment.updateMany({
        where: {
          id: paymentId,
          amountRefunded: { lte: payment.amount - amount },
        },
        data: { amountRefunded: { increment: amount } },
      });
      if (reserved.count !== 1) {
        throw refundRuleError("Concurrent refund exceeds captured payment amount", "REFUND_EXCEEDS_BALANCE");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: { recoveryPoint: "amount_reserved", lockedAt: new Date() },
      });
    });
    attempt.recoveryPoint = "amount_reserved";
  }

  let providerResult = attempt.responseBody?.providerResult;
  if (!providerResult) {
    providerResult = await refundPayment({
      provider,
      paymentId: providerReference,
      amount: amount,
      currency: payment.currencyCode,
      idempotencyKey: businessKey,
    });
    if (!providerResult.id && !providerResult.refundId && !providerResult.data?.id) throw new Error("Provider refund reference is missing");
    const status = String(providerResult.status || "").toLowerCase();
    if (!["succeeded", "completed", "refunded"].includes(status)) {
      throw new Error(`Provider refund is not complete: ${providerResult.status}`);
    }
    if (Number(providerResult.amount) !== amount) {
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
    // Serialize finalization on the durable attempt row, including stale-lease replays.
    await tx.idempotencyKey.update({ where: { id: attempt.id }, data: { lockedAt: new Date() } });
    const duplicate = await tx.refund.findFirst({
      where: { idempotencyKey: businessKey },
    });
    if (duplicate) return duplicate;

    const created = await tx.refund.create({
      data: {
        amount: amount,
        reason: "other",
        note: reason.trim(),
        idempotencyKey: businessKey,
        payment: { connect: { id: paymentId } },
        metadata: { providerId: provider.id, providerResult },
        createdById: context.session.itemId,
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: orderId,
        type: "REFUND_PROCESSED",
        data: { refundId: created.id, amount: created.amount },
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
      { id: created.id, paymentId, orderId: orderId, amount: created.amount }
    );
    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: { recoveryPoint: "completed", responseCode: 200, responseBody: { refundId: created.id, providerResult }, lockedAt: null },
    });
    return created;
  });

  return sudo.query.Refund.findOne({
    where: { id: refund.id },
    query: "id amount reason idempotencyKey payment { id amount amountRefunded }",
  });
}

export default refundOrderPayment;
