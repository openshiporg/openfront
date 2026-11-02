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
  vm.runInNewContext(source, { module, exports: module.exports, require: name => name in mocks ? mocks[name] : require(name), process, Date, Number, Math, Set, Promise, String }, { filename: file });
  return module.exports;
}
const outboxMock = { subscribedWebhookEndpointIds: async () => [], enqueueWebhookOutbox: async () => {} };
const transitionLib = load('features/keystone/utils/orderStatusTransition.ts', { '../../webhooks/outbox': outboxMock });
const idempotency = load('features/keystone/utils/idempotency.ts');

function fixture({ amount = 5000, transitionFails = false } = {}) {
  const attempts = new Map(), refunds = [], events = [];
  const variant = { id: 'v1', manageInventory: true, inventoryQuantity: 0 };
  const order = { id: 'o1', status: 'completed' };
  const stockMovements = [];
  const payment = { id: 'p1', amount, amountRefunded: 0, status: 'captured', currencyCode: 'USD', order: { id: 'o1' }, data: { payment_intent_id: 'pi_test' }, refunds: [], paymentCollection: { paymentSessions: [{ isSelected: true, paymentProvider: { id: 'stripe', code: 'pp_stripe_stripe' } }] } };
  const prisma = {
    idempotencyKey: {
      findUnique: async ({ where }) => attempts.get(where.idempotencyKey) || null,
      create: async ({ data }) => { const row = { ...data, id: `a${attempts.size}`, createdAt: new Date() }; attempts.set(data.idempotencyKey, row); return { ...row }; },
      update: async ({ where, data }) => { const row = [...attempts.values()].find(a => a.id === where.id); Object.assign(row, data); return { ...row }; },
      updateMany: async ({ where, data }) => { const row = [...attempts.values()].find(a => a.id === where.id); Object.assign(row, data); return { count: 1 }; },
    },
    payment: {
      updateMany: async ({ where, data }) => { if (payment.amountRefunded > where.amountRefunded.lte) return { count: 0 }; payment.amountRefunded += data.amountRefunded.increment; return { count: 1 }; },
      findMany: async () => [{ status: payment.status, amount: payment.amount, refunds: payment.refunds.map(r => ({ amount: r.amount })) }],
      findUnique: async () => ({ amount: payment.amount, amountRefunded: payment.amountRefunded }),
      update: async ({ data }) => { Object.assign(payment, data); return payment; },
    },
    refund: {
      findFirst: async ({ where }) => refunds.find(r => r.idempotencyKey === where.idempotencyKey),
      create: async ({ data }) => { const r = { ...data, id: `r${refunds.length}` }; refunds.push(r); payment.refunds.push(r); return r; },
      update: async ({ where, data }) => { Object.assign(refunds.find(r => r.id === where.id), data); return {}; },
    },
    orderEvent: { create: async ({ data }) => { events.push(data); return data; } },
    order: {
      findUnique: async () => ({
        ...order,
        payments: [{ id: 'p1', status: payment.status, amount: payment.amount, amountRefunded: payment.amountRefunded, refunds: payment.refunds.map(r => ({ amount: r.amount })) }],
        fulfillments: [], accountLineItems: [], discounts: [],
        lineItems: [{ quantity: 1, productVariant: { id: 'v1', manageInventory: true } }],
      }),
      update: async ({ data }) => { if (transitionFails) throw new Error('db down'); Object.assign(order, data); return order; },
    },
    productVariant: { update: async ({ data }) => { variant.inventoryQuantity += data.inventoryQuantity.increment; return variant; } },
    stockMovement: {
      create: async ({ data }) => { stockMovements.push(data); return data; },
      findFirst: async ({ where }) => stockMovements.find(m => m.variantId === where.variantId && m.reason === where.reason && m.note === where.note) || null,
    },
    discount: { updateMany: async () => ({ count: 0 }) },
  };
  prisma.$transaction = async fn => fn(prisma);
  const context = { session: { itemId: 'admin' }, prisma, query: {
    Refund: { findOne: async ({ where }) => refunds.find(r => r.id === where.id) },
    Order: { findOne: async () => ({ id: 'o1', status: order.status }) },
  } };
  context.sudo = () => context;
  context.query.Payment = { findOne: async () => JSON.parse(JSON.stringify(payment)) };
  const refundFn = load('features/keystone/mutations/refundOrderPayment.ts', {
    '../access': { permissions: { canManagePayments: () => true, canManageReturns: () => true, canManageOrders: () => true } },
    '../utils/idempotency': idempotency,
    '../utils/orderStatusTransition': transitionLib,
    '../utils/paymentProviderAdapter': { refundPayment: async input => ({ status: 'succeeded', amount: input.amount, currency: 'USD', data: { id: 're_test' } }) },
    '../../webhooks/outbox': outboxMock,
  }).default;
  const transitionFn = load('features/keystone/mutations/transitionOrderStatus.ts', {
    '../access': { permissions: { canManageOrders: () => true } },
    '../utils/orderStatusTransition': transitionLib,
  }).default;
  const base = { orderId: 'o1', paymentId: 'p1', amount: amount, reason: 'Customer request', idempotencyKey: 'k1' };
  return {
    refund: o => refundFn(null, { ...base, ...o }, context),
    cancel: () => transitionFn(null, { orderId: 'o1', status: 'canceled', reason: 'again' }, context),
    variant, order, stockMovements, refunds, payment,
  };
}

test('full refund + restock adds the quantity once, one movement, cancels the order', async () => {
  const f = fixture();
  const r = await f.refund({ restock: true });
  assert.equal(f.variant.inventoryQuantity, 1);
  assert.equal(f.stockMovements.length, 1); assert.equal(f.stockMovements[0].type, 'RECEIVE'); assert.equal(f.stockMovements[0].note, 'order:o1');
  assert.equal(f.order.status, 'canceled');
  assert.equal(r.metadata.restock.restocked, true);
});
test('a later manual cancel is a no-op: no second movement, variant unchanged', async () => {
  const f = fixture(); await f.refund({ restock: true }); await f.cancel();
  assert.equal(f.variant.inventoryQuantity, 1); assert.equal(f.stockMovements.length, 1);
});
test('replaying the refund request does not restock again', async () => {
  const f = fixture(); await f.refund({ restock: true }); await f.refund({ restock: true });
  assert.equal(f.refunds.length, 1); assert.equal(f.variant.inventoryQuantity, 1); assert.equal(f.stockMovements.length, 1);
});
test('a cancel that re-enters the path after a restock cannot increment twice (movement marker)', async () => {
  const f = fixture(); await f.refund({ restock: true });
  f.order.status = 'completed';
  await f.cancel();
  assert.equal(f.variant.inventoryQuantity, 1); assert.equal(f.stockMovements.length, 1);
});
test('manual cancel with no refund-restock still restocks once', async () => {
  const f = fixture(); await f.refund({});
  assert.equal(f.variant.inventoryQuantity, 0);
  await f.cancel(); await f.cancel();
  assert.equal(f.variant.inventoryQuantity, 1); assert.equal(f.stockMovements.length, 1); assert.equal(f.order.status, 'canceled');
});
test('restock false (and the default) leaves stock unchanged', async () => {
  for (const o of [{ restock: false }, {}]) {
    const f = fixture(); await f.refund(o);
    assert.equal(f.variant.inventoryQuantity, 0); assert.equal(f.stockMovements.length, 0); assert.equal(f.order.status, 'completed');
  }
});
test('partial refund never restocks, even when asked', async () => {
  const f = fixture(); const r = await f.refund({ amount: 1000, restock: true });
  assert.equal(f.variant.inventoryQuantity, 0); assert.equal(f.order.status, 'completed');
  assert.equal(r.metadata.restock.restocked, false);
});
test('restock failure keeps the refund and reports the reason', async () => {
  const f = fixture({ transitionFails: true });
  const r = await f.refund({ restock: true });
  assert.equal(f.refunds.length, 1); assert.equal(f.payment.amountRefunded, 5000);
  assert.equal(r.metadata.restock.restocked, false); assert.match(r.metadata.restock.reason, /db down/);
});
test('dialog: checkbox only when the amount fully refunds, checked by default, sent as restock', () => {
  const src = fs.readFileSync(path.join(root, 'features/platform/orders/components/RefundOrderDialog.tsx'), 'utf8');
  assert.match(src, /useState\(true\)/); assert.match(src, /bringsFullyRefunded && <div/);
  assert.match(src, /Return items to stock/); assert.match(src, /restock: bringsFullyRefunded && restock/);
  assert.match(src, /Items were not returned to stock/);
  assert.match(src, /^'use client'/);
});
