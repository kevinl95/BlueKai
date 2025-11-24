/**
 * Test runner for navigation system
 * Runs all navigation tests in Node.js
 */

console.log('=================================');
console.log('Navigation System Test Runner');
console.log('=================================\n');

var navResults = { passed: 0, failed: 0 };
var routerResults = { passed: 0, failed: 0 };

// Run NavigationManager tests
console.log('Running NavigationManager tests...\n');
try {
  var navTests = require('./src/navigation/navigation-manager.test.js');
  if (navTests && navTests.runTests) {
    navResults = navTests.runTests();
  } else {
    console.error('NavigationManager tests module not properly exported');
  }
} catch (e) {
  console.error('Error running NavigationManager tests:', e.message);
  console.error(e.stack);
}

console.log('\n---\n');

// Run Router tests
console.log('Running Router tests...\n');
try {
  var routerTests = require('./src/navigation/router.test.js');
  if (routerTests && routerTests.runTests) {
    routerResults = routerTests.runTests();
  } else {
    console.error('Router tests module not properly exported');
  }
} catch (e) {
  console.error('Error running Router tests:', e.message);
  console.error(e.stack);
}

// Summary
console.log('\n=================================');
console.log('Overall Summary');
console.log('=================================');
console.log('NavigationManager:');
console.log('  Passed:', navResults.passed);
console.log('  Failed:', navResults.failed);
console.log('\nRouter:');
console.log('  Passed:', routerResults.passed);
console.log('  Failed:', routerResults.failed);
console.log('\nTotal:');
console.log('  Passed:', navResults.passed + routerResults.passed);
console.log('  Failed:', navResults.failed + routerResults.failed);
console.log('=================================\n');

// Exit with error code if any tests failed
var totalFailed = navResults.failed + routerResults.failed;
if (totalFailed > 0) {
  console.log('✗ Some tests failed\n');
  process.exit(1);
} else {
  console.log('✓ All tests passed!\n');
  process.exit(0);
}
