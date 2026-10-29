// Claiming a fresh install: createInitialUser needs SETUP_TOKEN when it is set.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { parse } = require('graphql');
const root = path.resolve(__dirname, '..');

function load() {
  const filename = path.join(root, 'features/keystone/setup-token.ts');
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { module, exports: module.exports, require, Buffer });
  return module.exports;
}
const guard = load();
const run = (env, query, headers = {}, operationName) => {
  let stopped = null;
  guard.useSetupTokenGuard(env).onExecute({
    args: { document: parse(query), operationName, contextValue: { req: { headers } } },
    setResultAndStopExecution: (r) => (stopped = r),
  });
  return stopped;
};
const claim = 'mutation { createInitialUser(data:{name:"a",email:"a@b.c",password:"x"}) { item { id } } }';

test('without SETUP_TOKEN nothing changes', () => {
  assert.equal(run({}, claim), null);
});
test('with SETUP_TOKEN, claiming needs the matching x-setup-token header', () => {
  const env = { SETUP_TOKEN: 'correct-horse-battery-staple-0123456789' };
  assert.match(run(env, claim).errors[0].message, /setup token/);
  assert.match(run(env, claim, { 'x-setup-token': 'wrong' }).errors[0].message, /setup token/);
  assert.equal(run(env, claim, { 'x-setup-token': env.SETUP_TOKEN }), null);
});
test('other operations are never affected', () => {
  const env = { SETUP_TOKEN: 's'.repeat(32) };
  assert.equal(run(env, '{ redirectToInit }'), null);
  assert.equal(run(env, 'mutation { authenticateUserWithPassword(email:"a",password:"b") { __typename } }'), null);
});
test('a named operation in a multi-operation document is checked', () => {
  const env = { SETUP_TOKEN: 's'.repeat(32) };
  const doc = `query A { redirectToInit } ${claim.replace('mutation', 'mutation B')}`;
  assert.equal(run(env, doc, {}, 'A'), null);
  assert.ok(run(env, doc, {}, 'B'));
});
test('the GraphQL route installs the guard', () => {
  assert.match(fs.readFileSync(path.join(root, 'pages/api/graphql.ts'), 'utf8'), /useSetupTokenGuard\(\)/);
});
