// Demo-account guard: features/keystone/lib/demo-guard.ts. Offline, no DB.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(relative) {
  const filename = path.resolve(root, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { module, exports: module.exports, require, process, Symbol }, { filename });
  return module.exports;
}

const guard = load('features/keystone/lib/demo-guard.ts');
const { DEMO_GUARD_MESSAGE, withDemoGuard, DEMO_GUARD_POLICY, rewriteDemoErrors } = guard;
const env = { DEMO_USER_EMAILS: ' Other@example.com , IMPOSSIBLE@openship.org ' };

const DEMO = { itemId: 'demo', listKey: 'User', data: { email: 'impossible@openship.org' } };
const ADMIN = { itemId: 'admin', listKey: 'User', data: { email: 'owner@openship.org' } };

// Lists shaped like the real ones; Product carries an existing hook to prove it still runs.
let productHookRan = 0;
const lists = withDemoGuard({
  User: { fields: {} },
  Role: { fields: {} },
  Invite: { fields: {} },
  Store: { fields: {} },
  Product: { fields: {}, hooks: { beforeOperation: { update: () => { productHookRan++; } } } },
}, DEMO_GUARD_POLICY, env);

function run(listKey, operation, session, { item, inputData } = {}) {
  const context = { session, sudo: () => context };
  const hook = lists[listKey].hooks?.beforeOperation;
  const fn = typeof hook === 'function' ? hook : hook?.[operation];
  if (!fn) return Promise.resolve();
  return fn({ listKey, operation, context, item, inputData, resolvedData: inputData });
}

async function refused(promise) {
  await assert.rejects(promise, (error) => error.message === DEMO_GUARD_MESSAGE);
}

test('the exact copy', () => {
  assert.equal(DEMO_GUARD_MESSAGE, "Demo accounts can't change this.");
});

test('1. a demo user cannot change any password or email, its own included', async () => {
  await refused(run('User', 'update', DEMO, { item: { id: 'demo' }, inputData: { password: 'x' } }));
  await refused(run('User', 'update', DEMO, { item: { id: 'demo' }, inputData: { email: 'a@b.c' } }));
  await refused(run('User', 'update', DEMO, { item: { id: 'admin' }, inputData: { password: 'x' } }));
  await refused(run('User', 'update', DEMO, { item: { id: 'admin' }, inputData: { email: 'a@b.c' } }));
});

test('2. a demo user cannot change roles or a user\'s role', async () => {
  await refused(run('Role', 'create', DEMO, { inputData: { name: 'X' } }));
  await refused(run('Role', 'update', DEMO, { item: { id: 'r' }, inputData: { canManageUsers: true } }));
  await refused(run('Role', 'delete', DEMO, { item: { id: 'r' } }));
  await refused(run('User', 'update', DEMO, { item: { id: 'demo' }, inputData: { role: { connect: { id: 'r' } } } }));
  await refused(run('Invite', 'create', DEMO, { inputData: { userEmail: 'x@y.z' } }));
});

test('3. a demo user cannot create, delete or update users, including the real admin', async () => {
  await refused(run('User', 'create', DEMO, { inputData: { name: 'New' } }));
  await refused(run('User', 'delete', DEMO, { item: { id: 'admin' } }));
  await refused(run('User', 'delete', DEMO, { item: { id: 'demo' } }));
  await refused(run('User', 'update', DEMO, { item: { id: 'admin' }, inputData: { name: 'Hacked' } }));
});

test('4. a demo user cannot change the store URL settings', async () => {
  for (const field of ['swapLinkTemplate', 'paymentLinkTemplate', 'inviteLinkTemplate']) {
    await refused(run('Store', 'update', DEMO, { item: { id: 's' }, inputData: { [field]: 'x' } }));
  }
  await refused(run('Store', 'create', DEMO, { inputData: {} }));
  await refused(run('Store', 'delete', DEMO, { item: { id: 's' } }));
});

test('4b. unchanged protected values pass, changed ones are refused', async () => {
  const item = { id: 's', name: 'Impossible', logoIcon: 'a', logoColor: '#111111', swapLinkTemplate: null, paymentLinkTemplate: 'https://p/{id}', inviteLinkTemplate: null };
  await run('Store', 'update', DEMO, { item, inputData: { name: ' Impossible ', logoIcon: 'a', logoColor: '#111111', swapLinkTemplate: '', paymentLinkTemplate: 'https://p/{id}', defaultCurrencyCode: 'usd', taxRate: 8 } });
  await refused(run('Store', 'update', DEMO, { item, inputData: { paymentLinkTemplate: 'https://evil/{id}' } }));
  await refused(run('Store', 'update', DEMO, { item, inputData: { inviteLinkTemplate: 'https://x' } }));
  await refused(run('Store', 'update', DEMO, { inputData: { paymentLinkTemplate: 'https://p/{id}' } }));
  await refused(run('User', 'update', DEMO, { item: { id: 'demo', password: 'x' }, inputData: { password: 'x' } }));
});

test('changed name, tagline and logo ALLOWED', async () => {
  const item = { id: 's', name: 'Impossible', logoIcon: 'a', logoColor: '#111111' };
  await run('Store', 'update', DEMO, { item, inputData: { name: 'Impossible QA', tagline: 'New line', logoIcon: 'b', logoColor: '#000000' } });
  await run('Store', 'update', DEMO, { inputData: { name: 'No stored item' } });
});

test('a demo user can still edit a product and its own onboarding state', async () => {
  await run('Product', 'update', DEMO, { item: { id: 'p' }, inputData: { title: 'Edited' } });
  assert.equal(productHookRan, 1, 'the existing Product hook still runs');
  await run('User', 'update', DEMO, { item: { id: 'demo' }, inputData: { onboardingStatus: 'dismissed' } });
  await run('Store', 'update', DEMO, { item: { id: 's' }, inputData: { homepageTitle: 'Hi', currencies: {} } });
});

test('a non-demo admin is unaffected', async () => {
  await run('User', 'update', ADMIN, { item: { id: 'demo' }, inputData: { password: 'x', email: 'a@b.c', role: {} } });
  await run('User', 'create', ADMIN, { inputData: { name: 'New' } });
  await run('User', 'delete', ADMIN, { item: { id: 'x' } });
  await run('Role', 'update', ADMIN, { item: { id: 'r' }, inputData: { name: 'Y' } });
  await run('Store', 'update', ADMIN, { item: { id: 's' }, inputData: { name: 'New name' } });
  await run('User', 'update', null, { item: { id: 'x' }, inputData: { password: 'x' } });
});

test('a session without data.email is resolved from the user record', async () => {
  const session = { itemId: 'demo', listKey: 'User' };
  const context = { session, sudo: () => ({ db: { User: { findOne: async () => ({ email: 'Impossible@Openship.org' }) } } }) };
  await refused(lists.User.hooks.beforeOperation({ listKey: 'User', operation: 'update', context, item: { id: 'demo' }, inputData: { password: 'x' } }));
});

test('no DEMO_USER_EMAILS means no guard', async () => {
  const open = withDemoGuard({ Role: { fields: {} } }, DEMO_GUARD_POLICY, {});
  await open.Role.hooks.beforeOperation({ listKey: 'Role', operation: 'delete', context: { session: DEMO }, item: { id: 'r' } });
});

test('Keystone\'s hook wrapper is rewritten to the exact copy', () => {
  const wrapped = { message: `An error occurred while running "beforeOperation".\n  - Store.hooks.beforeOperation: ${DEMO_GUARD_MESSAGE}`, path: ['updateStore'] };
  const other = { message: 'Something else' };
  const result = rewriteDemoErrors({ data: { updateStore: null }, errors: [wrapped, other] });
  assert.equal(result.errors[0].message, DEMO_GUARD_MESSAGE);
  assert.equal(result.errors[0].extensions.code, 'KS_ACCESS_DENIED');
  assert.equal(result.errors[1], other);
});

test('the guard is wired into the Keystone config and the GraphQL route', () => {
  const config = fs.readFileSync(path.join(root, 'features/keystone/index.ts'), 'utf8');
  assert.match(config, /lists: withDemoGuard\(models\)/);
  const route = fs.readFileSync(path.join(root, 'pages/api/graphql.ts'), 'utf8');
  assert.match(route, /useDemoGuardErrors\(\)/);
});
