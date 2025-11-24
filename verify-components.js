/**
 * Verify Component Files
 * Simple script to verify all component files exist
 */

var fs = require('fs');
var path = require('path');

console.log('=================================');
console.log('BlueKai Components Verification');
console.log('=================================\n');

var components = [
  'LoadingIndicator',
  'ErrorMessage',
  'TextInput',
  'Button',
  'Modal'
];

var allFilesExist = true;

components.forEach(function(component) {
  console.log('Checking ' + component + '...');
  
  var jsFile = path.join('src', 'components', component + '.js');
  var cssFile = path.join('src', 'components', component + '.css');
  var testFile = path.join('src', 'components', component + '.test.js');
  
  var jsExists = fs.existsSync(jsFile);
  var cssExists = fs.existsSync(cssFile);
  var testExists = fs.existsSync(testFile);
  
  console.log('  ' + component + '.js: ' + (jsExists ? '✓' : '✗'));
  console.log('  ' + component + '.css: ' + (cssExists ? '✓' : '✗'));
  console.log('  ' + component + '.test.js: ' + (testExists ? '✓' : '✗'));
  
  if (!jsExists || !cssExists || !testExists) {
    allFilesExist = false;
  }
  
  console.log('');
});

// Check additional files
console.log('Checking additional files...');
var additionalFiles = [
  'src/components/index.js',
  'src/components/README.md',
  'src/components/example-usage.js',
  'test-components.html'
];

additionalFiles.forEach(function(file) {
  var exists = fs.existsSync(file);
  console.log('  ' + file + ': ' + (exists ? '✓' : '✗'));
  if (!exists) {
    allFilesExist = false;
  }
});

console.log('\n=================================');
if (allFilesExist) {
  console.log('✓ All component files created successfully!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run build" to build the project');
  console.log('2. Open test-components.html in a browser to test components');
  console.log('3. Import components using: import { Button } from "./components"');
  process.exit(0);
} else {
  console.log('✗ Some files are missing');
  process.exit(1);
}
