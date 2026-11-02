const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const file = path.resolve(__dirname, '../features/platform/onboarding/lib/onboarding-visibility.ts');
const module_ = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(module_, module_.exports);
const { shouldShowOnboardingCard } = module_.exports;

test('an empty store with onboarding not started shows the card to a manager', () => {
  assert.equal(shouldShowOnboardingCard({ canManageOnboarding: true, onboardingStatus: 'not_started', productsCount: 0 }), true);
});
test('staff without onboarding permission never see it', () => {
  assert.equal(shouldShowOnboardingCard({ canManageOnboarding: false, onboardingStatus: 'not_started', productsCount: 0 }), false);
});
test('completed or dismissed onboarding hides it', () => {
  assert.equal(shouldShowOnboardingCard({ canManageOnboarding: true, onboardingStatus: 'completed', productsCount: 0 }), false);
  assert.equal(shouldShowOnboardingCard({ canManageOnboarding: true, onboardingStatus: 'dismissed', productsCount: 0 }), false);
});
test('a store that already has products hides it', () => {
  assert.equal(shouldShowOnboardingCard({ canManageOnboarding: true, onboardingStatus: 'not_started', productsCount: 10 }), false);
});
test('an unknown product count falls back to the onboarding status', () => {
  assert.equal(shouldShowOnboardingCard({ canManageOnboarding: true, onboardingStatus: 'in_progress', productsCount: null }), true);
});
