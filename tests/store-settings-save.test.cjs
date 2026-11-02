// Store Settings save path: what updateStoreSettings sends to updateStore.
// sanitizeStoreLogoSvg -> normalizeStoreLogoColor -> mutation payload. Offline.
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
  vm.runInNewContext(output, { module, exports: module.exports }, { filename });
  return module.exports;
}

const { sanitizeStoreLogoSvg } = load('features/keystone/utils/storeLogo.ts');
const { normalizeStoreLogoColor } = load('features/platform/store-settings/lib/store-logo.ts');
const { LOGO_ICONS } = load('features/platform/store-settings/lib/icon-registry.ts');

// Mirrors updateStoreSettings in features/platform/store-settings/actions/index.ts.
function payload(data) {
  const sanitizedData = {
    ...data,
    logoIcon: data.logoIcon ? sanitizeStoreLogoSvg(data.logoIcon) : undefined,
    logoColor: data.logoColor === undefined ? undefined : normalizeStoreLogoColor(data.logoColor),
  };
  if (data.logoIcon && !sanitizedData.logoIcon) return { success: false, error: 'Invalid SVG format' };
  return { success: true, data: sanitizedData };
}

test('the action still composes sanitize, normalize and updateStore', () => {
  const source = fs.readFileSync(path.join(root, 'features/platform/store-settings/actions/index.ts'), 'utf8');
  assert.match(source, /sanitizeStoreLogoSvg\(data\.logoIcon\)/);
  assert.match(source, /normalizeStoreLogoColor\(data\.logoColor\)/);
  assert.match(source, /updateStore\(where: \{ id: \$id \}, data: \$data\)/);
  assert.match(source, /data: sanitizedData/);
});

test('a preset icon and hue reach the mutation unchanged', () => {
  const icon = LOGO_ICONS.find((entry) => entry.id === 'acme-corp').lightSvg;
  assert.deepEqual(payload({ name: 'Impossible', logoIcon: icon, logoColor: '120' }).data,
    { name: 'Impossible', logoIcon: icon, logoColor: '120' });
});

test('every preset survives the sanitizer', () => {
  for (const icon of LOGO_ICONS) assert.equal(payload({ logoIcon: icon.lightSvg }).success, true, icon.id);
});

test('a pasted custom SVG is kept, trimmed', () => {
  const svg = '<svg fill="none" height="100%" viewBox="0 0 48 48" width="100%" xmlns="http://www.w3.org/2000/svg"><path d="m48 11h-17z" fill="#087443"/></svg>';
  assert.equal(payload({ logoIcon: `\n${svg} ` }).data.logoIcon, svg);
});

test('the hue is normalized to 0-359', () => {
  assert.equal(payload({ logoColor: '-90' }).data.logoColor, '270');
  assert.equal(payload({ logoColor: '400' }).data.logoColor, '40');
  assert.equal(payload({ logoColor: 'red' }).data.logoColor, '0');
});

test('an unsafe SVG rejects the save', () => {
  assert.deepEqual(payload({ logoIcon: '<svg onload="alert(1)"></svg>' }), { success: false, error: 'Invalid SVG format' });
});
