import { getOrCreateIdempotencyAttempt } from "../utils/idempotency";

const STALE_LOCK_MS = 5 * 60 * 1000;

export function invoicePaymentKey(paymentSessionId: string): string {
  return `invoice-payment:${paymentSessionId}`;
}

export async function getOrCreateInvoicePaymentAttempt(
  prisma: any,
  invoiceId: string,
  paymentSessionId: string
): Promise<any> {
  const { attempt, replay } = await getOrCreateIdempotencyAttempt(prisma, {
    key: invoicePaymentKey(paymentSessionId),
    requestPath: "completeInvoicePayment",
    requestParams: { invoiceId, paymentSessionId },
  });
  if (!replay || attempt.recoveryPoint === "completed") return attempt;

  const acquired = await prisma.idempotencyKey.updateMany({
    where: {
      id: attempt.id,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - STALE_LOCK_MS) } },
      ],
    },
    data: { lockedAt: new Date() },
  });
  if (acquired.count !== 1) {
    throw new Error("Invoice payment is already in progress");
  }
  return prisma.idempotencyKey.findUnique({ where: { id: attempt.id } });
}

/**
 * First statement in the local settlement transaction. PostgreSQL rechecks
 * this conditional update after waiting on a concurrent row lock, so only one
 * transaction may post payment/capture/account state.
 */
export async function claimInvoicePaymentCommit(
  tx: any,
  invoiceId: string,
  paidAt: Date
): Promise<boolean> {
  const claimed = await tx.invoice.updateMany({
    where: {
      id: invoiceId,
      status: { in: ["sent", "overdue"] },
    },
    data: { status: "paid", paidAt },
  });
  return claimed.count === 1;
}
