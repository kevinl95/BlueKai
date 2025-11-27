#!/usr/bin/env node

/**
 * Verification script for production build
 * Checks that all required files are present and properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Build');
console.log('='.repeat(60));
console.log('');

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

// Check dist directory exists
const distExists = fs.existsSync('dist');
check('dist/ directory exists', distExists);

if (!distExists) {
  console.log('\n❌ Build verification failed: dist/ directory not found');
  console.log('Run: npm run build:prod');
  process.exit(1);
}

// Check required files
const requiredFiles = [
  'dist/index.html',
  'dist/manifest.webapp',
  'dist/.nojekyll'
];

requiredFiles.forEach(file => {
  check(`${file} exists`, fs.existsSync(file));
});

// Check for JS bundles
const jsFiles = fs.readdirSync('dist').filter(f => f.endsWith('.js'));
check('JavaScript bundles generated', jsFiles.length > 0);

// Check for gzipped files
const gzFiles = fs.readdirSync('dist').filter(f => f.endsWith('.js.gz'));
check('Gzipped bundles generated', gzFiles.length > 0);

// Check i18n files
const i18nDir = path.join('dist', 'i18n');
if (fs.existsSync(i18nDir)) {
  const i18nFiles = ['en.json', 'es.json', 'fr.json', 'pt.json'];
  i18nFiles.forEach(file => {
    check(`i18n/${file} exists`, fs.existsSync(path.join(i18nDir, file)));
  });
}

// Check bundle sizes
let totalGzSize = 0;
gzFiles.forEach(file => {
  const filePath = path.join('dist', file);
  const stats = fs.statSync(filePath);
  totalGzSize += stats.size;
});

const totalGzSizeKB = totalGzSize / 1024;
check(`Total gzipped size under 200KB (${totalGzSizeKB.toFixed(2)} KB)`, totalGzSizeKB < 200);

// Check index.html is minified
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
check('index.html is minified', !indexHtml.includes('\n  ') && indexHtml.length < 2000);

// Check for ES5 compatibility (no arrow functions in bundle)
const mainBundle = jsFiles[0];
if (mainBundle) {
  const bundleContent = fs.readFileSync(path.join('dist', mainBundle), 'utf8');
  // This is a simple check - arrow functions should be transpiled
  const hasArrowFunctions = /=>\s*{/.test(bundleContent.substring(0, 10000));
  check('Bundle transpiled to ES5 (no arrow functions)', !hasArrowFunctions);
}

// Check manifest.webapp
const manifest = JSON.parse(fs.readFileSync('dist/manifest.webapp', 'utf8'));
check('manifest.webapp has name', !!manifest.name);
check('manifest.webapp has description', !!manifest.description);

console.log('');
console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('');

if (failed > 0) {
  console.log('❌ Build verification failed');
  console.log('Please review the failed checks above');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Production build is ready');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Test locally: npm run serve');
  console.log('  2. Deploy to GitHub Pages: git push origin main');
  console.log('  3. Or deploy to AWS Amplify (see BUILD.md)');
}

console.log('');
