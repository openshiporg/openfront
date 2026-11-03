// read_orders (canReadOrders) may read every order but never write one: Order
// create/update/delete stay closed, and the order write mutations still demand
// their own manage permissions.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(rel, mocks) {
  const mod = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { module: mod, exports: mod.exports, require: (id) => (id in mocks ? mocks[id] : stub), process, console });
  return mod.exports;
}
// Field/graphql helpers are irrelevant to access; any call returns an inert stub.
const stub = new Proxy(function () {}, { get: (t, k) => (k === '__esModule' ? false : stub), apply: () => stub });

const role = (r) => ({ itemId: 'staff1', data: { role: r } });
const readOnly = role({ canReadOrders: true });
const manager = role({ canReadOrders: true, canManageOrders: true });
const nobody = role({});
const has = (k) => ({ session }) => Boolean(session?.data?.role?.[k]);
const permissions = new Proxy({}, { get: (_, k) => has(k) });

const { Order } = load('features/keystone/models/Order.ts', {
  '@keystone-6/core': { list: (c) => c, graphql: stub, group: (c) => c.fields },
  '../access': { permissions },
});
const op = Order.access.operation;
const filter = Order.access.filter;

test('read_orders can query every order', () => {
  assert.equal(Boolean(op.query({ session: readOnly })), true);
  assert.equal(filter.query({ session: readOnly }), true);
});

test('read_orders cannot create, update or delete an order', () => {
  for (const name of ['create', 'update', 'delete']) {
    assert.equal(op[name]({ session: readOnly }), false, name);
    assert.equal(op[name]({ session: manager }), false, `${name} (generic CRUD closed for everyone)`);
  }
  for (const name of ['update', 'delete']) assert.ok(!filter[name] || filter[name]({ session: readOnly }) !== true, name);
});

test('a role without order permissions reads nothing', () => {
  assert.equal(Boolean(op.query({ session: nobody })), false);
  assert.equal(filter.query({ session: nobody }), false);
});

test('a customer token still sees only its own orders', () => {
  const customer = { itemId: 'c1', customerToken: 't', data: { role: null } };
  assert.deepEqual(JSON.parse(JSON.stringify(filter.query({ session: customer }))), { user: { id: { equals: 'c1' } } });
});

test('order write mutations refuse a read-only session before touching data', async () => {
  const context = { session: readOnly, sudo: () => { throw new Error('reached data'); }, prisma: new Proxy({}, { get: () => { throw new Error('reached data'); } }) };
  const cases = {
    'features/keystone/mutations/transitionOrderStatus.ts': {},
    'features/keystone/mutations/refundOrderPayment.ts': { paymentId: 'p1', amount: 1, idempotencyKey: 'k' },
    'features/keystone/mutations/createOrderFulfillment.ts': { orderId: 'o1', lineItems: [{ lineItemId: 'l1', quantity: 1 }], idempotencyKey: 'k' },
    'features/keystone/mutations/cancelOrderFulfillment.ts': { fulfillmentId: 'f1' },
  };
  for (const [file, args] of Object.entries(cases)) {
    const mod = load(file, { '../access': { permissions } });
    const fn = typeof mod.default === 'function' ? mod.default : Object.values(mod).find((v) => typeof v === 'function');
    await assert.rejects(() => fn(null, { reason: 'x', ...args }, context), /Access denied/, file);
  }
});
