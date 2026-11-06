const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const module_ = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(path.join(root, 'features/keystone/lib/state-machines.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(module_, module_.exports);
const sm = module_.exports;

test('payments: captured money is only refunded, never failed or canceled by a late event', () => {
  for (const to of ['pending', 'failed', 'canceled', 'authorized']) assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'captured', to), false, to);
  assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'captured', 'partially_refunded'), true);
  assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'refunded', 'captured'), false);
  assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'failed', 'captured'), true);
  assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'canceled', 'captured'), false);
});
test('same-state writes are idempotent; unknown states are refused', () => {
  assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'captured', 'captured'), true);
  assert.equal(sm.canTransition(sm.PAYMENT_TRANSITIONS, 'captured', 'bogus'), false);
  assert.equal(sm.canTransition(sm.RETURN_TRANSITIONS, 'bogus', 'bogus'), false);
});
test('returns: received and canceled are final', () => {
  for (const from of ['received', 'canceled']) for (const to of ['requested', 'received', 'canceled', 'requires_action'])
    assert.equal(sm.canTransition(sm.RETURN_TRANSITIONS, from, to), from === to, `${from}->${to}`);
  assert.equal(sm.canTransition(sm.RETURN_TRANSITIONS, 'requested', 'canceled'), true);
  assert.deepEqual([...sm.RETURN_REFUNDABLE], ['requested', 'requires_action']);
});
test('business account requests: approved is final (account exists)', () => {
  assert.equal(sm.canTransition(sm.BUSINESS_ACCOUNT_REQUEST_TRANSITIONS, 'approved', 'not_approved'), false);
  assert.equal(sm.canTransition(sm.BUSINESS_ACCOUNT_REQUEST_TRANSITIONS, 'pending', 'approved'), true);
  assert.equal(sm.canTransition(sm.BUSINESS_ACCOUNT_REQUEST_TRANSITIONS, 'requires_info', 'approved'), true);
});
test('assertTransition throws a clear error', () => {
  assert.throws(() => sm.assertTransition('Return', sm.RETURN_TRANSITIONS, 'received', 'canceled'), /Return cannot move from "received" to "canceled"/);
});
