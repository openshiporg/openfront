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

const NEW = '2026-11-02T19:16:00.000Z', OLD = '2026-01-01T00:00:00.000Z';
function db(users) {
  const rows = users.map((u) => ({ roleId: null, accounts: [], ...u }));
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
