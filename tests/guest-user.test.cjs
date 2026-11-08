// Returning guests: a repeat guest email frees the old guest record; real accounts are never touched. Offline.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'features/keystone/security/guest-user.ts');
const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const m = { exports: {} };
vm.runInNewContext(out, { module: m, exports: m.exports, process: { env: {} }, Date, Number, String }, { filename });
const { isRetirableGuest, retireReturningGuest, retiredGuestEmail } = m.exports;
const ucFile = path.join(root, 'features/keystone/security/user-create.ts');
const ucOut = ts.transpileModule(fs.readFileSync(ucFile, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const um = { exports: {} };
vm.runInNewContext(ucOut, { module: um, exports: um.exports, Set, Object, require: () => ({ permissions: { canManageUsers: () => false } }) }, { filename: ucFile });
const { resolvePublicUserCreateData } = um.exports;

const NEW = '2026-11-02T19:16:00.000Z', OLD = '2026-01-01T00:00:00.000Z';
function db(users) {
  const rows = users.map((u) => ({ roleId: null, accounts: [], carts: [{ id: 'c' }], orders: [], addresses: [], ...u }));
  return { rows, user: {
    findFirst: async ({ where }) => rows.find((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()) || null,
    update: async ({ where, data }) => { Object.assign(rows.find((u) => u.id === where.id), data); },
  } };
}

test('repeat guest email: the earlier guest record is retired so the email is free', async () => {
  const prisma = db([{ id: 'g1', email: 'a@x.com', hasAccount: false, createdAt: NEW }]);
  assert.equal(await retireReturningGuest(prisma, 'A@x.com'), true);
  assert.equal(prisma.rows[0].email, retiredGuestEmail('g1'));
  assert.equal(await prisma.user.findFirst({ where: { email: { equals: 'a@x.com' } } }), null);
});

test('a real account (hasAccount true) is never retired or hijacked', async () => {
  const prisma = db([{ id: 'm1', email: 'a@x.com', hasAccount: true, createdAt: NEW }]);
  assert.equal(await retireReturningGuest(prisma, 'a@x.com'), false);
  assert.equal(prisma.rows[0].email, 'a@x.com');
});

test('older hasAccount:false rows (possible pre-fix members), staff and business-account users are kept', async () => {
  for (const u of [
    { id: 'o', hasAccount: false, createdAt: OLD },
    { id: 's', hasAccount: false, createdAt: NEW, roleId: 'r1' },
    { id: 'b', hasAccount: false, createdAt: NEW, accounts: [{ id: 'acc' }] },
  ]) {
    const prisma = db([{ email: 'a@x.com', ...u }]);
    assert.equal(await retireReturningGuest(prisma, 'a@x.com'), false);
    assert.equal(prisma.rows[0].email, 'a@x.com');
  }
});

test('second guest never inherits the first guest: the old record keeps its data, the email moves on', async () => {
  const prisma = db([{ id: 'g1', email: 'a@x.com', hasAccount: false, createdAt: NEW }]);
  await retireReturningGuest(prisma, 'a@x.com');
  // The new guest is a brand new user row, so Address/Cart filters (user.id == session) cannot match g1's data.
  prisma.rows.push({ id: 'g2', email: 'a@x.com', hasAccount: false, createdAt: NEW });
  assert.notEqual((await prisma.user.findFirst({ where: { email: { equals: 'a@x.com' } } })).id, 'g1');
  assert.match(prisma.rows[0].email, /@guest\.invalid$/);
});

test('empty or unknown email does nothing', async () => {
  const prisma = db([]);
  assert.equal(await retireReturningGuest(prisma, ''), false);
  assert.equal(await retireReturningGuest(prisma, 'none@x.com'), false);
  assert.equal(isRetirableGuest(null), false);
});

test('public create without hasAccount is a member and not retirable', () => {
  const d = resolvePublicUserCreateData({ inputData: { email: 'a@x.com', name: 'a', password: 'x' }, resolvedData: { email: 'a@x.com', hasAccount: false } });
  assert.equal(d.hasAccount, true);
  assert.equal(isRetirableGuest({ id: 'u', hasAccount: d.hasAccount, createdAt: NEW, carts: [{ id: 'c' }] }), false);
});
test('dashboard signUp, MCP OAuth and createCustomer inputs all resolve to member', () => {
  const dash = { email: 'a@x.com', name: 'a', password: 'x', hasAccount: true };
  const mcp = { name: 'a', email: 'a@x.com', password: 'x', hasAccount: true };
  const cust = { email: 'a@x.com', password: 'x', name: 'a b', phone: '1', hasAccount: true };
  for (const input of [dash, mcp, cust]) assert.equal(resolvePublicUserCreateData({ inputData: input, resolvedData: { ...input } }).hasAccount, true);
  // and even the legacy shape with no flag
  assert.equal(resolvePublicUserCreateData({ inputData: { email: 'a@x.com' }, resolvedData: { email: 'a@x.com' } }).hasAccount, true);
});
test('explicit false + cart is retirable; explicit false stays false', async () => {
  assert.equal(resolvePublicUserCreateData({ inputData: { hasAccount: false }, resolvedData: {} }).hasAccount, false);
  const prisma = db([{ id: 'g1', email: 'a@x.com', hasAccount: false, createdAt: NEW, carts: [{ id: 'c1' }] }]);
  assert.equal(await retireReturningGuest(prisma, 'a@x.com'), true);
});
test('guest record with an order but no cart is retirable; with neither is not', async () => {
  const withOrder = db([{ id: 'g', email: 'a@x.com', hasAccount: false, createdAt: NEW, carts: [], orders: [{ id: 'o' }] }]);
  assert.equal(await retireReturningGuest(withOrder, 'a@x.com'), true);
  const none = db([{ id: 'g', email: 'a@x.com', hasAccount: false, createdAt: NEW, carts: [], orders: [] }]);
  assert.equal(await retireReturningGuest(none, 'a@x.com'), false);
  assert.equal(none.rows[0].email, 'a@x.com');
});
test('anonymous createUser with a member email never retires it (create then fails unique)', async () => {
  const prisma = db([{ id: 'm', email: 'a@x.com', hasAccount: true, createdAt: NEW, carts: [{ id: 'c' }] }]);
  // member created via the old no-flag path is stored true now
  const stored = resolvePublicUserCreateData({ inputData: { email: 'a@x.com' }, resolvedData: { email: 'a@x.com' } }).hasAccount;
  prisma.rows.push({ id: 'm2', email: 'b@x.com', hasAccount: stored, createdAt: NEW, carts: [{ id: 'c' }] });
  for (const e of ['a@x.com', 'b@x.com']) assert.equal(await retireReturningGuest(prisma, e), false);
  assert.deepEqual(prisma.rows.map((r) => r.email), ['a@x.com', 'b@x.com']);
});

// Hook ordering: load the real User list with stubbed Keystone, then replay Keystone's
// create pipeline (resolveInput -> validation -> beforeOperation -> write).
function loadUserList() {
  const file = path.join(root, 'features/keystone/models/User.ts');
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  const stub = () => ({});
  const mocks = {
    '@keystone-6/core': { list: (c) => c, graphql: { field: stub, object: stub, String: {}, Int: {}, Boolean: {} }, group: (c) => c },
    '@keystone-6/core/access': { denyAll: () => false },
    '@keystone-6/core/fields': new Proxy({}, { get: () => stub }),
    '../access': { isSignedIn: ({ session }) => !!session, permissions: { canManageUsers: ({ session }) => !!session?.manager }, rules: new Proxy({}, { get: () => stub }) },
    './trackingFields': { trackingFields: {} },
    '../security/guest-user': m.exports,
    '../security/user-create': um.exports,
  };
  vm.runInNewContext(out, { module: mod, exports: mod.exports, require: (n) => (n in mocks ? mocks[n] : {}), process, Object, Set }, { filename: file });
  return mod.exports.User;
}
async function createPipeline(User, prisma, input) {
  const context = { session: undefined, prisma };
  const resolved = await User.hooks.resolveInput({ operation: 'create', inputData: input, resolvedData: { ...input }, context });
  if (!input.password || input.password.length < 10) return 'validation-failed'; // Keystone rejects before beforeOperation
  await User.hooks.beforeOperation({ operation: 'create', resolvedData: resolved, context });
  return 'written';
}
test('invalid create (short password) does NOT retire the guest email; valid guest create does', async () => {
  const User = loadUserList();
  const prisma = db([{ id: 'g1', email: 'a@x.com', hasAccount: false, createdAt: NEW }]);
  assert.equal(await createPipeline(User, prisma, { email: 'a@x.com', name: 'n', password: 'short' }), 'validation-failed');
  assert.equal(prisma.rows[0].email, 'a@x.com');
  assert.equal(await createPipeline(User, prisma, { email: 'a@x.com', name: 'n', password: 'long-enough-password', hasAccount: false }), 'written');
  assert.equal(prisma.rows[0].email, retiredGuestEmail('g1'));
});
test('resolveInput itself never retires; manager creates never retire', async () => {
  const User = loadUserList();
  const prisma = db([{ id: 'g1', email: 'a@x.com', hasAccount: false, createdAt: NEW }]);
  await User.hooks.resolveInput({ operation: 'create', inputData: { email: 'a@x.com' }, resolvedData: { email: 'a@x.com' }, context: { session: undefined, prisma } });
  assert.equal(prisma.rows[0].email, 'a@x.com');
  await User.hooks.beforeOperation({ operation: 'create', resolvedData: { email: 'a@x.com' }, context: { session: { manager: true }, prisma } });
  assert.equal(prisma.rows[0].email, 'a@x.com');
});

test('headless guest checkout: a guest with only a shipping address (no linked cart or order) is retired so the same email can check out again', async () => {
  const prisma = db([{ id: 'g1', email: 'a@x.com', hasAccount: false, createdAt: NEW, carts: [], orders: [], addresses: [{ id: 'ad' }] }]);
  assert.equal(await retireReturningGuest(prisma, 'a@x.com'), true);
  assert.equal(prisma.rows[0].email, retiredGuestEmail('g1'));
});

test('a hasAccount:false row with no cart, order or address (a bare sign-up) is still kept; a member with an address is never retired', async () => {
  const bare = db([{ id: 'b', email: 'a@x.com', hasAccount: false, createdAt: NEW, carts: [], orders: [], addresses: [] }]);
  assert.equal(await retireReturningGuest(bare, 'a@x.com'), false);
  const member = db([{ id: 'm', email: 'a@x.com', hasAccount: true, createdAt: NEW, carts: [], orders: [], addresses: [{ id: 'ad' }] }]);
  assert.equal(await retireReturningGuest(member, 'a@x.com'), false);
  assert.equal(member.rows[0].email, 'a@x.com');
});
