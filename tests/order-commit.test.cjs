// Order commit: guest vs account flag, and confirmation email delivery. Offline; mocks Prisma and mail.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(env, mail) {
  const filename = path.join(root, 'features/keystone/checkout/order-commit.ts');
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const module = { exports: {} };
  const mocks = {
    'node:crypto': { __esModule: true, default: require('node:crypto') },
    '../../webhooks/outbox': { enqueueWebhookOutbox: async () => [], subscribedWebhookEndpointIds: async () => [] },
    '../../webhooks/webhook-plugin': { deliverWebhookEventsById: async () => {} },
    '../lib/mail': { sendOrderConfirmationEmail: mail },
  };
  vm.runInNewContext(output, {
    module, exports: module.exports, process: { env }, Date, Math, Promise, Error, Object, Array, Number,
    console: { error() {}, warn() {}, log() {} },
    require: (s) => { if (!(s in mocks)) throw new Error(`Unmocked ${s}`); return mocks[s]; },
  }, { filename });
  return module.exports;
}

const T0 = '2026-11-02T10:00:00.000Z', T1 = '2026-11-02T10:05:00.000Z', T_OLD = '2026-01-01T00:00:00.000Z';
function cart(over = {}) {
  return {
    id: 'cart1', email: 'a@example.com', createdAt: T0, rawTotal: 100, metadata: {},
    region: { id: 'r', taxRate: 0, currency: { id: 'c', code: 'usd' } },
    billingAddress: { id: 'b' }, shippingAddress: { id: 's', country: { iso2: 'us' } },
    discounts: [], shippingMethods: [],
    lineItems: [{ id: 'l', quantity: 1, metadata: {}, unitPrice: '$1', total: '$1', productVariant: {
      id: 'v', sku: 's', title: 'V', prices: [], product: { id: 'p', title: 'P', thumbnail: null, description: null, metadata: {} } } }],
    ...over,
  };
}
const GUEST = { id: 'u1', hasAccount: false, createdAt: T1 };
const MEMBER = { id: 'u2', hasAccount: true, createdAt: T_OLD };

function env({ failTx = false, existing = false, smtp = true, mail } = {}) {
  const state = { orderData: null, notif: { id: 'n1', data: { orderId: 'o1', status: 'pending_delivery' } }, mailCalls: [] };
  const tx = {
    order: {
      findFirst: async () => (existing ? { id: 'o1' } : null),
      create: async ({ data }) => { if (failTx) throw new Error('tx boom'); state.orderData = data; return { id: 'o1', displayId: 1, email: data.email, status: 'pending' }; },
    },
    orderMoneyAmount: { create: async () => ({ id: 'm' }) },
    orderLineItem: { create: async () => ({ id: 'li', title: 'P', quantity: 1, sku: 's' }) },
    cart: { update: async () => ({}) },
    address: { findUnique: async () => null },
    notification: { create: async () => ({}) },
    $queryRaw: async () => [{ next: 1001 }],
  };
  const prisma = {
    $transaction: async (fn) => fn(tx),
    notification: {
      findFirst: async () => state.notif,
      updateMany: async ({ where, data }) => {
        if (state.notif.data.status !== where.data.equals) return { count: 0 };
        state.notif.data = data.data; return { count: 1 };
      },
      update: async ({ data }) => { state.notif.data = data.data; return {}; },
    },
    $queryRaw: undefined,
  };
  const sudo = { prisma, query: {
    MoneyAmount: { findMany: async () => [{ calculatedPrice: { calculatedAmount: 100, originalAmount: 100 } }] },
    Order: { findOne: async ({ query }) => ({ id: 'o1', secretKey: state.orderData?.secretKey ?? '', email: 'a@example.com', displayId: 1 }) },
    Cart: { findOne: async () => null },
  } };
  const send = mail || (async (order) => { state.mailCalls.push(order); return { sent: true }; });
  const mod = load(smtp ? { SMTP_HOST: 'smtp.test' } : {}, send);
  return { state, sudo, mod };
}

test('guest checkout: guest record is not linked, isGuestOrder true, secretKey set', async () => {
  const { state, sudo, mod } = env();
  await mod.createOrderFromCartAtomically(cart({ user: GUEST, shippingAddress: { id: 's', user: GUEST } }), sudo);
  assert.equal(state.orderData.userId, undefined);
  assert.equal(state.orderData.events.create.data.isGuestOrder, true);
  assert.match(state.orderData.secretKey, /^[0-9a-f]{64}$/);
});

test('signed-in checkout: linked, isGuestOrder false, no secretKey', async () => {
  const { state, sudo, mod } = env();
  await mod.createOrderFromCartAtomically(cart({ user: MEMBER, shippingAddress: { id: 's', user: MEMBER } }), sudo);
  assert.equal(state.orderData.userId, 'u2');
  assert.equal(state.orderData.events.create.data.isGuestOrder, false);
  assert.equal(state.orderData.secretKey, '');
});

test('legacy member (hasAccount false but account older than the cart) stays linked', () => {
  const { mod } = env();
  const r = mod.resolveOrderCustomer(cart({ user: { id: 'u3', hasAccount: false, createdAt: T_OLD } }));
  assert.deepEqual({ ...r }, { userId: 'u3', isGuest: false });
});

test('no customer at all is a guest', () => {
  const { mod } = env();
  assert.deepEqual({ ...mod.resolveOrderCustomer(cart()) }, { userId: undefined, isGuest: true });
});

test('confirmation email sent once on success and notification marked sent', async () => {
  const { state, sudo, mod } = env();
  await mod.createOrderFromCartAtomically(cart({ user: GUEST }), sudo);
  assert.equal(state.mailCalls.length, 1);
  assert.equal(state.notif.data.status, 'sent');
  assert.match(state.mailCalls[0].secretKey, /^[0-9a-f]{64}$/);
});

test('no email when the transaction fails', async () => {
  const { state, sudo, mod } = env({ failTx: true });
  await assert.rejects(mod.createOrderFromCartAtomically(cart({ user: GUEST }), sudo), /tx boom/);
  assert.equal(state.mailCalls.length, 0);
});

test('a mail throw or failure never fails the order', async () => {
  const thrown = env({ mail: async () => { throw new Error('smtp down'); } });
  await thrown.mod.createOrderFromCartAtomically(cart({ user: GUEST }), thrown.sudo);
  assert.equal(thrown.state.notif.data.status, 'failed');
  const failed = env({ mail: async () => ({ sent: false, error: 'bad' }) });
  await failed.mod.createOrderFromCartAtomically(cart({ user: GUEST }), failed.sudo);
  assert.equal(failed.state.notif.data.status, 'failed');
  assert.equal(failed.state.notif.data.error, 'bad');
});

test('replay of an existing order does not resend; a claimed notification is not resent', async () => {
  const replay = env({ existing: true });
  await replay.mod.createOrderFromCartAtomically(cart({ user: GUEST }), replay.sudo);
  assert.equal(replay.state.mailCalls.length, 0);
  const done = env();
  done.state.notif.data.status = 'sent';
  await done.mod.createOrderFromCartAtomically(cart({ user: GUEST }), done.sudo);
  assert.equal(done.state.mailCalls.length, 0);
});

test('SMTP not configured: no send, notification marked skipped', async () => {
  const { state, sudo, mod } = env({ smtp: false });
  await mod.createOrderFromCartAtomically(cart({ user: GUEST }), sudo);
  assert.equal(state.mailCalls.length, 0);
  assert.equal(state.notif.data.status, 'skipped_not_configured');
});
