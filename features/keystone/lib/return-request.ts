// Customer self-serve return request (Shopify default): shipped items, within 30 days of shipment,
// a reason per request, merchant reviews it. Pure rules so the window and quantity limits are tested.

export const RETURN_WINDOW_DAYS = 30;
export const RETURN_REASONS = [
  { value: "too_small", label: "Too small" },
  { value: "too_large", label: "Too large" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "not_as_described", label: "Not as described" },
  { value: "damaged", label: "Damaged or defective" },
  { value: "wrong_item", label: "Wrong item sent" },
  { value: "other", label: "Other" },
] as const;

export type ReturnableLine = { id: string; title: string; variantTitle?: string; unitAmount: number; shipped: number; requested: number; returnable: number };

/** Quantities shipped (live fulfillments) minus quantities already in open or received returns. */
export function returnableLines(order: any): ReturnableLine[] {
  const shipped = new Map<string, number>();
  for (const fulfillment of order.fulfillments || []) {
    if (fulfillment.canceledAt) continue;
    for (const item of fulfillment.fulfillmentItems || []) {
      const id = item.lineItem?.id;
      if (id) shipped.set(id, (shipped.get(id) || 0) + (item.quantity || 0));
    }
  }
  const requested = new Map<string, number>();
  for (const ret of order.returns || []) {
    if (ret.status === "canceled") continue;
    for (const line of ret.metadata?.orderLineItems || []) {
      requested.set(line.orderLineItemId, (requested.get(line.orderLineItemId) || 0) + (Number(line.quantity) || 0));
    }
  }
  return (order.lineItems || []).map((line: any) => {
    const s = Math.min(shipped.get(line.id) || 0, line.quantity || 0);
    const r = requested.get(line.id) || 0;
    return { id: line.id, title: line.title, variantTitle: line.variantTitle || "", unitAmount: line.moneyAmount?.amount || 0, shipped: s, requested: r, returnable: Math.max(0, s - r) };
  });
}

/** The window opens at the first live shipment and lasts RETURN_WINDOW_DAYS. */
export function returnWindow(order: any, now = new Date()) {
  const firstShipped = (order.fulfillments || []).filter((f: any) => !f.canceledAt).map((f: any) => new Date(f.createdAt).getTime()).sort((a: number, b: number) => a - b)[0];
  if (!firstShipped) return { open: false, reason: "not_shipped" as const, closesAt: null };
  const closesAt = new Date(firstShipped + RETURN_WINDOW_DAYS * 86400_000);
  if (["canceled", "archived"].includes(order.status)) return { open: false, reason: "order_closed" as const, closesAt };
  return { open: now <= closesAt, reason: now <= closesAt ? null : ("window_closed" as const), closesAt };
}

export function validateReturnRequest(order: any, input: { items: { lineItemId: string; quantity: number }[]; reason: string; note?: string | null }, now = new Date()) {
  const window = returnWindow(order, now);
  if (!window.open) {
    throw new Error(window.reason === "not_shipped" ? "Items can be returned once they have shipped." : window.reason === "order_closed" ? "This order can no longer be returned." : `The ${RETURN_WINDOW_DAYS}-day return window for this order has closed.`);
  }
  if (!RETURN_REASONS.some((r) => r.value === input.reason)) throw new Error("Choose a reason for the return.");
  const note = String(input.note || "").trim().slice(0, 500);
  if (input.reason === "other" && note.length < 3) throw new Error("Tell us a little about why you're returning it.");
  const lines = new Map(returnableLines(order).map((l) => [l.id, l]));
  const picked = (input.items || []).filter((i) => Number(i.quantity) > 0);
  if (!picked.length) throw new Error("Choose at least one item to return.");
  const seen = new Set<string>();
  let refundAmount = 0;
  const accepted = picked.map((item) => {
    const line = lines.get(item.lineItemId);
    if (!line || seen.has(item.lineItemId)) throw new Error("That item is not part of this order.");
    seen.add(item.lineItemId);
    if (!Number.isInteger(item.quantity) || item.quantity > line.returnable) throw new Error(`Only ${line.returnable} of ${line.title} can be returned.`);
    refundAmount += line.unitAmount * item.quantity;
    return { orderLineItemId: line.id, quantity: item.quantity, title: line.title, variantTitle: line.variantTitle, returnReasonId: null, note: note || null };
  });
  return { accepted, refundAmount, note, closesAt: window.closesAt };
}
