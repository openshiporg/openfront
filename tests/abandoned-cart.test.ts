import test from "node:test";
import assert from "node:assert/strict";
process.env.SESSION_SECRET ||= "test-secret-test-secret-test-secret-123";
import { sendAbandonedCartEmails, abandonedCartMessage } from "../features/keystone/lib/abandoned-cart";
import { cartIdFromProof, verifyCartProof } from "../features/keystone/security/token-crypto";

const now = new Date("2026-11-06T12:00:00Z");
function fakePrisma(carts: any[]) {
  return {
    cart: {
      findMany: async ({ where }: any) => carts.filter((c) => !c.abandonedEmailSent && !c.orderId && c.updatedAt <= where.updatedAt.lte && c.updatedAt >= where.updatedAt.gte),
      updateMany: async ({ where, data }: any) => {
        const cart = carts.find((c) => c.id === where.id);
        if (!cart || cart.abandonedEmailSent !== where.abandonedEmailSent || (where.updatedAt && cart.updatedAt !== where.updatedAt)) return { count: 0 };
        Object.assign(cart, data);
        return { count: 1 };
      },
    },
  };
}
const cart = (id: string, email: string, hoursAgo: number) => ({
  id, email, orderId: null, abandonedEmailSent: false, updatedAt: new Date(now.getTime() - hoursAgo * 3600_000),
  region: { countries: [{ iso2: "US" }] },
  lineItems: [{ quantity: 2, productVariant: { title: "L", product: { title: "Escher's Staircase Hoodie" } } }],
});

test("an idle cart gets one recovery email with a working resume link; fresh, stale and test-domain carts do not", async () => {
  const carts = [cart("c1", "shopper@gmail.com", 11), cart("c2", "fresh@gmail.com", 2), cart("c3", "old@gmail.com", 72), cart("c4", "qa@example.com", 12)];
  const prisma = fakePrisma(carts);
  const sent: any[] = [];
  const send = async (m: any) => { sent.push(m); };
  await sendAbandonedCartEmails(prisma, now, send, "https://shop.test");
  await sendAbandonedCartEmails(prisma, now, send, "https://shop.test");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "shopper@gmail.com");
  assert.match(sent[0].text, /2 × Escher's Staircase Hoodie – L/);
  const link = new URL(sent[0].text.match(/https:\/\/shop\.test\S+/)[0]);
  assert.equal(link.pathname, "/api/cart-recover");
  assert.equal(link.searchParams.get("c"), "us");
  const proof = link.searchParams.get("p")!;
  assert.equal(cartIdFromProof(proof), "c1");
  assert.ok(verifyCartProof(proof, "c1"));
  assert.equal(carts[3].abandonedEmailSent, true);
  assert.equal(carts[1].abandonedEmailSent, false);
});

test("the email escapes product names", () => {
  const m = abandonedCartMessage({ email: "a@b.co", countryCode: "us", items: [{ title: "<b>x</b>", quantity: 1 }] }, "https://s/x");
  assert.doesNotMatch(m.html, /<b>x<\/b>/);
});
