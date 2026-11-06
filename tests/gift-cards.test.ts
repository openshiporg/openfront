import test from "node:test";
import assert from "node:assert/strict";
import {
  allocateGiftCards,
  giftCardEmail,
  giftCodeFor,
  heldFor,
  holdGiftCardBalances,
  ledgerOf,
  linkGiftCardsToOrder,
  normalizeGiftCode,
  releaseGiftCardBalances,
  validatePurchase,
} from "../features/keystone/lib/gift-cards";

function fakePrisma(cards: any[]) {
  const rows = new Map(cards.map((c) => [c.id, { metadata: {}, isDisabled: false, endsAt: null, ...c }]));
  const transactions: any[] = [];
  const giftCard = {
    findUnique: async ({ where }: any) => (rows.has(where.id) ? structuredClone(rows.get(where.id)) : null),
    updateMany: async ({ where, data }: any) => {
      const row = rows.get(where.id);
      if (!row || row.balance !== where.balance || (where.isDisabled === false && row.isDisabled)) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
  };
  const giftCardTransaction = {
    findFirst: async ({ where }: any) => transactions.find((t) => t.giftCardId === where.giftCardId && t.orderId === where.orderId) || null,
    create: async ({ data }: any) => { transactions.push(data); return data; },
  };
  const prisma: any = { giftCard, giftCardTransaction, $transaction: async (fn: any) => fn(prisma) };
  return { prisma, rows, transactions };
}

test("codes are 12 hex characters in groups of four, stable per payment, and normalised from input", () => {
  const code = giftCodeFor("pi_123");
  assert.match(code, /^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.equal(giftCodeFor("pi_123"), code);
  assert.notEqual(giftCodeFor("pi_124"), code);
  assert.equal(normalizeGiftCode(code.toLowerCase().replace(/-/g, "")), code);
  assert.equal(normalizeGiftCode(" " + code.toLowerCase() + " "), code);
  assert.equal(normalizeGiftCode("SUMMER10"), "");
  assert.equal(normalizeGiftCode("ZZZZ-ZZZZ-ZZZZ"), "");
});

test("cards pay in order up to their balance and never more than the total; unusable cards are skipped", () => {
  const now = new Date("2026-11-06T00:00:00Z");
  const cards = [
    { id: "a", balance: 3000 },
    { id: "gone", balance: 5000, isDisabled: true },
    { id: "old", balance: 5000, endsAt: "2026-01-01T00:00:00Z" },
    { id: "b", balance: 5000 },
  ];
  assert.deepEqual(allocateGiftCards(cards, 6250, now), { allocations: [{ id: "a", amount: 3000 }, { id: "b", amount: 3250 }], applied: 6250, remaining: 0 });
  assert.deepEqual(allocateGiftCards(cards, 2000, now), { allocations: [{ id: "a", amount: 2000 }], applied: 2000, remaining: 0 });
  assert.deepEqual(allocateGiftCards([{ id: "a", balance: 2500 }], 7905, now), { allocations: [{ id: "a", amount: 2500 }], applied: 2500, remaining: 5405 });
});

test("a checkout hold debits once per checkout key, and a release puts back exactly what was held", async () => {
  const { prisma, rows } = fakePrisma([{ id: "a", balance: 5000 }]);
  await holdGiftCardBalances(prisma, [{ id: "a", amount: 3000 }], "checkout:c1");
  await holdGiftCardBalances(prisma, [{ id: "a", amount: 3000 }], "checkout:c1");
  assert.equal(rows.get("a").balance, 2000);
  assert.equal(heldFor(ledgerOf(rows.get("a")), "checkout:c1"), 3000);
  await releaseGiftCardBalances(prisma, ["a"], "checkout:c1");
  await releaseGiftCardBalances(prisma, ["a"], "checkout:c1");
  assert.equal(rows.get("a").balance, 5000);
  assert.equal(heldFor(ledgerOf(rows.get("a")), "checkout:c1"), 0);
  assert.deepEqual(ledgerOf(rows.get("a")).map((r) => [r.type, r.amount, r.balance]), [["hold", 3000, 2000], ["release", 3000, 5000]]);
});

test("a hold fails when the card no longer covers its share or was voided", async () => {
  const { prisma, rows } = fakePrisma([{ id: "a", balance: 1000 }, { id: "v", balance: 5000, isDisabled: true }]);
  await assert.rejects(holdGiftCardBalances(prisma, [{ id: "a", amount: 3000 }], "checkout:c1"), /balance changed/);
  await assert.rejects(holdGiftCardBalances(prisma, [{ id: "v", amount: 100 }], "checkout:c1"), /balance changed/);
  assert.equal(rows.get("a").balance, 1000);
});

test("the order records one gift-card transaction per card with the held amount", async () => {
  const { prisma, transactions } = fakePrisma([{ id: "a", balance: 5000 }]);
  await holdGiftCardBalances(prisma, [{ id: "a", amount: 2500 }], "checkout:c1");
  await linkGiftCardsToOrder(prisma, ["a"], "checkout:c1", "o1");
  await linkGiftCardsToOrder(prisma, ["a"], "checkout:c1", "o1");
  assert.deepEqual(transactions, [{ amount: 2500, giftCardId: "a", orderId: "o1" }]);
});

test("purchase input: fixed amounts, a valid email, and the buyer is the recipient unless someone else is named", () => {
  assert.throws(() => validatePurchase({ amount: 1234, purchaserName: "Ana", purchaserEmail: "ana@example.com" }), /amounts/);
  assert.throws(() => validatePurchase({ amount: 2500, purchaserName: "Ana", purchaserEmail: "nope" }), /email/);
  const self = validatePurchase({ amount: 2500, purchaserName: "Ana", purchaserEmail: "Ana@Example.com" });
  assert.equal(self.recipientEmail, "ana@example.com");
  assert.equal(self.recipientName, "Ana");
  const gift = validatePurchase({ amount: 5000, purchaserName: "Ana", purchaserEmail: "ana@example.com", recipientName: "Ben", recipientEmail: "ben@example.com", message: "Happy birthday" });
  assert.equal(gift.recipientEmail, "ben@example.com");
});

test("the email carries the code and amount, and escapes the buyer's message", () => {
  const mail = giftCardEmail({
    storeName: "Impossible Tees", code: "ABCD-1234-EF56", amount: 5000, currencyCode: "usd", purchaserName: "Ana", purchaserEmail: "ana@example.com",
    recipientName: "Ben", recipientEmail: "ben@example.com", message: "<b>hi</b>", endsAt: new Date("2027-11-06T12:00:00Z"), shopUrl: "https://shop.test/us/store",
  });
  assert.equal(mail.subject, "Ana sent you a $50.00 gift card for Impossible Tees");
  assert.match(mail.text, /ABCD-1234-EF56/);
  assert.match(mail.html, /&lt;b&gt;hi&lt;\/b&gt;/);
  assert.doesNotMatch(mail.html, /<b>hi<\/b>/);
});
