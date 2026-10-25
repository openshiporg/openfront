// MCP OAuth: Node's built-in test runner over the real TypeScript sources with an
// in-memory Prisma/Keystone stand-in. No DB, network or real env.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const REAL = new Set(['graphql', 'node:crypto', '@keystone-6/core/access', '@keystone-6/core/fields']);

function sandbox({ env = { SESSION_SECRET: 'unit-test-secret-unit-test-secret-0123'}, mocks = {}, logs = [] } = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(root, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText;
    const module = { exports: {} };
    cache.set(filename, module);
    function localRequire(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (REAL.has(specifier)) return require(specifier);
      if (specifier.startsWith('.')) return load(`${path.resolve(path.dirname(filename), specifier)}.ts`);
      throw new Error(`Unmocked dependency: ${specifier}`);
    }
    vm.runInNewContext(output, {
      module, exports: module.exports, require: localRequire, Buffer,
      process: { env }, console: Object.fromEntries(['error', 'warn', 'log', 'info'].map(level =>
        [level, (...args) => logs.push(args)])),
      URL, URLSearchParams, Request, Response, Headers, FormData, Date, JSON, Math, Promise, Map, Set,
      Array, Object, Error, TypeError, String, Number, Boolean, RegExp, setTimeout,
    }, { filename });
    return module.exports;
  }
  return { load, logs };
}

/** Just enough Prisma for the OAuth lists: equality, `in`, `gt`/`lt`, transactions. */
function fakePrisma() {
  const tables = { oAuthApp: [], oAuthToken: [] };
  const matches = (row, where = {}) => Object.entries(where).every(([key, condition]) => {
    if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
      if ('in' in condition) return condition.in.includes(row[key]);
      if ('gt' in condition) return row[key] && new Date(row[key]) > condition.gt;
      if ('lt' in condition) return row[key] && new Date(row[key]) < condition.lt;
    }
    return row[key] === condition;
  });
  const model = name => ({
    async findUnique({ where }) { return tables[name].find(row => matches(row, where)) ?? null; },
    async findMany({ where, take } = {}) { return tables[name].filter(row => matches(row, where)).slice(0, take ?? Infinity); },
    async create({ data }) {
      if (data.token && tables[name].some(row => row.token === data.token)) throw new Error('unique');
      const row = { id: crypto.randomUUID(), createdAt: new Date(), isRevoked: 'false', resource: '', accessToken: '', refreshToken: '', authorizationCode: '', ...data };
      tables[name].push(row); return row;
    },
    async updateMany({ where, data }) {
      const rows = tables[name].filter(row => matches(row, where)); rows.forEach(row => Object.assign(row, data));
      return { count: rows.length };
    },
    async deleteMany({ where }) {
      const before = tables[name].length; tables[name] = tables[name].filter(row => !matches(row, where));
      return { count: before - tables[name].length };
    },
  });
  const prisma = { tables, oAuthApp: model('oAuthApp'), oAuthToken: model('oAuthToken') };
  prisma.$transaction = async fn => fn(prisma);
  return prisma;
}

const STAFF_ROLE = { canAccessDashboard: true, canReadProducts: true, canManageProducts: true, canReadOrders: true,
  canManageOrders: true, canReadUsers: true, canManageUsers: true, canManageRoles: true };
const USERS = {
  customer: { id: 'customer', name: 'Cass Customer', email: 'cass@example.invalid', role: null },
  staff: { id: 'staff', name: 'Sam Staff', email: 'sam@example.invalid', role: STAFF_ROLE },
};

/**
 * A Keystone context stand-in: withRequest resolves the session the way
 * createAuth does (base strategy → load sessionData for itemId).
 */
function fakeKeystone(load) {
  const prisma = fakePrisma();
  const { withMcpBearerSessions } = load('features/keystone/mcp-oauth/session.ts');
  const cookieStrategy = { async get({ context }) {
    const user = /keystonejs-session=(\w+)/.exec(context.req.headers.cookie || '')?.[1];
    return user && USERS[user] ? { itemId: user, listKey: 'User' } : undefined;
  } };
  const strategy = withMcpBearerSessions(cookieStrategy);
  const db = {
    OAuthToken: { findOne: ({ where }) => prisma.oAuthToken.findUnique({ where }) },
    OAuthApp: { findOne: ({ where }) => prisma.oAuthApp.findUnique({ where }) },
  };
  const base = { prisma, db, sudo: () => base };
  const keystoneContext = {
    ...base,
    async withRequest(req) {
      const raw = await strategy.get({ context: { req, sudo: () => base } });
      const user = raw && USERS[raw.itemId];
      const session = user ? { ...raw, data: user } : undefined;
      return { ...base, session };
    },
  };
  return { keystoneContext, prisma };
}

function harness() {
  const { load } = sandbox();
  const { keystoneContext, prisma } = fakeKeystone(load);
  const routes = load('features/keystone/mcp-oauth/routes.ts');
  const core = load('features/keystone/mcp-oauth/core.ts');
  const guard = load('features/keystone/mcp-oauth/guard.ts');
  return { load, keystoneContext, prisma, routes, core, guard };
}

const ORIGIN = 'https://shop.example';
const CALLBACK = 'https://chatgpt.com/connector_platform_oauth_redirect';
const verifier = crypto.randomBytes(48).toString('base64url');
const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

function req(pathname, { method = 'GET', cookie, form, json, headers = {} } = {}) {
  const h = new Headers({ host: 'shop.example', 'x-forwarded-proto': 'https', ...headers });
  if (cookie) h.set('cookie', `keystonejs-session=${cookie}`);
  let body;
  if (form) { body = new URLSearchParams(form); h.set('content-type', 'application/x-www-form-urlencoded'); h.set('origin', h.get('origin') || ORIGIN); }
  if (json) { body = JSON.stringify(json); h.set('content-type', 'application/json'); }
  return new Request(`${ORIGIN}${pathname}`, { method, headers: h, body });
}

async function register(routes, keystoneContext) {
  const response = await routes.registerPOST(keystoneContext, req('/oauth/register', { method: 'POST', json: {
    client_name: 'ChatGPT', redirect_uris: [CALLBACK], token_endpoint_auth_method: 'none',
  } }));
  assert.equal(response.status, 201);
  return response.json();
}

function authorizeQuery(clientId, extra = {}) {
  return new URLSearchParams({ client_id: clientId, redirect_uri: CALLBACK, response_type: 'code', state: 'st4te',
    code_challenge: challenge, code_challenge_method: 'S256', scope: 'mcp:read mcp:write', ...extra }).toString();
}

/** Full browser + client flow for one user; returns the token response. */
async function connect(h, user, { allowWrite = true } = {}) {
  const { client_id } = await register(h.routes, h.keystoneContext);
  const query = authorizeQuery(client_id);
  const page = await h.routes.authorizeGET(h.keystoneContext, req(`/oauth/authorize?${query}`, { cookie: user }));
  assert.equal(page.status, 200);
  const htmlText = await page.text();
  const ticket = /name="ticket" value="([^"]+)"/.exec(htmlText)[1];
  const form = { intent: 'approve', ticket };
  if (allowWrite) form.allow_write = '1';
  const decision = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, { method: 'POST', cookie: user, form }));
  assert.equal(decision.status, 303);
  const location = new URL(decision.headers.get('location'));
  assert.equal(location.origin + location.pathname, CALLBACK);
  assert.equal(location.searchParams.get('state'), 'st4te');
  assert.equal(location.searchParams.get('iss'), ORIGIN);
  const tokenResponse = await h.routes.tokenPOST(h.keystoneContext, req('/oauth/token', { method: 'POST', form: {
    grant_type: 'authorization_code', client_id, code: location.searchParams.get('code'), redirect_uri: CALLBACK, code_verifier: verifier,
  } }));
  assert.equal(tokenResponse.status, 200);
  return { client_id, tokens: await tokenResponse.json(), code: location.searchParams.get('code') };
}

async function sessionFor(h, token) {
  return (await h.keystoneContext.withRequest({ headers: { authorization: `Bearer ${token}` } })).session;
}

test('discovery derives the issuer from the request host and points at /oauth endpoints', async () => {
  const { routes } = harness();
  const resource = await routes.protectedResourceGET(req('/.well-known/oauth-protected-resource/api/mcp-transport/http'), ['api', 'mcp-transport', 'http']).json();
  assert.equal(resource.resource, `${ORIGIN}/api/mcp-transport/http`);
  assert.deepEqual(resource.authorization_servers, [ORIGIN]);
  assert.equal(routes.protectedResourceGET(req('/x'), ['etc', 'passwd']).status, 404);
  const server = await routes.authorizationServerGET(req('/.well-known/oauth-authorization-server', {
    headers: { 'x-forwarded-host': 'custom.example', host: 'internal:8080' } })).json();
  assert.equal(server.issuer, 'https://custom.example');
  assert.equal(server.token_endpoint, 'https://custom.example/oauth/token');
  assert.deepEqual(server.code_challenge_methods_supported, ['S256']);
  assert.deepEqual(server.token_endpoint_auth_methods_supported, ['none']);
});

test('registration accepts public HTTPS/loopback clients only, and dedupes repeat registrations', async () => {
  const { routes, keystoneContext, prisma } = harness();
  const first = await register(routes, keystoneContext);
  const second = await register(routes, keystoneContext);
  assert.equal(first.client_id, second.client_id);
  assert.equal(prisma.tables.oAuthApp.length, 1);
  assert.equal(prisma.tables.oAuthApp[0].tokenEndpointAuthMethod, 'none');
  for (const body of [
    { redirect_uris: ['http://evil.example/cb'] },
    { redirect_uris: ['https://x.example/cb#frag'] },
    { redirect_uris: [CALLBACK], token_endpoint_auth_method: 'client_secret_post' },
    { redirect_uris: [] },
  ]) {
    const response = await routes.registerPOST(keystoneContext, req('/oauth/register', { method: 'POST', json: body }));
    assert.equal(response.status, 400, JSON.stringify(body));
  }
  const loopback = await routes.registerPOST(keystoneContext, req('/oauth/register', { method: 'POST', json: { redirect_uris: ['http://127.0.0.1:33418/callback'] } }));
  assert.equal(loopback.status, 201);
});

test('signed-out authorize shows sign-in; bad requests never redirect to the client', async () => {
  const h = harness();
  const { client_id } = await register(h.routes, h.keystoneContext);
  const signIn = await h.routes.authorizeGET(h.keystoneContext, req(`/oauth/authorize?${authorizeQuery(client_id)}`));
  assert.equal(signIn.status, 200);
  assert.match(await signIn.text(), /Sign in to connect ChatGPT/);
  assert.match(signIn.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  for (const extra of [
    { redirect_uri: 'https://evil.example/cb' }, { code_challenge_method: 'plain' }, { code_challenge: '' },
    { scope: 'admin' }, { resource: 'https://other.example/api/mcp-transport/http' }, { client_id: 'nope' },
  ]) {
    const response = await h.routes.authorizeGET(h.keystoneContext, req(`/oauth/authorize?${authorizeQuery(client_id, extra)}`, { cookie: 'customer' }));
    assert.equal(response.status, 400, JSON.stringify(extra));
    assert.equal(response.headers.get('location'), null);
  }
});

test('consent POSTs need our origin and the same signed-in user as the ticket', async () => {
  const h = harness();
  const { client_id } = await register(h.routes, h.keystoneContext);
  const query = authorizeQuery(client_id);
  const page = await (await h.routes.authorizeGET(h.keystoneContext, req(`/oauth/authorize?${query}`, { cookie: 'customer' }))).text();
  assert.match(page, /Signed in as/);
  assert.match(page, /chatgpt\.com/);
  const ticket = /name="ticket" value="([^"]+)"/.exec(page)[1];
  const crossSite = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, {
    method: 'POST', cookie: 'customer', form: { intent: 'approve', ticket }, headers: { origin: 'https://evil.example' } }));
  assert.equal(crossSite.status, 403);
  const otherUser = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, {
    method: 'POST', cookie: 'staff', form: { intent: 'approve', ticket } }));
  assert.equal(otherUser.status, 403);
  const tampered = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, {
    method: 'POST', cookie: 'customer', form: { intent: 'approve', ticket: ticket.slice(0, -4) + 'AAAA' } }));
  assert.equal(tampered.status, 400);
  const deny = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, {
    method: 'POST', cookie: 'customer', form: { intent: 'deny', ticket } }));
  assert.equal(new URL(deny.headers.get('location')).searchParams.get('error'), 'access_denied');
  assert.equal(h.prisma.tables.oAuthToken.length, 0);
});

test('a customer token is the customer: no staff role, and staff mutations are refused by their own access rules', async () => {
  const h = harness();
  const { tokens } = await connect(h, 'customer');
  assert.match(tokens.access_token, /^mcp_at_/);
  assert.equal(tokens.token_type, 'Bearer');
  assert.equal(tokens.scope, 'mcp:read mcp:write');
  // Only digests are stored.
  assert.ok(!JSON.stringify(h.prisma.tables.oAuthToken).includes(tokens.access_token));

  const session = await sessionFor(h, tokens.access_token);
  assert.equal(session.itemId, 'customer');
  assert.equal(session.data.role, null);
  assert.deepEqual([...session.mcp.scopes], ['mcp:read', 'mcp:write']);

  // E-commerce's real access rules decide, exactly as for the customer's cookie.
  const { load } = sandbox();
  const { permissions, rules } = load('features/keystone/access.ts');
  assert.equal(permissions.canManageProducts({ session }), false);
  assert.equal(permissions.canManageOrders({ session }), false);
  assert.equal(permissions.canManageUsers({ session }), false);
  assert.equal(permissions.canAccessDashboard({ session }), false);
  // Falls through (undefined) for non-staff: never true and never a filter.
  assert.ok(!rules.canManageProducts({ session }));
  assert.deepEqual(plain(rules.canManageUsers({ session })), { id: { equals: 'customer' } });

  const staff = await connect(h, 'staff');
  const staffSession = await sessionFor(h, staff.tokens.access_token);
  assert.equal(staffSession.itemId, 'staff');
  assert.equal(permissions.canManageProducts({ session: staffSession }), true);
});
const plain = value => JSON.parse(JSON.stringify(value));

test('scopes only narrow: read-only tokens cannot mutate; no token can touch credentials', async () => {
  const h = harness();
  const { parse } = require('graphql');
  const problem = (source, scopes, variables) => h.guard.mcpOperationProblem({ document: parse(source), variables, scopes });
  const write = ['mcp:read', 'mcp:write'];
  assert.equal(problem('{ todos { id } }', ['mcp:read']), null);
  assert.equal(problem('mutation { createTodo(data: { label: "x" }) { id } }', ['mcp:read']), h.guard.READ_ONLY_MESSAGE);
  assert.equal(problem('mutation { createTodo(data: { label: "x" }) { id } }', write), null);
  for (const source of [
    'mutation { endSession }',
    'mutation { authenticateUserWithPassword(email: "a", password: "b") { __typename } }',
    'mutation { sendUserPasswordResetLink(email: "a") }',
    'mutation { createOAuthApp(data: {}) { id } }',
    'mutation { deleteOAuthTokens(where: []) { id } }',
    'mutation { x: updateActiveUserPassword(password: "p") }',
    'mutation { regenerateCustomerToken }',
    'mutation { createApiKey(data: {}) { id } }',
    'mutation { ...M } fragment M on Mutation { createInitialUser(data: {}) { __typename } }',
    'mutation { updateUser(where: { id: "1" }, data: { password: "new-password" }) { id } }',
    'mutation { updateUsers(data: [{ where: { id: "1" }, data: { email: "x@y.z" } }]) { id } }',
  ]) assert.equal(problem(source, write), h.guard.CREDENTIAL_MESSAGE, source);
  assert.equal(problem('mutation($d: UserUpdateInput!) { updateUser(where: { id: "1" }, data: $d) { id } }', write, { d: { password: 'x' } }), h.guard.CREDENTIAL_MESSAGE);
  assert.equal(problem('mutation { updateUser(where: { id: "1" }, data: { name: "New" }) { id } }', write), null);

  // The Yoga plugin stops execution only for MCP-token sessions.
  const run = (session, source) => {
    let stopped = null;
    h.guard.useMcpScopeGuard().onExecute({ args: { contextValue: { session }, document: parse(source) }, setResultAndStopExecution: result => { stopped = result; } });
    return stopped;
  };
  assert.equal(run({ itemId: 'staff' }, 'mutation { endSession }'), null);
  assert.match(run({ itemId: 'customer', mcp: { clientId: 'c', scopes: ['mcp:read'] } }, 'mutation { createTodo(data: {}) { id } }').errors[0].message, /read-only/);
});

test('unticking "Allow changes" grants mcp:read only', async () => {
  const h = harness();
  const { tokens } = await connect(h, 'customer', { allowWrite: false });
  assert.equal(tokens.scope, 'mcp:read');
  assert.deepEqual([...(await sessionFor(h, tokens.access_token)).mcp.scopes], ['mcp:read']);
});

test('codes are single use, PKCE is enforced, and a replayed code revokes what it issued', async () => {
  const h = harness();
  const { client_id } = await register(h.routes, h.keystoneContext);
  const query = authorizeQuery(client_id);
  const page = await (await h.routes.authorizeGET(h.keystoneContext, req(`/oauth/authorize?${query}`, { cookie: 'customer' }))).text();
  const ticket = /name="ticket" value="([^"]+)"/.exec(page)[1];
  const decision = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, { method: 'POST', cookie: 'customer', form: { intent: 'approve', ticket, allow_write: '1' } }));
  const code = new URL(decision.headers.get('location')).searchParams.get('code');
  const exchange = extra => h.routes.tokenPOST(h.keystoneContext, req('/oauth/token', { method: 'POST', form: {
    grant_type: 'authorization_code', client_id, code, redirect_uri: CALLBACK, code_verifier: verifier, ...extra } }));
  assert.equal((await exchange({ code_verifier: 'x'.repeat(50) })).status, 400);
  assert.equal((await exchange({ redirect_uri: 'https://chatgpt.com/other' })).status, 400);
  const good = await exchange();
  assert.equal(good.status, 200);
  const { access_token } = await good.json();
  assert.ok(await sessionFor(h, access_token));
  const replay = await exchange();
  assert.equal(replay.status, 400);
  assert.equal((await replay.json()).error, 'invalid_grant');
  assert.equal(await sessionFor(h, access_token), undefined);
});

test('refresh rotates; reusing an old refresh token ends the connection', async () => {
  const h = harness();
  const { client_id, tokens } = await connect(h, 'customer');
  const refresh = token => h.routes.tokenPOST(h.keystoneContext, req('/oauth/token', { method: 'POST', form: {
    grant_type: 'refresh_token', client_id, refresh_token: token } }));
  const rotated = await (await refresh(tokens.refresh_token)).json();
  assert.match(rotated.refresh_token, /^mcp_rt_/);
  assert.notEqual(rotated.refresh_token, tokens.refresh_token);
  assert.equal(await sessionFor(h, tokens.access_token), undefined, 'old access token revoked on rotation');
  assert.equal((await sessionFor(h, rotated.access_token)).itemId, 'customer');
  const reuse = await refresh(tokens.refresh_token);
  assert.equal(reuse.status, 400);
  assert.equal(await sessionFor(h, rotated.access_token), undefined, 'reuse revokes the whole connection');
  assert.equal((await refresh(rotated.refresh_token)).status, 400);
});

test('expired, revoked, suspended-app and look-alike tokens never fall back to a cookie', async () => {
  const h = harness();
  const { client_id, tokens } = await connect(h, 'customer');
  const both = { authorization: `Bearer ${tokens.access_token}`, cookie: 'keystonejs-session=staff' };
  assert.equal((await h.keystoneContext.withRequest({ headers: both })).session.itemId, 'customer');
  const access = h.prisma.tables.oAuthToken.find(row => row.tokenType === 'access_token');
  access.expiresAt = new Date(Date.now() - 1000);
  assert.equal((await h.keystoneContext.withRequest({ headers: both })).session, undefined);
  access.expiresAt = new Date(Date.now() + 60_000);
  h.prisma.tables.oAuthApp[0].status = 'suspended';
  assert.equal(await sessionFor(h, tokens.access_token), undefined);
  h.prisma.tables.oAuthApp[0].status = 'active';
  assert.equal(await sessionFor(h, 'mcp_at_not-a-real-token'), undefined);
  assert.equal(await sessionFor(h, tokens.refresh_token), undefined, 'a refresh token is not an access token');
  // Revocation endpoint: revoking the refresh token ends the grant.
  await h.routes.revokePOST(h.keystoneContext, req('/oauth/revoke', { method: 'POST', form: { token: tokens.refresh_token, client_id } }));
  assert.equal(await sessionFor(h, tokens.access_token), undefined);
});

test('the connections page lists and disconnects only the signed-in user\'s apps', async () => {
  const h = harness();
  const customer = await connect(h, 'customer');
  const staff = await connect(h, 'staff');
  const page = await (await h.routes.connectionsGET(h.keystoneContext, req('/oauth/connections', { cookie: 'customer' }))).text();
  assert.match(page, /ChatGPT/);
  assert.match(page, /Can make changes/);
  const signedOut = await (await h.routes.connectionsGET(h.keystoneContext, req('/oauth/connections'))).text();
  assert.match(signedOut, /Sign in to/);
  const revoke = await h.routes.connectionsPOST(h.keystoneContext, req('/oauth/connections', { method: 'POST', cookie: 'customer', form: { intent: 'revoke', client_id: customer.client_id } }));
  assert.equal(revoke.status, 303);
  assert.equal(await sessionFor(h, customer.tokens.access_token), undefined);
  assert.equal((await sessionFor(h, staff.tokens.access_token)).itemId, 'staff', 'other users keep their connection');
});

test('the MCP gate serves cookie and token callers, and challenges everyone else', async () => {
  const h = harness();
  const { authorizeMcpRequest } = h.load('features/keystone/mcp-oauth/http.ts');
  const { tokens } = await connect(h, 'customer');
  const mcp = headers => new Request(`${ORIGIN}/api/mcp-transport/http`, { method: 'POST', headers: { host: 'shop.example', 'x-forwarded-proto': 'https', ...headers } });
  const cookie = await authorizeMcpRequest(h.keystoneContext, mcp({ cookie: 'keystonejs-session=staff; _openfront_cart_id=p' }), { method: 'tools/list', id: 1 });
  assert.deepEqual(plain(cookie.forwardHeaders), { Cookie: 'keystonejs-session=staff; _openfront_cart_id=p' });
  const bearer = await authorizeMcpRequest(h.keystoneContext, mcp({ authorization: `Bearer ${tokens.access_token}`, cookie: 'keystonejs-session=staff' }), { method: 'tools/list', id: 1 });
  assert.deepEqual(plain(bearer.forwardHeaders), { Authorization: `Bearer ${tokens.access_token}` }, 'tokens are forwarded alone, never with cookies');
  const anonymous = await authorizeMcpRequest(h.keystoneContext, mcp({}), { method: 'initialize', id: 1 });
  assert.equal(anonymous.status, 401);
  assert.equal(anonymous.headers.get('www-authenticate'),
    'Bearer resource_metadata="https://shop.example/.well-known/oauth-protected-resource/api/mcp-transport/http", scope="mcp:read mcp:write"');
  const badToken = await authorizeMcpRequest(h.keystoneContext, mcp({ authorization: 'Bearer mcp_at_bogus' }), { method: 'tools/call', id: 7 });
  assert.equal(badToken.status, 200);
  const result = await badToken.json();
  assert.equal(result.result.isError, true);
  assert.match(result.result._meta['mcp/www_authenticate'][0], /error="invalid_token"/);
});

test('the sign-in screen signs people in through Keystone and returns to the same authorize URL', async () => {
  const h = harness();
  const { client_id } = await register(h.routes, h.keystoneContext);
  const query = authorizeQuery(client_id, { screen: 'signin' });
  let variables = null;
  h.keystoneContext.withRequest = async (_req, res) => ({ graphql: { raw: async args => {
    variables = args.variables;
    res.setHeader('Set-Cookie', 'keystonejs-session=sealed; Path=/; HttpOnly; SameSite=Lax');
    return { data: { authenticate: { sessionToken: 'sealed' } } };
  } } });
  const response = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, { method: 'POST', form: { intent: 'signin', email: 'cass@example.invalid', password: 'pw' } }));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('set-cookie'), 'keystonejs-session=sealed; Path=/; HttpOnly; SameSite=Lax');
  const location = response.headers.get('location');
  assert.ok(location.startsWith('/oauth/authorize?') && !location.includes('screen='));
  assert.equal(variables.email, 'cass@example.invalid');
  // Customers can always create an account here; it goes through the public createUser mutation.
  const created = [];
  h.keystoneContext.withRequest = async (_req, res) => ({ graphql: { raw: async args => {
    if (args.query.includes('createUser')) { created.push(args.variables.data); return { data: { createUser: { id: 'new' } } }; }
    res.setHeader('Set-Cookie', 'keystonejs-session=sealed2; Path=/');
    return { data: { authenticate: { sessionToken: 'sealed2' } } };
  } } });
  const signup = await h.routes.authorizePOST(h.keystoneContext, req(`/oauth/authorize?${query}`, { method: 'POST', form: { intent: 'signup', email: 'n@example.invalid', password: 'pw', name: 'N' } }));
  assert.equal(signup.status, 303);
  assert.deepEqual(plain(created), [{ name: 'N', email: 'n@example.invalid', password: 'pw' }], 'no role or other fields can be sent');
});
