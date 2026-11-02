const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('homepage title never falls back to a hard-coded apparel string', () => {
  for (const file of ['features/platform/onboarding/hooks/useOnboardingApi.ts', 'features/platform/onboarding/components/CustomSetupSteps.tsx']) {
    assert.doesNotMatch(read(file), /Modern Apparel Store/);
  }
  assert.match(read('features/platform/onboarding/hooks/useOnboardingApi.ts'), /storeData\.homepageTitle = data\.store\?\.homepageTitle \|\| storeData\.name/);
  assert.match(read('features/storefront/screens/HomePage.tsx'), /store\?\.homepageTitle \|\| store\?\.name \|\| "Openfront Next\.js Starter"/);
});
