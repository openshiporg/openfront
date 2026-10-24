// Node's built-in test runner; uses the existing TypeScript devDependency to load
// actual source with isolated framework/provider mocks. No DB, network or real env.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function sandbox({ env = {}, mocks = {}, fetch: fetchImpl, logs = [] } = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(root, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    } }).outputText;
    const module = { exports: {} };
    cache.set(filename, module);
    function localRequire(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      const resolved = specifier.startsWith('@/') ? path.join(root, specifier.slice(2))
        : specifier.startsWith('.') ? path.resolve(path.dirname(filename), specifier) : null;
      if (resolved) return load(`${resolved}.ts`);
      throw new Error(`Unmocked dependency: ${specifier}`);
    }
    vm.runInNewContext(output, {
      module, exports: module.exports, require: localRequire,
      process: { env }, console: Object.fromEntries(['error', 'warn', 'log'].map(level =>
        [level, (...args) => logs.push(args)])),
      URL, Request, Response, Headers, FormData, File, Blob, TextDecoder,
      structuredClone, fetch: fetchImpl || (() => { throw new Error('Unexpected network request'); }),
    }, { filename });
    return module.exports;
  }
  return { load, logs };
}
const plain = value => JSON.parse(JSON.stringify(value));
const securityPath = 'features/dashboard/lib/security.ts';

function authSandbox(response, throws = false) {
  const cookies = [];
  const instance = sandbox({ mocks: {
    'next/headers': { cookies: async () => ({ set: (...args) => cookies.push(args) }) },
    'next/navigation': { redirect: target => { throw Object.assign(new Error('redirect'), { target }); } },
    'next/cache': { revalidatePath() {} },
    '@/features/dashboard/lib/cookies': { removeAuthToken: async () => {} },
    '@/features/dashboard/lib/keystoneClient': { keystoneClient: async () => {
      if (throws) throw new Error('synthetic internal SQL/request/password detail');
      return response;
    } },
  } });
  return { ...instance, auth: instance.load('features/dashboard/actions/auth.ts'), cookies };
}
function form(from = '/dashboard/orders') {
  const data = new FormData();
  data.set('email', 'test@example.invalid'); data.set('password', 'synthetic-password');
  data.set('name', 'Test'); data.set('token', 'synthetic-token'); data.set('from', from);
  return data;
}

test('redirect sanitizer accepts same-site paths and rejects URL/backslash/encoded/control bypasses', () => {
  const { sanitizeDashboardRedirect: sanitize } = sandbox().load(securityPath);
  for (const value of ['/dashboard/orders', '/dashboard?tab=orders#recent', '/dashboard?search=hello%20world', '/']) assert.equal(sanitize(value), value);
  for (const value of [undefined, null, 1, {}, '', '//evil.invalid', 'https://evil.invalid',
    'javascript:alert(1)', '\\evil.invalid', '/\\evil.invalid', '/%5cevil.invalid', '/%2fevil.invalid',
    '/%252fevil.invalid', '/%255cevil.invalid', ' /dashboard', '/\nevil.invalid', '/%0devil.invalid',
    '/%zz', '/%25252525252525252fevil.invalid']) assert.equal(sanitize(value), '/dashboard');
});

test('shared-key actions return availability/model only, never a key in any configuration', async () => {
  for (const env of [{}, { OPENROUTER_API_KEY: 'synthetic-shared-key' },
    { OPENROUTER_API_KEY: 'synthetic-shared-key', OPENROUTER_MODEL: 'test-model', OPENROUTER_MAX_TOKENS: '42' }]) {
    const actions = sandbox({ env }).load('features/dashboard/actions/ai-chat.ts');
    const result = await actions.getSharedKeys();
    assert.deepEqual(Object.keys(result).sort(), ['available', 'model']);
    assert.equal(result.available, !!(env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL));
    assert.doesNotMatch(JSON.stringify([result, await actions.checkSharedKeysAvailable()]), /synthetic-shared-key/);
  }
});

test('GraphQL errors log only a fixed message and admitted codes; no request/variables/headers/message leak', async () => {
  const error = Object.assign(new Error('synthetic-password in ClientError.message'), {
    request: { variables: { email: 'private@example.invalid', password: 'synthetic-password' }, headers: { cookie: 'synthetic-cookie' } },
    response: { errors: [
      { message: 'synthetic-password', extensions: { code: 'FORBIDDEN', originalError: { message: 'internal SQL' } } },
      { extensions: { code: 'synthetic-password' } },
    ] },
  });
  const instance = sandbox({ mocks: {
    '@/features/dashboard/lib/cookies': { getAuthHeaders: async () => ({}) },
    '@/features/dashboard/lib/getBaseUrl': { getGraphQLEndpoint: async () => 'https://test.invalid/api/graphql' },
    'graphql-request': { GraphQLClient: class { async request() { throw error; } } },
  } });
  const result = await instance.load('features/dashboard/lib/keystoneClient.ts').keystoneClient('query', { password: 'synthetic-password' });
  assert.equal(result.success, false);
  assert.deepEqual(plain(instance.logs[0][1]), { message: 'Unable to complete the request. Please try again.', codes: ['FORBIDDEN'] });
  assert.doesNotMatch(JSON.stringify([result, instance.logs]), /synthetic-|variables|headers|internal SQL|private@/);
});

test('multipart GraphQL failures and thrown fetch errors are also sanitized', async () => {
  for (const throwError of [false, true]) {
    const instance = sandbox({ fetch: async () => {
      if (throwError) throw new Error('synthetic-password');
      return Response.json({ errors: [{ message: 'synthetic-password', extensions: { code: 'FORBIDDEN' } }] });
    }, mocks: {
      '@/features/dashboard/lib/cookies': { getAuthHeaders: async () => ({}) },
      '@/features/dashboard/lib/getBaseUrl': { getGraphQLEndpoint: async () => 'https://test.invalid/api/graphql' },
      'graphql-request': { GraphQLClient: class {} },
    } });
    const result = await instance.load('features/dashboard/lib/keystoneClient.ts').keystoneClient('mutation', { upload: new File(['test'], 'test.txt') });
    assert.equal(result.success, false);
    assert.doesNotMatch(JSON.stringify([result, instance.logs]), /synthetic-password/);
  }
});

test('all sign-in/sign-up failure branches return email only and plain messages', async () => {
  for (const response of [{ success: false, error: 'synthetic internal detail' },
    { success: true, data: { authenticate: { message: 'synthetic internal detail' } } },
    { success: true, data: {} }]) {
    for (const throws of [false, true]) {
      const { auth, logs } = authSandbox(response, throws);
      for (const action of ['signIn', 'signUp']) {
        const state = await auth[action]({ message: null, formData: { email: '' } }, form());
        assert.deepEqual(plain(state.formData), { email: 'test@example.invalid' });
        assert.doesNotMatch(state.message, /synthetic|SQL|ClientError/);
      }
      assert.doesNotMatch(JSON.stringify(logs), /synthetic/);
    }
  }
});

test('successful sign-in sets the protected cookie and sanitizes the actual redirect', async () => {
  for (const [from, expected] of [['//evil.invalid', '/dashboard'], ['/dashboard/orders', '/dashboard/orders']]) {
    const { auth, cookies } = authSandbox({ success: true, data: { authenticate: { sessionToken: 'synthetic-session' } } });
    await assert.rejects(auth.signIn({ message: null, formData: { email: '' } }, form(from)), error => error.target === expected);
    assert.equal(cookies[0][0], 'keystonejs-session');
    assert.equal(cookies[0][2].httpOnly, true);
    assert.equal(cookies[0][2].sameSite, 'lax');
  }
});

test('initial-user and reset-password states never return passwords or reset tokens', async () => {
  // keystoneClient already reduces internal failures to this fixed text (see shared-dashboard tests)
  const { auth } = authSandbox({ success: false, error: 'Unable to complete the request. Please try again.' });
  const initial = await auth.createInitialUser({}, form());
  assert.deepEqual(Object.keys(initial.formData).sort(), ['email', 'name']);
  for (const mode of ['request', 'reset']) {
    const state = await auth.resetPassword({}, form(), mode);
    assert.deepEqual(Object.keys(state.formData), ['email']);
    assert.doesNotMatch(JSON.stringify(state), /synthetic|token|password"/);
  }
});

function completionSandbox({ session, env = {}, validationStatus = 200, providerError = false, permissionHelper } = {}) {
  const captures = { network: [], models: [], streams: [], sessions: [], transports: [] };
  const instance = sandbox({ env, fetch: async (url, init) => {
    captures.network.push({ url: String(url), init });
    return new Response('synthetic provider internal detail', { status: validationStatus });
  }, mocks: {
    'ai': { convertToModelMessages: async messages => messages, stepCountIs: n => n,
      streamText: config => {
        captures.streams.push(config);
        if (providerError) throw new Error('synthetic provider secret error');
        return { toUIMessageStreamResponse: options => {
          assert.equal(options.onError(new Error('synthetic provider error')), 'Unable to complete the request. Please try again.');
          return new Response('data: {"type":"text-delta","delta":"hello"}\n\ndata: [DONE]\n\n', {
            headers: { 'content-type': 'text/event-stream' },
          });
        } };
      } },
    '@ai-sdk/mcp': { createMCPClient: async () => ({ tools: async () => ({}), close: async () => {} }) },
    '@openrouter/ai-sdk-provider': { createOpenRouter: options => {
      captures.models.push(options); return model => model;
    } },
    '@modelcontextprotocol/sdk/client/streamableHttp.js': { StreamableHTTPClientTransport: class {
      constructor(endpoint, options) { captures.transports.push({ endpoint, options }); }
    } },
    '@/features/dashboard/lib/getBaseUrl': { getBaseUrl: async () => 'https://trusted.invalid' },
    '@/features/keystone/context': { keystoneContext: { withRequest: async request => {
      captures.sessions.push(request); return { session };
    } } },
    '@/features/keystone/access': { permissions: permissionHelper === null ? {} : {
      canAccessDashboard: permissionHelper || (({ session }) => session?.data?.role?.canAccessDashboard === true),
    } },
  } });
  return { ...instance, captures, POST: instance.load('app/api/completion/route.ts').POST };
}
function completionRequest(body) {
  return new Request('https://trusted.invalid/api/completion', { method: 'POST',
    headers: { 'content-type': 'application/json', cookie: 'keystonejs-session=synthetic-session', authorization: 'Bearer synthetic-ignored' },
    body: JSON.stringify({ prompt: 'hello', messages: [{ role: 'user', content: 'hello' }], ...body }),
  });
}
const operator = { itemId: 'operator', data: { role: { canAccessDashboard: true } } };

test('anonymous and non-dashboard shared requests fail before reading server keys or making requests', async () => {
  for (const [session, status] of [[undefined, 401], [{ itemId: 'customer', data: { role: {} } }, 403]]) {
    const env = new Proxy({}, { get() { throw new Error('Server key resolved before authorization'); } });
    const { POST, captures } = completionSandbox({ session, env });
    assert.equal((await POST(completionRequest({ useLocalKeys: false }))).status, status);
    assert.equal(captures.network.length, 0); assert.equal(captures.models.length, 0);
    assert.deepEqual(Object.keys(captures.sessions[0].headers), ['cookie']);
  }
});

test('async permission denials are awaited, and legacy role-only dashboard policy stays fail-closed', async () => {
  const env = { OPENROUTER_API_KEY: 'synthetic-key', OPENROUTER_MODEL: 'test' };
  const denied = completionSandbox({ session: operator, env, permissionHelper: async () => false });
  assert.equal((await denied.POST(completionRequest({ useLocalKeys: false }))).status, 403);
  assert.equal(denied.captures.network.length, 0);
  for (const [session, status] of [[operator, 200], [{ itemId: 'customer', data: { role: {} } }, 403]]) {
    const instance = completionSandbox({ session, env, permissionHelper: null });
    assert.equal((await instance.POST(completionRequest({ useLocalKeys: false }))).status, status);
  }
});

test('shared and local requests stream end-to-end through mocked provider/MCP without exposing keys', async () => {
  const originalFetch = globalThis.fetch;
  for (const local of [false, true]) {
    const { POST, captures, logs } = completionSandbox({ session: local ? undefined : operator,
      env: { OPENROUTER_API_KEY: 'synthetic-shared-key', OPENROUTER_MODEL: 'shared-model', OPENROUTER_MAX_TOKENS: '42' } });
    const response = await POST(completionRequest({ useLocalKeys: local, apiKey: 'synthetic-local-key', model: 'local-model', maxTokens: 99 }));
    assert.equal(response.status, 200);
    const text = await response.text();
    assert.match(text, /hello/); assert.doesNotMatch(text, /synthetic/);
    assert.equal(captures.models[0].apiKey, local ? 'synthetic-local-key' : 'synthetic-shared-key');
    assert.equal(captures.streams[0].model, local ? 'local-model' : 'shared-model');
    assert.equal(captures.streams[0].maxOutputTokens, local ? 99 : 42);
    assert.equal(captures.streams[0].messages[0].parts[0].text, 'hello');
    assert.equal(captures.network[0].init.headers.Cookie, undefined);
    assert.doesNotMatch(JSON.stringify(logs), /synthetic/);
    assert.equal(captures.sessions.length, local ? 0 : 1);
  }
  assert.equal(globalThis.fetch, originalFetch);
});

test('missing configuration/local key and provider failures return plain errors without detail leaks', async () => {
  for (const [options, body, expected] of [
    [{ session: operator }, { useLocalKeys: false }, 503],
    [{}, { useLocalKeys: true }, 400],
    [{ validationStatus: 401 }, { useLocalKeys: true, apiKey: 'synthetic-key', model: 'test' }, 401],
    [{ providerError: true }, { useLocalKeys: true, apiKey: 'synthetic-key', model: 'test' }, 500],
  ]) {
    const { POST, logs } = completionSandbox(options);
    const response = await POST(completionRequest(body));
    assert.equal(response.status, expected);
    assert.doesNotMatch(JSON.stringify([await response.json(), logs]), /synthetic|stack|details/);
  }
});

test('scoped MCP fetch forwards cookies only to the exact endpoint and never changes global fetch', async () => {
  const captures = [];
  const originalFetch = globalThis.fetch;
  const { createScopedMcpFetch } = sandbox().load('app/api/completion/scopedMcpFetch.ts');
  const endpoint = new URL('https://trusted.invalid/api/mcp-transport/http');
  const scoped = createScopedMcpFetch(endpoint, 'synthetic-cookie', async (url, init) => {
    captures.push({ url, init }); return new Response('{}');
  });
  await scoped(endpoint, { method: 'POST' });
  assert.equal(captures[0].init.headers.get('cookie'), 'synthetic-cookie');
  assert.equal(captures[0].init.redirect, 'manual');
  for (const target of ['https://evil.invalid/api/mcp-transport/http', 'https://trusted.invalid/api/graphql', 'https://trusted.invalid/api/mcp-transport/http?x=1']) {
    await assert.rejects(scoped(target), /outside/);
  }
  assert.equal(captures.length, 1); assert.equal(globalThis.fetch, originalFetch);
});

test('the submission hook decodes fragmented SDK SSE, legacy streams and safe errors', async () => {
  const { readCompletionEvents } = sandbox().load('features/dashboard/lib/completionStream.ts');
  const payload = 'data: {"type":"text-delta","delta":"héllo"}\n\n'
    + 'data: {"type":"tool-input-available","toolCallId":"a","toolName":"createData"}\n\n'
    + 'data: {"type":"tool-output-available","toolCallId":"a"}\n\n'
    + 'data: {"type":"error","errorText":"synthetic-secret"}\n\n'
    + 'data: [DONE]\n\n';
  async function collect(text) {
    const bytes = new TextEncoder().encode(text);
    const stream = new ReadableStream({ start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    } });
    const events = [];
    for await (const event of readCompletionEvents(stream)) events.push(plain(event));
    return events;
  }
  assert.deepEqual(await collect(payload), [{ type: 'text', text: 'héllo' }, { type: 'changed' }, { type: 'error' }]);
  assert.deepEqual(await collect('0:"hello"\n9:{"dataHasChanged":true}\n3:"synthetic-secret"'),
    [{ type: 'text', text: 'hello' }, { type: 'changed' }, { type: 'error' }]);
});

test('both browser chat clients request shared mode without fetching or posting a shared credential', () => {
  for (const relative of ['features/dashboard/hooks/use-chat-submission.tsx', 'features/dashboard/components/dual-sidebar/ai-chat-sidebar.tsx']) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.doesNotMatch(source, /getSharedKeys|keysResult|OPENROUTER_API_KEY/);
    assert.match(source, /useLocalKeys: false/);
    assert.match(source, /apiKey: aiConfig.localKeys.apiKey/);
  }
});
