// Cart ownership: a staff edit of a customer's cart keeps the customer as owner. Offline.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(rel, requireMap = {}) {
  const filename = path.join(root, rel);
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} };
  const req = (spec) => {
    for (const [key, value] of Object.entries(requireMap)) if (spec.endsWith(key)) return value;
    return {};
  };
  vm.runInNewContext(out, { module: m, exports: m.exports, require: req, process: { env: {} } }, { filename });
  return m.exports;
}

const loaded = load('features/keystone/lib/cart-owner.ts');
// Results come from another vm realm; compare them as plain JSON.
const resolveCartOwner = (args) => { const r = loaded.resolveCartOwner(args); return r === undefined ? r : JSON.parse(JSON.stringify(r)); };
const customer = 'cust_hannah', staff = 'staff_admin';

test('staff edit of a customer cart keeps the customer as owner', () => {
  assert.equal(resolveCartOwner({ operation: 'update', resolvedUser: undefined, sessionUserId: staff, editorIsStaff: true }), undefined);
});

test('an update never sets the owner from the session, even for a shopper on an unowned cart', () => {
  assert.equal(resolveCartOwner({ operation: 'update', resolvedUser: undefined, sessionUserId: customer, editorIsStaff: false }), undefined);
  assert.equal(resolveCartOwner({ operation: 'update', resolvedUser: undefined, sessionUserId: staff, editorIsStaff: true }), undefined);
});

test('a signed-in shopper creating a cart owns it; staff and guests do not', () => {
  assert.deepEqual(resolveCartOwner({ operation: 'create', resolvedUser: undefined, sessionUserId: customer, editorIsStaff: false }), { connect: { id: customer } });
  assert.equal(resolveCartOwner({ operation: 'create', resolvedUser: undefined, sessionUserId: staff, editorIsStaff: true }), undefined);
  assert.equal(resolveCartOwner({ operation: 'create', resolvedUser: undefined, sessionUserId: null, editorIsStaff: false }), undefined);
});

test('explicit owner changes are kept', () => {
  const connect = { connect: { id: 'cust_other' } };
  assert.deepEqual(resolveCartOwner({ operation: 'update', resolvedUser: connect, sessionUserId: staff, editorIsStaff: true }), connect);
});

test('the Cart model routes its user hook through resolveCartOwner with the staff check', () => {
  const src = fs.readFileSync(path.join(root, 'features/keystone/models/Cart.ts'), 'utf8');
  const hook = src.slice(src.indexOf('user: relationship({'), src.indexOf('// Regular fields'));
  assert.match(hook, /resolveCartOwner\(/);
  assert.match(hook, /editorIsStaff: Boolean\(permissions\.canManageOrders\(\{ session: context\.session \}\)\)/);
  assert.doesNotMatch(hook, /return \{ connect: \{ id: context\.session\.itemId \} \}/);
  assert.doesNotMatch(hook, /operation === "update"/);
});

test('the create-time owner override applies to shoppers only, not staff', () => {
  const src = fs.readFileSync(path.join(root, 'features/keystone/models/Cart.ts'), 'utf8');
  const lines = src.split('\n').filter((line) => /resolvedData\.user = \{ connect: \{ id: context\.session\.itemId \} \}/.test(line));
  assert.equal(lines.length, 1);
  const at = src.indexOf(lines[0]);
  assert.match(src.slice(at - 300, at), /!permissions\.canManageOrders\(\{ session: context\.session \}\)/);
});
