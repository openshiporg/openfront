// API key and OAuth token sessions are narrowed to their scopes: a key gets a
// permission only when a granted scope maps to it AND the key owner's role
// holds it. The owner's role must never leak through for unscoped permissions.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function transpile(rel) {
  return ts.transpileModule(fs.readFileSync(path.join(root, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function load() {
  const modules = {
    './models/fields': { permissionsList: ['canReadOrders', 'canManageOrders', 'canReadUsers', 'canManageUsers', 'canManageRoles', 'canReadRoles', 'canManageProducts', 'canAccessDashboard'] },
  };
  const scopes = { exports: {} };
  vm.runInNewContext(transpile('features/keystone/oauth/scopes.ts'), { module: scopes, exports: scopes.exports, require });
  modules['./oauth/scopes'] = scopes.exports;
  const mod = { exports: {} };
  vm.runInNewContext(transpile('features/keystone/access.ts'), {
    module: mod,
    exports: mod.exports,
    require: (id) => modules[id] ?? require(id),
  });
  return mod.exports.permissions;
}

const permissions = load();
const adminRole = { canReadOrders: true, canManageOrders: true, canReadUsers: true, canManageUsers: true, canManageRoles: true, canReadRoles: true, canManageProducts: true, canAccessDashboard: true };
const admin = { itemId: 'u1', data: { role: adminRole } };

test('a cookie session keeps its full role', () => {
  for (const p of Object.keys(adminRole)) assert.equal(permissions[p]({ session: admin }), true, p);
});

test('a read_orders API key reads orders but gets nothing else from the owner role', () => {
  const session = { ...admin, apiKeyScopes: ['read_orders'] };
  assert.equal(permissions.canReadOrders({ session }), true);
  for (const p of ['canManageOrders', 'canReadUsers', 'canManageUsers', 'canManageRoles', 'canReadRoles', 'canManageProducts', 'canAccessDashboard']) {
    assert.equal(permissions[p]({ session }), false, p);
  }
});

test('a scope never grants what the owner role lacks', () => {
  const session = { itemId: 'u2', data: { role: { canReadOrders: false } }, apiKeyScopes: ['write_orders'] };
  assert.equal(permissions.canReadOrders({ session }), false);
  assert.equal(permissions.canManageOrders({ session }), false);
});

test('an empty scope list grants nothing', () => {
  const session = { ...admin, apiKeyScopes: [] };
  for (const p of Object.keys(adminRole)) assert.equal(permissions[p]({ session }), false, p);
});

test('OAuth token sessions are narrowed the same way', () => {
  const session = { ...admin, oauthScopes: ['read_products', 'write_products'] };
  assert.equal(permissions.canManageProducts({ session }), true);
  assert.equal(permissions.canManageRoles({ session }), false);
  assert.equal(permissions.canReadUsers({ session }), false);
});

test('the Openship reconnect scopes still cover what Openship calls', () => {
  const session = { ...admin, data: { role: { ...adminRole, canReadProducts: true, canReadFulfillments: true, canManageFulfillments: true, canReadWebhooks: true, canManageWebhooks: true } },
    apiKeyScopes: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_customers', 'read_fulfillments', 'write_fulfillments', 'read_webhooks', 'write_webhooks'] };
  for (const p of ['canManageProducts', 'canReadOrders', 'canManageOrders', 'canReadUsers']) assert.equal(permissions[p]({ session }), true, p);
  assert.equal(permissions.canManageRoles({ session }), false);
  assert.equal(permissions.canManageUsers({ session }), false);
});
