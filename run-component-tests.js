/**
 * Component Tests Runner
 * Run all component tests in Node.js environment
 */

console.log('=================================');
console.log('BlueKai Base UI Components Tests');
console.log('=================================\n');

// Mock browser globals for Node.js environment
global.document = {
  activeElement: null,
  body: { style: {} },
  addEventListener: function() {},
  removeEventListener: function() {},
  querySelectorAll: function() { return []; }
};

global.window = {};

// Load test files
var loadingTests = require('./src/components/LoadingIndicator.test.js');
var errorTests = require('./src/components/ErrorMessage.test.js');
var textInputTests = require('./src/components/TextInput.test.js');
var buttonTests = require('./src/components/Button.test.js');
var modalTests = require('./src/components/Modal.test.js');

// Run all tests
var allPassed = true;

console.log('\n1. LoadingIndicator Tests');
console.log('-------------------------');
if (!loadingTests.runLoadingIndicatorTests()) {
  allPassed = false;
}

console.log('\n2. ErrorMessage Tests');
console.log('---------------------');
if (!errorTests.runErrorMessageTests()) {
  allPassed = false;
}

console.log('\n3. TextInput Tests');
console.log('------------------');
if (!textInputTests.runTextInputTests()) {
  allPassed = false;
}

console.log('\n4. Button Tests');
console.log('---------------');
if (!buttonTests.runButtonTests()) {
  allPassed = false;
}

console.log('\n5. Modal Tests');
console.log('--------------');
if (!modalTests.runModalTests()) {
  allPassed = false;
}

console.log('\n=================================');
if (allPassed) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed');
  process.exit(1);
}
