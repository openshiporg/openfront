import { capturePayment, getPaymentStatus } from "../utils/paymentProviderAdapter";
import { assertInvoiceAccess } from "../security/invoice-access";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import {
  claimInvoicePaymentCommit,
  getOrCreateInvoicePaymentAttempt,
  invoicePaymentKey,
} from "../payments/invoice-payment-recovery";

const SUCCESS = new Set(["succeeded", "captured", "completed", "paid"]);
const AUTHORIZED = new Set(["authorized", "requires_capture", "approved"]);

function providerReference(data: any) {
  return data?.paymentIntentId || data?.payment_intent_id || data?.orderId || data?.id;
}

async function completeInvoicePayment(
  root: any,
  { paymentSessionId }: { paymentSessionId: string },
  context: any
) {
  const sudo = context.sudo();
  const session = await sudo.query.PaymentSession.findOne({
    where: { id: paymentSessionId },
    query: `
      id amount data
      paymentProvider { id code capturePaymentFunction getPaymentStatusFunction credentials }
      paymentCollection {
        id payments { id }
        invoice {
          id invoiceNumber totalAmount status
          currency { code }
          account { id paidAmount currency { code } user { id } }
          lineItems { accountLineItem { id paymentStatus } }
        }
      }
    `,
  });
  const invoice = session?.paymentCollection?.invoice;
  if (!invoice) throw new Error("Invoice not found");
  await assertInvoiceAccess(context, invoice.id);
  if (invoice.status === "paid") {
    return { id: invoice.id, status: "succeeded", success: true, message: "Invoice is already paid" };
  }
  if (!["sent", "overdue"].includes(invoice.status)) {
    throw new Error("Invoice is not payable");
  }
  if (session.amount !== invoice.totalAmount) throw new Error("Invoice payment amount mismatch");
  if (invoice.currency.code !== invoice.account.currency.code) {
    throw new Error("Cross-currency invoices require an approved accounting conversion workflow");
  }

  const provider = session.paymentProvider;
  if (!provider?.code || provider.code.includes("manual")) {
    throw new Error("Manual invoice tenders require operator verification");
  }
  const reference = providerReference(session.data);
  if (!reference) throw new Error("Provider payment reference is missing");

  const key = invoicePaymentKey(session.id);
  const attempt = await getOrCreateInvoicePaymentAttempt(
    sudo.prisma,
    invoice.id,
    paymentSessionId
  );
  if (attempt.recoveryPoint === "completed") {
    return { id: invoice.id, status: "succeeded", success: true, message: "Invoice is already paid" };
  }

  let result = attempt.responseBody?.providerResult;
  if (attempt.recoveryPoint !== "provider_captured" || !result) {
    result = await getPaymentStatus({ provider, paymentId: reference });
    if (AUTHORIZED.has(String(result.status).toLowerCase())) {
      result = await capturePayment({
        provider,
        paymentId: reference,
        amount: invoice.totalAmount,
        currency: invoice.currency.code,
        idempotencyKey: key,
      });
    }
    if (!SUCCESS.has(String(result.status).toLowerCase())) {
      throw new Error(`Provider payment is not complete: ${result.status}`);
    }
    if (Number(result.amount) !== invoice.totalAmount) throw new Error("Provider amount mismatch");
    if (String(result.currency).toUpperCase() !== invoice.currency.code.toUpperCase()) {
      throw new Error("Provider currency mismatch");
    }
    await sudo.prisma.idempotencyKey.update({
      where: { id: attempt.id },
      data: { recoveryPoint: "provider_captured", responseBody: { providerResult: result } },
    });
  }

  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "payment.captured"
  );
  await sudo.prisma.$transaction(async (tx: any) => {
    const paidAt = new Date();
    const claimed = await claimInvoicePaymentCommit(tx, invoice.id, paidAt);
    if (!claimed) {
      const existingPayment = await tx.payment.findFirst({
        where: {
          paymentCollectionId: session.paymentCollection.id,
          metadata: { path: ["idempotencyKey"], equals: key },
        },
        select: { id: true },
      });
      if (!existingPayment) {
        throw new Error("Invoice is not payable or payment reconciliation is required");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: {
          recoveryPoint: "completed",
          responseCode: 200,
          responseBody: { providerResult: result, paymentId: existingPayment.id },
          lockedAt: null,
        },
      });
      return { paymentId: existingPayment.id };
    }
    const payment = await tx.payment.create({
      data: {
        status: "captured",
        amount: invoice.totalAmount,
        currencyCode: invoice.currency.code,
        data: result,
        metadata: { invoiceId: invoice.id, idempotencyKey: key },
        capturedAt: new Date(),
        userId: invoice.account.user.id,
        paymentCollectionId: session.paymentCollection.id,
      },
    });
    await tx.capture.create({
      data: {
        amount: invoice.totalAmount,
        paymentId: payment.id,
        metadata: { invoiceId: invoice.id, idempotencyKey: key },
        createdBy: "invoice-checkout",
      },
    });
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        metadata: { providerResult: result, paymentId: payment.id, paidAt: paidAt.toISOString() },
      },
    });
    const ids = invoice.lineItems.map((item: any) => item.accountLineItem?.id).filter(Boolean);
    await tx.accountLineItem.updateMany({ where: { id: { in: ids } }, data: { paymentStatus: "paid" } });
    await tx.account.update({
      where: { id: invoice.account.id },
      data: { paidAmount: { increment: invoice.totalAmount } },
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      "payment.captured",
      "Payment",
      payment.id,
      { id: payment.id, invoiceId: invoice.id, amount: invoice.totalAmount, currencyCode: invoice.currency.code }
    );
    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "completed",
        responseCode: 200,
        responseBody: { providerResult: result, paymentId: payment.id },
        lockedAt: null,
      },
    });
    return { paymentId: payment.id };
  });
  return {
    id: invoice.id,
    status: "succeeded",
    success: true,
    message: `Invoice ${invoice.invoiceNumber} paid`,
  };
}

export default completeInvoicePayment;
