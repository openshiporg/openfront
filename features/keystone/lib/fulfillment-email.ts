// "Your order shipped" email, sent after the fulfillment commits (Shopify's shipping confirmation).
// The FULFILLMENT_CREATED Notification row written in the fulfillment transaction is the dedupe record:
// it is claimed atomically from pending_delivery, so a replay or a second process never sends twice.
// A mail failure is recorded on the row and never fails the fulfillment.

const PENDING = "pending_delivery";
type Send = (order: any, fulfillment: any) => Promise<{ sent: boolean; error?: string; messageId?: string; response?: string }>;

export async function deliverFulfillmentEmail(sudo: any, fulfillmentId: string, send?: Send) {
  try {
    const notification = await sudo.prisma.notification.findFirst({
      where: { eventName: "FULFILLMENT_CREATED", resourceType: "Fulfillment", resourceId: fulfillmentId },
      select: { id: true, data: true },
    });
    if (!notification) return { status: "no_notification" };
    const base = notification.data || {};
    const mark = (status: string, extra: Record<string, unknown> = {}) =>
      sudo.prisma.notification.update({ where: { id: notification.id }, data: { data: { ...base, status, ...extra } } });
    const claim = await sudo.prisma.notification.updateMany({
      where: { id: notification.id, data: { path: ["status"], equals: PENDING } },
      data: { data: { ...base, status: "sending" } },
    });
    if (claim.count !== 1) return { status: "already_claimed" };
    try {
      if (!send && !process.env.SMTP_HOST) { await mark("skipped_not_configured"); return { status: "skipped_not_configured" }; }
      const fulfillment = await sudo.query.Fulfillment.findOne({
        where: { id: fulfillmentId },
        query: `id order { id } fulfillmentItems { quantity lineItem { title variantTitle sku formattedUnitPrice formattedTotal } } shippingLabels { carrier trackingNumber trackingUrl }`,
      });
      const orderId = fulfillment?.order?.id;
      if (!orderId) { await mark("failed", { error: "order_missing" }); return { status: "failed" }; }
      const order = await sudo.query.Order.findOne({
        where: { id: orderId },
        query: `id displayId email secretKey shippingAddress { firstName lastName address1 address2 city province postalCode country { iso2 } }`,
      });
      const sender: Send = send || (async (o, f) => (await import("./mail")).sendOrderFulfillmentEmail(o, f));
      const result = await sender(order, { ...fulfillment, items: fulfillment.fulfillmentItems });
      if (result.sent) await mark("sent", { sentAt: new Date().toISOString(), ...(result.messageId ? { messageId: result.messageId } : {}) });
      else await mark(result.error === "no_recipient" ? "skipped_no_recipient" : "failed", { error: result.error || "send_failed" });
      return { status: result.sent ? "sent" : "failed" };
    } catch (error) {
      try { await mark("failed", { error: error instanceof Error ? error.message : "send_failed" }); } catch { /* bookkeeping only */ }
      return { status: "failed" };
    }
  } catch (error) {
    console.error("Shipping confirmation email failed:", error instanceof Error ? error.message : "unknown");
    return { status: "failed" };
  }
}
