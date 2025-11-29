/**
 * Test runner for i18n functionality
 * Run with: node run-i18n-tests.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== i18n Tests ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('✓', message);
    passed++;
  } else {
    console.error('✗', message);
    failed++;
  }
}

// Test 1: Check that all language files exist
console.log('Test 1: Language files exist');
const languages = ['en', 'es', 'fr', 'pt'];
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'i18n', `${lang}.json`);
  const exists = fs.existsSync(filePath);
  assert(exists, `${lang}.json exists`);
});

// Test 2: Validate JSON structure
console.log('\nTest 2: JSON structure validation');
languages.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'i18n', `${lang}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    assert(typeof json === 'object', `${lang}.json is valid JSON`);
    assert(json.common !== undefined, `${lang}.json has 'common' section`);
    assert(json.login !== undefined, `${lang}.json has 'login' section`);
    assert(json.timeline !== undefined, `${lang}.json has 'timeline' section`);
  } catch (e) {
    assert(false, `${lang}.json is valid: ${e.message}`);
  }
});

// Test 3: Check key consistency across languages
console.log('\nTest 3: Key consistency across languages');
const enPath = path.join(__dirname, 'public', 'i18n', 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(enContent);
console.log(`English has ${enKeys.length} translation keys`);

languages.slice(1).forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'i18n', `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const langKeys = getAllKeys(content);
  
  const missingKeys = enKeys.filter(key => !langKeys.includes(key));
  const extraKeys = langKeys.filter(key => !enKeys.includes(key));
  
  assert(missingKeys.length === 0, `${lang}.json has all keys (missing: ${missingKeys.length})`);
  assert(extraKeys.length === 0, `${lang}.json has no extra keys (extra: ${extraKeys.length})`);
  
  if (missingKeys.length > 0) {
    console.log(`  Missing keys in ${lang}:`, missingKeys.slice(0, 5));
  }
  if (extraKeys.length > 0) {
    console.log(`  Extra keys in ${lang}:`, extraKeys.slice(0, 5));
  }
});

// Test 4: Check i18n infrastructure files exist
console.log('\nTest 4: i18n infrastructure files');
const i18nFiles = [
  'src/i18n/i18n.js',
  'src/i18n/useTranslation.js',
  'src/i18n/index.js',
  'src/i18n/i18n.test.js'
];

i18nFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  assert(exists, `${file} exists`);
});

// Test 5: Check that key components import useTranslation
console.log('\nTest 5: Components use translations');
const componentsToCheck = [
  'src/views/LoginView.js'
];

componentsToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasImport = content.includes('useTranslation');
    const usesT = content.includes("t('") || content.includes('t("');
    assert(hasImport && usesT, `${file} uses translations`);
  }
});

// Test 6: Sample translations are correct
console.log('\nTest 6: Sample translation values');
assert(enContent.common.ok === 'OK', 'English common.ok is "OK"');
assert(enContent.login.title === 'BlueKai Login', 'English login.title is correct');
assert(enContent.timeline.title === 'Timeline', 'English timeline.title is correct');

const esPath = path.join(__dirname, 'public', 'i18n', 'es.json');
const esContent = JSON.parse(fs.readFileSync(esPath, 'utf8'));
assert(esContent.common.ok === 'Aceptar', 'Spanish common.ok is "Aceptar"');
assert(esContent.login.title === 'Iniciar sesión en BlueSky', 'Spanish login.title is correct');

const frPath = path.join(__dirname, 'public', 'i18n', 'fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));
assert(frContent.common.ok === 'OK', 'French common.ok is "OK"');
assert(frContent.login.title === 'Connexion à BlueSky', 'French login.title is correct');

const ptPath = path.join(__dirname, 'public', 'i18n', 'pt.json');
const ptContent = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
assert(ptContent.common.ok === 'OK', 'Portuguese common.ok is "OK"');
assert(ptContent.login.title === 'Entrar no BlueSky', 'Portuguese login.title is correct');

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✓ All i18n tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${failed} test(s) failed`);
  process.exit(1);
}
