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
  vm.runInNewContext(source, { module, exports: module.exports, require: n => n in mocks ? mocks[n] : require(n), process, Date, Number, Math, Map, Boolean, Array, Error, encodeURIComponent, String }, { filename: file });
  return module.exports;
}
const net = load('features/keystone/lib/orderNetPaid.ts');
const MSG = 'Order is fully refunded. Nothing left to fulfil.';

function run(payments, { replay = false, status = 'pending' } = {}) {
  const created = [];
  const tx = {
    fulfillment: {
      findFirst: async () => (replay ? { id: 'f-existing' } : null),
      create: async () => { created.push(1); return { id: 'f-new' }; },
    },
    order: { findUnique: async () => ({ status }) },
    payment: { findMany: async () => payments },
    orderLineItem: { findMany: async () => [{ id: 'l1', quantity: 1, metadata: {} }] },
    fulfillmentItem: { groupBy: async () => [] },
    notification: { create: async () => ({}) },
    orderEvent: { create: async () => ({}) },
    fulfillmentProvider: { findUnique: async () => ({ id: 'fp' }) },
  };
  const sudo = {
    query: { Order: { findOne: async () => ({ id: 'o1', user: { id: 'u1' } }) }, Fulfillment: { findOne: async ({ where }) => ({ id: where.id }) } },
    prisma: { $transaction: async fn => fn(tx) },
  };
  const mod = load('features/keystone/mutations/createOrderFulfillment.ts', {
    '../access': { permissions: { canManageFulfillments: () => true } },
    '../../webhooks/outbox': { enqueueWebhookOutbox: async () => [], subscribedWebhookEndpointIds: async () => [] },
    '../../webhooks/webhook-plugin': { deliverWebhookEventsById: async () => {} },
    '../orders/order-lifecycle': { reconcileOrderFulfillmentStatus: async () => {} },
    '../lib/orderNetPaid': net,
    '../lib/shopperError': { shopperError: (message, code) => Object.assign(new Error(message), { extensions: { code } }) },
  });
  const call = mod.default({}, { orderId: 'o1', lineItems: [{ lineItemId: 'l1', quantity: 1 }], idempotencyKey: 'k' }, { session: { itemId: 's' }, sudo: () => sudo });
  return { call, created };
}

test('helper: paid/refunded definition matches the order page', () => {
  const j = v => JSON.parse(JSON.stringify(v));
  assert.deepEqual(j(net.computeNetPaid([])), { paidCents: 0, refundedCents: 0 });
  assert.deepEqual(j(net.computeNetPaid([{ amount: 1000, amountRefunded: 400, status: 'partially_refunded' }, { amount: 500, amountRefunded: 0, status: 'pending' }])), { paidCents: 1000, refundedCents: 400 });
  assert.equal(net.isFullyRefunded({ paidCents: 1000, refundedCents: 1000 }), true);
  assert.equal(net.isFullyRefunded({ paidCents: 0, refundedCents: 0 }), false);
});
test('guard: fully refunded is blocked and nothing is created', async () => {
  const { call, created } = run([{ amount: 1000, amountRefunded: 1000, status: 'refunded' }]);
  await assert.rejects(call, { message: MSG });
  assert.equal(created.length, 0);
});
test('guard: partially refunded is allowed', async () => {
  const { call, created } = run([{ amount: 1000, amountRefunded: 400, status: 'partially_refunded' }]);
  await call;
  assert.equal(created.length, 1);
});
test('guard: no payments is allowed', async () => {
  const { call, created } = run([]);
  await call;
  assert.equal(created.length, 1);
});
test('guard: captured is allowed', async () => {
  const { call, created } = run([{ amount: 1000, amountRefunded: 0, status: 'captured' }]);
  await call;
  assert.equal(created.length, 1);
});
test('guard: idempotent replay still returns on a fully refunded order', async () => {
  const { call, created } = run([{ amount: 1000, amountRefunded: 1000, status: 'refunded' }], { replay: true });
  const res = await call;
  assert.ok(res);
  assert.equal(created.length, 0);
});

test('guard: carrier without a tracking number is a readable, user-facing error', async () => {
  const mod = load('features/keystone/mutations/createOrderFulfillment.ts', {
    '../access': { permissions: { canManageFulfillments: () => true } },
    '../../webhooks/outbox': { enqueueWebhookOutbox: async () => [], subscribedWebhookEndpointIds: async () => [] },
    '../../webhooks/webhook-plugin': { deliverWebhookEventsById: async () => {} },
    '../orders/order-lifecycle': { reconcileOrderFulfillmentStatus: async () => {} },
    '../lib/orderNetPaid': net,
    '../lib/shopperError': { shopperError: (message, code) => Object.assign(new Error(message), { extensions: { code } }) },
  });
  const call = mod.default({}, { orderId: 'o1', lineItems: [{ lineItemId: 'l1', quantity: 1 }], trackingNumber: 'T1', idempotencyKey: 'k' }, { session: { itemId: 's' }, sudo: () => ({}) });
  await assert.rejects(call, (e) => e.extensions?.code === 'FULFILLMENT_TRACKING_INCOMPLETE' && /carrier/i.test(e.message));
});
