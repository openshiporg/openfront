import crypto from "node:crypto";
import { permissions } from "../access";
import { commerceLaunchPolicy } from "../config/launch-policy";

async function getFinanceClose(
  root: any,
  { start, end }: { start: string; end: string },
  context: any
) {
  if (
    !context.session?.itemId ||
    !permissions.canReadPayments({ session: context.session })
  ) {
    throw new Error("Access denied");
  }
  const startAt = new Date(start);
  const endAt = new Date(end);
  if (
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime()) ||
    startAt >= endAt ||
    endAt.getTime() - startAt.getTime() > 31 * 24 * 60 * 60 * 1000
  ) {
    throw new Error("Finance close range must be valid and no longer than 31 days");
  }

  const payments = await context.sudo().query.Payment.findMany({
    where: { createdAt: { gte: startAt.toISOString(), lt: endAt.toISOString() } },
    orderBy: { createdAt: "asc" },
    take: 5000,
    query: `
      id status amount amountRefunded currencyCode capturedAt createdAt data
      captures { id amount createdAt metadata }
      refunds { id amount reason createdAt metadata }
      order { id displayId status metadata }
    `,
  });
  if (payments.length === 5000) {
    throw new Error("Finance close exceeded the bounded export limit");
  }

  const rows = payments.map((payment: any) => {
    const captured = payment.captures?.reduce((sum: number, item: any) => sum + item.amount, 0) ||
      (payment.status === "captured" ? payment.amount : 0);
    const refunded = payment.refunds?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
    const providerReference =
      payment.data?.paymentIntentId || payment.data?.orderId || payment.data?.id || null;
    return {
      paymentId: payment.id,
      orderId: payment.order?.id || null,
      orderDisplayId: payment.order?.displayId || null,
      currency: payment.currencyCode,
      status: payment.status,
      captured,
      refunded,
      netTender: captured - refunded,
      providerReference,
      capturedAt: payment.capturedAt,
      accountingPolicyVersion:
        payment.order?.metadata?.commercialSnapshot?.accountingPolicyVersion ||
        commerceLaunchPolicy.accountingPolicyVersion,
      exception:
        payment.status === "captured" && (!providerReference || captured !== payment.amount)
          ? "CAPTURE_EVIDENCE_MISMATCH"
          : null,
    };
  });

  const byCurrency = Object.values(
    rows.reduce((result: Record<string, any>, row: any) => {
      const current = result[row.currency] || {
        currency: row.currency,
        captured: 0,
        refunded: 0,
        netTender: 0,
        count: 0,
      };
      current.captured += row.captured;
      current.refunded += row.refunded;
      current.netTender += row.netTender;
      current.count += 1;
      result[row.currency] = current;
      return result;
    }, {})
  );
  const controlPayload = JSON.stringify({ start, end, byCurrency, rows });

  return {
    generatedAt: new Date().toISOString(),
    range: { start: startAt.toISOString(), end: endAt.toISOString() },
    legalEntityId: commerceLaunchPolicy.legalEntityId,
    reportingCurrency: commerceLaunchPolicy.reportingCurrency,
    accountingPolicyVersion: commerceLaunchPolicy.accountingPolicyVersion,
    providerSettlementStatus: "OWNER_DATA_REQUIRED",
    rows,
    byCurrency,
    exceptions: rows.filter((row: any) => row.exception),
    control: {
      rowCount: rows.length,
      sha256: crypto.createHash("sha256").update(controlPayload).digest("hex"),
    },
  };
}

export default getFinanceClose;
