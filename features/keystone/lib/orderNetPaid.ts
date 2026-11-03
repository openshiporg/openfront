import { GraphQLError } from "graphql";

// Net-paid rule shared with the order page (OrderPageClient.tsx, a33a307):
// paid = amount of captured / partially_refunded / refunded payments,
// refunded = sum of amountRefunded across all payments.
const PAID_STATUSES = ["captured", "partially_refunded", "refunded"];

export const FULLY_REFUNDED_MESSAGE = "Order is fully refunded. Nothing left to fulfil.";

export function computeNetPaid(
  payments: Array<{ amount?: number | null; amountRefunded?: number | null; status?: string | null }>
) {
  const refundedCents = payments.reduce((sum, p) => sum + (p.amountRefunded || 0), 0);
  const paidCents = payments
    .filter((p) => PAID_STATUSES.includes(p.status || ""))
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  return { paidCents, refundedCents };
}

export function isFullyRefunded(net: { paidCents: number; refundedCents: number }) {
  return net.paidCents > 0 && net.refundedCents >= net.paidCents;
}

// `db` is a Prisma transaction client (or the Prisma client).
export async function assertOrderNotFullyRefunded(db: any, orderId: string) {
  const payments = await db.payment.findMany({
    where: { orderId },
    select: { amount: true, amountRefunded: true, status: true },
  });
  if (isFullyRefunded(computeNetPaid(payments))) throw new GraphQLError(FULLY_REFUNDED_MESSAGE, { extensions: { code: "ORDER_FULLY_REFUNDED" } });
}
