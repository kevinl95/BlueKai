#!/usr/bin/env node

/**
 * Test runner for offline support tests
 * Runs network status utility tests
 */

// Run network status tests
console.log('='.repeat(60));
console.log('Running Offline Support Tests');
console.log('='.repeat(60));
console.log('');

try {
  var testNetworkStatus = require('./src/utils/network-status.test.js');
  
  console.log('Network Status Utility Tests');
  console.log('-'.repeat(60));
  var result = testNetworkStatus();
  
  console.log('');
  console.log('='.repeat(60));
  
  if (result) {
    console.log('✓ All offline support tests passed!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed');
    process.exit(1);
  }
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}
