// Money rules from the 2026-11 audit: cart discount/tax maths, refund release on a provider refusal,
// multi-item cart updates, duplicate capture events. Offline; mocks Keystone and Prisma.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, mocks = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require: name => name in mocks ? mocks[name] : require(name), process, Date, Number, Math, Set, Promise, String, Object, Array, Intl, console: { log() {}, error() {} } }, { filename: file });
  return module.exports;
}
const anything = new Proxy(function () {}, { get: () => anything, apply: (_t, _s, args) => args[0] ?? anything });

// ---------------------------------------------------------------- cart money
const cartModel = load('features/keystone/models/Cart.ts', {
  '@keystone-6/core': { graphql: anything, group: anything, list: x => x },
  '@keystone-6/core/access': anything, '@keystone-6/core/fields': anything,
  '../access': { permissions: anything }, '../lib/cart-owner': anything, './trackingFields': { trackingFields: {} },
  '../lib/gift-cards': anything,
});
function cartContext({ lines, discounts = [], shipping = 0, taxRate = 0 }) {
  const cart = {
    region: { id: 'r', taxRate, currency: { code: 'usd', noDivisionCurrency: false } },
    lineItems: lines.map((l, i) => ({ id: `l${i}`, quantity: l.quantity || 1, productVariant: { id: `v${i}`, product: { id: l.product || `p${i}`, discountable: l.discountable !== false } } })),
    discounts: discounts.map((d, i) => ({ id: `d${i}`, discountRule: { type: d.type, value: d.value, allocation: d.allocation || 'total', discountConditions: d.products ? [{ type: 'products', operator: 'in', products: d.products.map(id => ({ id })) }] : [] } })),
    shippingMethods: shipping ? [{ price: shipping }] : [],
  };
  const context = { query: {
    Cart: { findOne: async () => cart },
    MoneyAmount: { findMany: async ({ where }) => [{ calculatedPrice: { calculatedAmount: lines[Number(where.productVariant.id.equals.slice(1))].price } }] },
  } };
  context.sudo = () => context;
  return context;
}
const money = input => cartModel.cartMoneyBreakdown('c', cartContext(input));

test('a fixed code limited to some products never gives more than those products cost', async () => {
  const m = await money({ lines: [{ price: 1000, product: 'A' }, { price: 10000, product: 'B' }], discounts: [{ type: 'fixed', value: 50, products: ['A'] }] });
  assert.equal(m.discount, 1000); assert.equal(m.total, 10000);
  const nonDiscountable = await money({ lines: [{ price: 1000 }, { price: 10000, discountable: false }], discounts: [{ type: 'fixed', value: 50 }] });
  assert.equal(nonDiscountable.discount, 1000);
  const perItem = await money({ lines: [{ price: 300, quantity: 3 }], discounts: [{ type: 'fixed', value: 5, allocation: 'item' }] });
  assert.equal(perItem.discount, 900);
  const whole = await money({ lines: [{ price: 3000 }], discounts: [{ type: 'fixed', value: 50 }] });
  assert.equal(whole.discount, 3000); assert.equal(whole.total, 0);
});
test('a free-shipping code waives shipping and leaves the tax on the goods alone', async () => {
  const m = await money({ lines: [{ price: 10000 }], discounts: [{ type: 'free_shipping' }], shipping: 1000, taxRate: 0.1 });
  assert.deepEqual({ ...m }, { subtotal: 10000, discount: 0, shippingDiscount: 1000, shipping: 1000, tax: 1000, total: 11000 });
});
test('percentage and tax still add up to the total', async () => {
  const m = await money({ lines: [{ price: 10000, quantity: 2 }], discounts: [{ type: 'percentage', value: 50 }], shipping: 500, taxRate: 0.08 });
  assert.deepEqual({ ...m }, { subtotal: 20000, discount: 10000, shippingDiscount: 0, shipping: 500, tax: 800, total: 11300 });
});

// ---------------------------------------------------------------- refunds
const idempotency = load('features/keystone/utils/idempotency.ts');
function refundFixture(file, providerError) {
  const attempts = new Map(), refunds = [];
  let calls = 0, fail = true;
  const payment = { id: 'p1', amount: 8000, amountRefunded: 0, status: 'captured', currencyCode: 'USD', order: { id: 'o1' }, data: { payment_intent_id: 'pi_1' }, refunds: [], paymentCollection: { paymentSessions: [{ isSelected: true, paymentProvider: { id: 'stripe', code: 'pp_stripe_stripe' } }] } };
  const ret = { id: 'ret1', status: 'requested', refundAmount: 8000, metadata: {}, order: { id: 'o1', payments: [{ id: 'p1' }] } };
  const find = where => [...attempts.values()].find(a => a.id === where.id);
  const prisma = {
    idempotencyKey: {
      findUnique: async ({ where }) => attempts.get(where.idempotencyKey) || null,
      create: async ({ data }) => { const row = { ...data, id: `a${attempts.size}`, createdAt: new Date() }; attempts.set(data.idempotencyKey, row); return { ...row }; },
      update: async ({ where, data }) => { Object.assign(find(where), data); return { ...find(where) }; },
      updateMany: async ({ where, data }) => { const row = find(where); if (row.lockedAt && new Date(row.lockedAt) >= where.OR[1].lockedAt.lt) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    },
    payment: {
      findUnique: async () => ({ amount: payment.amount, amountRefunded: payment.amountRefunded }),
      update: async ({ data }) => Object.assign(payment, data),
      updateMany: async ({ where, data }) => {
        if (where.amountRefunded.lte !== undefined && payment.amountRefunded > where.amountRefunded.lte) return { count: 0 };
        if (where.amountRefunded.gte !== undefined && payment.amountRefunded < where.amountRefunded.gte) return { count: 0 };
        payment.amountRefunded += (data.amountRefunded.increment || 0) - (data.amountRefunded.decrement || 0);
        return { count: 1 };
      },
    },
    refund: { findFirst: async ({ where }) => refunds.find(r => r.idempotencyKey === where.idempotencyKey), create: async ({ data }) => { const r = { ...data, id: `r${refunds.length}` }; refunds.push(r); return r; } },
    return: { updateMany: async () => ({ count: 1 }) },
    orderEvent: { create: async () => ({}) },
  };
  prisma.$transaction = async fn => fn(prisma);
  const context = { session: { itemId: 'staff' }, prisma, query: { Payment: { findOne: async () => JSON.parse(JSON.stringify(payment)) }, Return: { findOne: async () => ret } }, db: { Refund: { findOne: async ({ where }) => refunds.find(r => r.id === where.id) } } };
  context.sudo = () => context;
  const fn = load(file, {
    '../access': { permissions: { canManagePayments: () => true, canManageReturns: () => true } },
    '../lib/state-machines': { RETURN_REFUNDABLE: ['requested', 'requires_action'] },
    '../utils/idempotency': idempotency,
    '../utils/orderStatusTransition': {},
    '../utils/paymentProviderAdapter': { refundPayment: async input => { calls++; if (fail) throw providerError; return { status: 'succeeded', amount: input.amount, currency: 'USD', id: 're_1', data: { id: 're_1' } }; } },
    '../../webhooks/outbox': { subscribedWebhookEndpointIds: async () => [], enqueueWebhookOutbox: async () => {} },
  }).default;
  return { fn, context, payment, refunds, attempts, calls: () => calls, succeedNext: () => { fail = false; } };
}
const refused = Object.assign(new Error('Error executing refundPaymentFunction'), { cause: { statusCode: 400, message: 'Insufficient funds in Stripe account' } });
const unknown = Object.assign(new Error('Error executing refundPaymentFunction'), { cause: { statusCode: 500 } });

test('a refund the provider refuses gives the amount back and can be sent again', async () => {
  const f = refundFixture('features/keystone/mutations/refundOrderPayment.ts', refused);
  const args = { orderId: 'o1', paymentId: 'p1', amount: 8000, reason: 'Customer request', idempotencyKey: 'k1' };
  const error = await f.fn(null, args, f.context).then(() => null, e => e);
  assert.equal(error.extensions.code, 'REFUND_DECLINED');
  assert.equal(f.payment.amountRefunded, 0); assert.equal(f.refunds.length, 0);
  f.succeedNext();
  await f.fn(null, { ...args, idempotencyKey: 'k2' }, f.context);
  assert.equal(f.payment.amountRefunded, 8000); assert.equal(f.refunds.length, 1); assert.equal(f.payment.status, 'refunded');
});
test('the same key can be retried after a refusal without reserving twice', async () => {
  const f = refundFixture('features/keystone/mutations/refundOrderPayment.ts', refused);
  const args = { orderId: 'o1', paymentId: 'p1', amount: 8000, reason: 'Customer request', idempotencyKey: 'k1' };
  await assert.rejects(f.fn(null, args, f.context));
  f.succeedNext();
  await f.fn(null, args, f.context);
  assert.equal(f.payment.amountRefunded, 8000); assert.equal(f.refunds.length, 1);
});
test('an unknown provider outcome keeps the amount reserved', async () => {
  const f = refundFixture('features/keystone/mutations/refundOrderPayment.ts', unknown);
  await assert.rejects(f.fn(null, { orderId: 'o1', paymentId: 'p1', amount: 8000, reason: 'x', idempotencyKey: 'k1' }, f.context));
  assert.equal(f.payment.amountRefunded, 8000);
});
test('a return refund the provider refuses gives the amount back', async () => {
  const f = refundFixture('features/keystone/mutations/processReturnRefund.ts', refused);
  const args = { returnId: 'ret1', paymentId: 'p1', idempotencyKey: 'return-refund:ret1' };
  const error = await f.fn(null, args, f.context).then(() => null, e => e);
  assert.equal(error.extensions.code, 'REFUND_DECLINED'); assert.equal(f.payment.amountRefunded, 0);
  f.succeedNext();
  await f.fn(null, args, f.context);
  assert.equal(f.payment.amountRefunded, 8000); assert.equal(f.refunds.length, 1);
});

// ---------------------------------------------------------------- cart update
test('adding several items in one update keeps the new ones when one is already in the cart', async () => {
  const raw = [], updates = [];
  const context = {
    graphql: { raw: async input => { raw.push(input.variables); return {}; } },
    query: { Cart: { findOne: async () => ({ id: 'c', lineItems: [{ id: 'lx', quantity: 1, productVariant: { id: 'X' } }] }) } },
    db: { Cart: { updateOne: async input => { updates.push(input); return { id: 'c' }; } } },
  };
  context.sudo = () => context;
  const fn = load('features/keystone/mutations/updateActiveCart.ts', {
    '../lib/shopperError': { shopperError: m => new Error(m) },
    '../security/cart-access': { assertAddressAccess: async () => {}, assertCartAccess: async () => {}, assertLineItemBelongsToCart: async () => {} },
  }).default;
  const item = id => ({ quantity: 1, productVariant: { connect: { id } } });
  await fn(null, { cartId: 'c', data: { lineItems: { create: [item('X'), item('Y')] } } }, context);
  assert.deepEqual(raw.map(v => ({ ...v })), [{ cartId: 'c', lineId: 'lx', quantity: 2 }]);
  assert.equal(updates[0].data.lineItems.create.length, 1);
  assert.equal(updates[0].data.lineItems.create[0].productVariant.connect.id, 'Y');
  await fn(null, { cartId: 'c', data: { lineItems: { create: [item('X')] } } }, context);
  assert.equal(updates[1].data.lineItems, undefined);
});

// ---------------------------------------------------------------- provider webhook
test('a capture event for a payment checkout already captured adds no second capture', async () => {
  const captures = [], events = [], keys = new Map();
  const payment = { id: 'p1', status: 'captured', amount: 8000, currencyCode: 'usd' };
  const tx = {
    idempotencyKey: { findUnique: async ({ where }) => keys.get(where.idempotencyKey) || null, create: async ({ data }) => { const row = { ...data, id: 'k1' }; keys.set(data.idempotencyKey, row); return row; }, update: async ({ data }) => Object.assign(keys.values().next().value, data), updateMany: async () => ({ count: 1 }) },
    payment: { findUnique: async () => ({ ...payment }), update: async ({ data }) => Object.assign(payment, data) },
    capture: { findFirst: async () => null, create: async ({ data }) => captures.push(data) },
    orderEvent: { create: async ({ data }) => events.push(data) },
    order: { findUnique: async () => ({ status: 'pending' }), update: async () => ({}) },
  };
  tx.$transaction = async fn => fn(tx);
  const provider = { id: 'prov', code: 'pp_stripe_stripe', isInstalled: true, handleWebhookFunction: 'stripe' };
  const context = { prisma: tx, query: {
    PaymentProvider: { findOne: async () => provider, findMany: async () => [provider] },
    Cart: { findOne: async () => ({ id: 'c1', rawTotal: 8000, region: { currency: { code: 'usd' } }, paymentCollection: { paymentSessions: [] }, order: { id: 'o1', payments: [{ id: 'p1', paymentCollection: { paymentSessions: [{ isSelected: true, paymentProvider: { id: 'prov' } }] } }] } }) },
  } };
  context.sudo = () => context;
  const fn = load('features/keystone/mutations/handlePaymentProviderWebhook.ts', {
    '../utils/paymentProviderAdapter': { handleWebhook: async () => ({ isValid: true, type: 'payment_intent.succeeded', event: { id: 'evt_1' }, resource: { id: 'pi_1', amount: 8000, amount_received: 8000, currency: 'usd', metadata: { cartId: 'c1' } } }) },
    '../orders/order-lifecycle': { reconcileOrderFulfillmentStatus: async () => {} },
    '../lib/state-machines': load('features/keystone/lib/state-machines.ts'),
  }).default;
  const result = await fn(null, { providerId: 'prov', providerCode: 'pp_stripe_stripe', event: {}, headers: {} }, context);
  assert.equal(result.success, true);
  assert.equal(captures.length, 0); assert.equal(events.length, 0); assert.equal(payment.status, 'captured');
});
