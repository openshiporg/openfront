import test from "node:test";
import assert from "node:assert/strict";
import { deliverFulfillmentEmail } from "../features/keystone/lib/fulfillment-email";

function fake(status = "pending_delivery") {
  const row: any = { id: "n1", data: { orderId: "o1", fulfillmentId: "f1", status } };
  const sudo: any = {
    prisma: { notification: {
      findFirst: async () => row,
      updateMany: async ({ where, data }: any) => { if (row.data.status !== where.data.equals) return { count: 0 }; row.data = data.data; return { count: 1 }; },
      update: async ({ data }: any) => { row.data = data.data; return row; },
    } },
    query: {
      Fulfillment: { findOne: async () => ({ id: "f1", order: { id: "o1" }, fulfillmentItems: [{ quantity: 1, lineItem: { title: "Hoodie" } }], shippingLabels: [{ carrier: "ups", trackingNumber: "1Z", trackingUrl: "https://ups/1Z" }] }) },
      Order: { findOne: async () => ({ id: "o1", displayId: 7, email: "c@x.co", secretKey: "k" }) },
    },
  };
  return { row, sudo };
}

test("a shipment emails the customer once, with the items and tracking", async () => {
  const { row, sudo } = fake();
  const sent: any[] = [];
  const send = async (order: any, fulfillment: any) => { sent.push({ order, fulfillment }); return { sent: true }; };
  await deliverFulfillmentEmail(sudo, "f1", send);
  await deliverFulfillmentEmail(sudo, "f1", send);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].order.email, "c@x.co");
  assert.equal(sent[0].fulfillment.items[0].lineItem.title, "Hoodie");
  assert.equal(sent[0].fulfillment.shippingLabels[0].trackingUrl, "https://ups/1Z");
  assert.equal(row.data.status, "sent");
});

test("a mail failure is recorded and never thrown", async () => {
  const { row, sudo } = fake();
  const result = await deliverFulfillmentEmail(sudo, "f1", async () => { throw new Error("smtp down"); });
  assert.equal(result.status, "failed");
  assert.equal(row.data.status, "failed");
});
