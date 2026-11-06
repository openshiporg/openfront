import test from "node:test";
import assert from "node:assert/strict";
import { returnableLines, returnWindow, validateReturnRequest } from "../features/keystone/lib/return-request";

const shippedAt = new Date("2026-11-01T00:00:00Z");
const order = (extra: any = {}) => ({
  status: "pending",
  fulfillments: [{ createdAt: shippedAt.toISOString(), canceledAt: null, fulfillmentItems: [{ quantity: 2, lineItem: { id: "l1" } }] }],
  lineItems: [{ id: "l1", title: "Hoodie", quantity: 3, moneyAmount: { amount: 4500 } }, { id: "l2", title: "Tee", quantity: 1, moneyAmount: { amount: 2000 } }],
  returns: [],
  ...extra,
});

test("only shipped quantity, minus open returns, can be returned", () => {
  const lines = returnableLines(order({ returns: [{ status: "requested", metadata: { orderLineItems: [{ orderLineItemId: "l1", quantity: 1 }] } }, { status: "canceled", metadata: { orderLineItems: [{ orderLineItemId: "l1", quantity: 1 }] } }] }));
  assert.equal(lines.find((l) => l.id === "l1")!.returnable, 1);
  assert.equal(lines.find((l) => l.id === "l2")!.returnable, 0);
});

test("the window is 30 days from first shipment", () => {
  assert.equal(returnWindow(order(), new Date("2026-11-30T00:00:00Z")).open, true);
  assert.equal(returnWindow(order(), new Date("2026-12-02T00:00:00Z")).reason, "window_closed");
  assert.equal(returnWindow(order({ fulfillments: [] })).reason, "not_shipped");
});

test("a request prices the refund from the order line and rejects too many", () => {
  const now = new Date("2026-11-05T00:00:00Z");
  const ok = validateReturnRequest(order(), { items: [{ lineItemId: "l1", quantity: 2 }], reason: "too_small" }, now);
  assert.equal(ok.refundAmount, 9000);
  assert.throws(() => validateReturnRequest(order(), { items: [{ lineItemId: "l1", quantity: 3 }], reason: "too_small" }, now), /Only 2/);
  assert.throws(() => validateReturnRequest(order(), { items: [{ lineItemId: "l2", quantity: 1 }], reason: "too_small" }, now), /Only 0/);
  assert.throws(() => validateReturnRequest(order(), { items: [{ lineItemId: "l1", quantity: 1 }], reason: "nope" }, now), /reason/);
  assert.throws(() => validateReturnRequest(order(), { items: [{ lineItemId: "l1", quantity: 1 }], reason: "other" }, now), /why/);
});
