/**
 * Test script to verify the i18n createContext fix
 */

const fs = require('fs');

console.log('Testing i18n createContext fix...\n');

// Test 1: Check useTranslation.js doesn't use createContext
console.log('Test 1: Checking useTranslation.js...');
const useTranslationContent = fs.readFileSync('src/i18n/useTranslation.js', 'utf8');

if (useTranslationContent.includes('createContext')) {
  console.log('❌ FAIL: useTranslation.js still contains createContext');
  process.exit(1);
} else {
  console.log('✅ PASS: useTranslation.js does not use createContext');
}

// Test 2: Check that setI18nInstance is exported
if (useTranslationContent.includes('export { useTranslation, I18nProvider, setI18nInstance }')) {
  console.log('✅ PASS: setI18nInstance is exported');
} else {
  console.log('❌ FAIL: setI18nInstance is not exported');
  process.exit(1);
}

// Test 3: Check that index.js calls setI18nInstance
console.log('\nTest 2: Checking index.js...');
const indexContent = fs.readFileSync('src/index.js', 'utf8');

if (indexContent.includes('setI18nInstance')) {
  console.log('✅ PASS: index.js imports and uses setI18nInstance');
} else {
  console.log('❌ FAIL: index.js does not use setI18nInstance');
  process.exit(1);
}

// Test 4: Check that the global i18n pattern is used
console.log('\nTest 3: Checking implementation pattern...');
if (useTranslationContent.includes('var globalI18n = null')) {
  console.log('✅ PASS: Uses global i18n pattern');
} else {
  console.log('❌ FAIL: Does not use global i18n pattern');
  process.exit(1);
}

console.log('\n✅ All tests passed! The createContext issue should be fixed.');
console.log('\nThe fix:');
console.log('- Removed createContext dependency from Preact');
console.log('- Uses a simple global i18n instance instead');
console.log('- setI18nInstance is called in index.js after i18n initialization');
console.log('\nTo verify in production:');
console.log('1. Build: npm run build');
console.log('2. Serve: npx serve dist');
console.log('3. Open in browser and check console for errors');
