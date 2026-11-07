import { RETURN_REASONS, validateReturnRequest } from "../lib/return-request";

const ORDER_QUERY = `
  id status secretKey email displayId createdAt user { id }
  fulfillments { id createdAt canceledAt fulfillmentItems { quantity lineItem { id } } }
  lineItems { id title variantTitle quantity moneyAmount { amount } }
  returns { id status metadata }
`;

/** A customer asks to return shipped items; staff receive and refund it from the order page. */
export default async function requestOrderReturn(
  _root: unknown,
  { orderId, secretKey, items, reason, note }: { orderId: string; secretKey?: string | null; items: { lineItemId: string; quantity: number }[]; reason: string; note?: string | null },
  context: any
) {
  const sudo = context.sudo();
  const order = await sudo.query.Order.findOne({ where: { id: orderId }, query: ORDER_QUERY });
  const owner = order && (secretKey ? order.secretKey && order.secretKey === secretKey : context.session?.itemId && order.user?.id === context.session.itemId);
  if (!order || !owner) throw new Error("Order not found");

  // Serialize requests for one order so two submissions cannot both claim the same items.
  const created = await sudo.prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
    const fresh = await tx.return.findMany({ where: { orderId }, select: { id: true, status: true, metadata: true } });
    const { accepted, refundAmount, note: cleanNote } = validateReturnRequest({ ...order, returns: fresh }, { items, reason, note });
    const reasonLabel = RETURN_REASONS.find((r) => r.value === reason)?.label || reason;
    const ret = await tx.return.create({
      data: {
        status: "requested",
        refundAmount,
        orderId,
        metadata: { source: "customer", reason, reasonLabel, note: cleanNote || null, orderLineItems: accepted },
      },
      select: { id: true, status: true, refundAmount: true, createdAt: true, metadata: true },
    });
    await tx.orderEvent.create({
      data: { orderId, userId: context.session?.itemId || null, type: "RETURN_REQUESTED", data: { returnId: ret.id, source: "customer", reason, items: accepted.map((a) => ({ orderLineItemId: a.orderLineItemId, quantity: a.quantity })) } },
    });
    return ret;
  });

  // Acknowledge to the customer (best effort; the request is saved either way).
  if (process.env.SMTP_HOST && order.email) {
    try {
      const { sendStoreEmail } = await import("../lib/mail");
      const { emailLayout, emailPanel, emailParagraph, escapeHtml } = await import("../lib/email-layout");
      const lines = (created.metadata as any).orderLineItems.map((l: any) => `${l.quantity} × ${l.title}${l.variantTitle ? ` (${l.variantTitle})` : ""}`);
      await sendStoreEmail({
        to: order.email,
        subject: `Return request received - Order #${order.displayId}`,
        text: `We received your return request for order #${order.displayId}:\n\n${lines.join("\n")}\n\nWe'll review it and email you when your refund is issued. Refunds go back to your original payment method.`,
        html: emailLayout({
          preheader: `We received your return request for order #${order.displayId}.`,
          title: "Return request received",
          body: `${emailParagraph(`We received your return request for order <strong>#${escapeHtml(order.displayId)}</strong>.`)}
${emailPanel(lines.map(escapeHtml).join("<br>"))}
${emailParagraph("We'll review it and email you when your refund is issued. Refunds go back to your original payment method.")}`,
        }),
      });
    } catch {
      console.error("Return request acknowledgement email failed");
    }
  }
  return created;
}
