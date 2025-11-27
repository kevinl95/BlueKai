#!/usr/bin/env node

/**
 * Verify offline support files are correctly formatted
 */

const fs = require('fs');

console.log('Verifying offline support implementation...\n');

const filesToCheck = [
  {
    path: 'src/utils/network-status.js',
    shouldHave: ['export default networkStatus'],
    shouldNotHave: ['module.exports']
  },
  {
    path: 'src/components/OfflineIndicator.js',
    shouldHave: ['export default OfflineIndicator', 'import { h }'],
    shouldNotHave: ['module.exports', 'require(']
  },
  {
    path: 'src/components/App.js',
    shouldHave: ['import OfflineIndicator', 'import networkStatus'],
    shouldNotHave: []
  },
  {
    path: 'src/services/http-client.js',
    shouldHave: ['import networkStatus', 'networkStatus.getStatus()'],
    shouldNotHave: []
  },
  {
    path: 'src/index.js',
    shouldHave: ['OfflineIndicator.css'],
    shouldNotHave: []
  }
];

let allPassed = true;

filesToCheck.forEach(file => {
  console.log(`Checking ${file.path}...`);
  
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Check for required content
    file.shouldHave.forEach(text => {
      if (content.indexOf(text) === -1) {
        console.error(`  ✗ Missing: "${text}"`);
        allPassed = false;
      } else {
        console.log(`  ✓ Found: "${text}"`);
      }
    });
    
    // Check for forbidden content
    file.shouldNotHave.forEach(text => {
      if (content.indexOf(text) !== -1) {
        console.error(`  ✗ Should not have: "${text}"`);
        allPassed = false;
      } else {
        console.log(`  ✓ Correctly excludes: "${text}"`);
      }
    });
    
    console.log('');
  } catch (error) {
    console.error(`  ✗ Error reading file: ${error.message}\n`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('✓ All files are correctly formatted!');
  console.log('\nIf you\'re still seeing errors:');
  console.log('1. Stop the dev server (Ctrl+C)');
  console.log('2. Clear browser cache');
  console.log('3. Delete dist/ and node_modules/.cache/ folders');
  console.log('4. Run: npm run build');
  console.log('5. Restart dev server: npm run dev');
  process.exit(0);
} else {
  console.error('✗ Some files have issues');
  process.exit(1);
}
