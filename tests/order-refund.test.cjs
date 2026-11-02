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
  vm.runInNewContext(source, { module, exports: module.exports, require: name => name in mocks ? mocks[name] : require(name), process, Date, Number, Math }, { filename: file });
  return module.exports;
}
const idempotency = load('features/keystone/utils/idempotency.ts');
function fixture({ amount = 3940, refunded = 0, allowed = true, status = 'captured', providerFails = false } = {}) {
  const attempts = new Map(), refunds = [], events = [], outbox = [];
  let calls = 0;
  const payment = { id: 'p1', amount, amountRefunded: refunded, status, currencyCode: 'USD', order: { id: 'o1' }, data: { payment_intent_id: 'pi_test' }, refunds: [], paymentCollection: { paymentSessions: [{ isSelected: true, paymentProvider: { id: 'stripe', code: 'pp_stripe_stripe' } }] } };
  const prisma = {
    idempotencyKey: {
      findUnique: async ({where}) => attempts.get(where.idempotencyKey) || null,
      create: async ({data}) => {
        if (attempts.has(data.idempotencyKey)) throw Object.assign(new Error('duplicate'), {code:'P2002'});
        const row = {...data, id: `a${attempts.size}`, createdAt: new Date()}; attempts.set(data.idempotencyKey, row); return {...row};
      },
      update: async ({where,data}) => { const row = [...attempts.values()].find(a => a.id === where.id); Object.assign(row,data); return {...row}; },
      updateMany: async ({where,data}) => { const row = [...attempts.values()].find(a => a.id === where.id); if (row.lockedAt && new Date(row.lockedAt) >= where.OR[1].lockedAt.lt) return {count:0}; Object.assign(row,data); return {count:1}; },
    },
    payment: { updateMany: async ({where,data}) => { if (payment.amountRefunded > where.amountRefunded.lte) return {count:0}; payment.amountRefunded += data.amountRefunded.increment; return {count:1}; } },
    refund: { findFirst: async ({where}) => refunds.find(r => r.idempotencyKey === where.idempotencyKey), create: async ({data}) => { if ('paymentId' in data || 'createdById' in data || data.payment?.connect?.id !== 'p1') throw new Error('Unknown argument `paymentId`'); const r = {...data,id:`r${refunds.length}`}; refunds.push(r); payment.refunds.push(r); return r; } },
    orderEvent: { create: async ({data}) => { events.push(data); return data; } },
  };
  prisma.$transaction = async fn => fn(prisma);
  const context = { session: { itemId:'demo', data: {email:'impossible@openship.org'} }, prisma,
    query: { Payment: {findOne: async () => JSON.parse(JSON.stringify(payment))}, Refund: {findOne: async ({where}) => refunds.find(r => r.id === where.id)} }
  };
  context.sudo = () => context;
  const fn = load('features/keystone/mutations/refundOrderPayment.ts', {
    '../access': {permissions: {canManagePayments: () => allowed, canManageReturns: () => allowed}},
    '../utils/idempotency': idempotency,
    '../utils/paymentProviderAdapter': {refundPayment: async input => { calls++; if(providerFails) throw new Error('network outcome unknown'); return {status:'succeeded',amount:input.amount,currency:'USD',data:{id:'re_test'}}; }},
    '../../webhooks/outbox': {subscribedWebhookEndpointIds: async () => ['endpoint'], enqueueWebhookOutbox: async (...args) => { outbox.push(args); }},
  }).default;
  const args = {orderId:'o1',paymentId:'p1',amount:3940,reason:'Customer request',idempotencyKey:'request1'};
  return {run: overrides => fn(null,{...args,...overrides},context), payment, refunds, events, outbox, attempts, calls:()=>calls};
}

test('full refund uses the provider, preserves reason and records audit/outbox without a return', async () => {
  const f = fixture(); await f.run();
  assert.equal(f.calls(),1); assert.equal(f.refunds.length,1); assert.equal(f.refunds[0].amount,3940);
  assert.equal(f.refunds[0].note,'Customer request'); assert.equal(f.payment.amountRefunded,3940);
  assert.equal(f.events[0].type,'REFUND_PROCESSED'); assert.equal(f.outbox.length,1);
});
test('partial amount is capped at captured minus already-refunded/reserved', async () => {
  const f = fixture({refunded:1000}); await assert.rejects(f.run({amount:2941}),/exceeds/); assert.equal(f.calls(),0);
  await f.run({amount:2940}); assert.equal(f.payment.amountRefunded,3940);
});
test('same request retry and double-click cannot call provider or refund twice', async () => {
  const f = fixture(); const results = await Promise.allSettled([f.run(),f.run()]);
  assert.ok(results.some(r=>r.status==='fulfilled')); assert.equal(f.calls(),1); assert.equal(f.refunds.length,1);
  await f.run(); assert.equal(f.calls(),1); assert.equal(f.refunds.length,1);
});
test('different keys racing the full balance cannot over-refund', async () => {
  const f = fixture(); await Promise.allSettled([f.run(),f.run({idempotencyKey:'request2'})]);
  assert.equal(f.calls(),1); assert.equal(f.refunds.length,1); assert.equal(f.payment.amountRefunded,3940);
});
test('replay with changed amount/reason is refused', async () => {
  const f = fixture(); await f.run(); await assert.rejects(f.run({reason:'Changed'}),/different request/); await assert.rejects(f.run({amount:1}),/different request/); assert.equal(f.calls(),1);
});
test('permission, order/payment binding, captured state, amount and reason are enforced before provider calls', async () => {
  const no = fixture({allowed:false}); await assert.rejects(no.run(),/Access denied/);
  const f = fixture(); for(const args of [{orderId:'other'},{amount:0},{amount:-1},{amount:1.5},{amount:3941},{reason:''}]) await assert.rejects(f.run(args));
  const pending = fixture({status:'pending'}); await assert.rejects(pending.run(),/captured/); assert.equal(f.calls(),0); assert.equal(pending.calls(),0);
});
test('unknown provider outcome retains reservation and key, never fabricates a refund', async () => {
  const f = fixture({providerFails:true}); await assert.rejects(f.run(),/unknown/);
  assert.equal(f.refunds.length,0); assert.equal(f.payment.amountRefunded,3940);
  await assert.rejects(f.run({idempotencyKey:'new'}),/exceeds/); assert.equal(f.calls(),1);
});

const code = p => p.then(() => assert.fail('expected rejection'), e => e.extensions?.code);
test('operator-facing refund rules are coded GraphQLErrors Yoga will not mask', async () => {
  assert.equal(await code(fixture().run({amount:3941})), 'REFUND_EXCEEDS_BALANCE');
  assert.equal(await code(fixture({status:'pending'}).run()), 'PAYMENT_NOT_CAPTURED');
  const racing = fixture(); const [a, b] = await Promise.allSettled([racing.run(), racing.run({idempotencyKey:'other'})]);
  const rejected = [a, b].find(r => r.status === 'rejected');
  assert.ok(['REFUND_EXCEEDS_BALANCE', 'REFUND_IN_PROGRESS'].includes(rejected.reason.extensions?.code));
});
test('dashboard shows coded refund messages and the Refund row connects the payment relation', () => {
  const sec = load('features/dashboard/lib/security.ts');
  const err = {response:{errors:[{message:'Refund exceeds captured payment amount',extensions:{code:'REFUND_EXCEEDS_BALANCE'}}]}};
  assert.equal(sec.publicGraphQLErrorMessage(err), 'Refund exceeds captured payment amount');
  assert.doesNotMatch(fs.readFileSync(path.join(root,'features/platform/orders/components/RefundOrderDialog.tsx'),'utf8'), /rounded-full bg-muted/);
});

test('replay of an attempt that already holds a provider result finalizes without a second provider call', async () => {
  const f = fixture(); await f.run();
  const row = f.attempts.get('refund:request1'); f.refunds.length = 0; f.payment.refunds.length = 0;
  row.recoveryPoint = 'completed'; row.responseBody = {providerResult:{status:'succeeded',amount:3940,currency:'USD',data:{id:'re_test'}}};
  await f.run(); assert.equal(f.calls(),1); assert.equal(f.refunds.length,1);
});
