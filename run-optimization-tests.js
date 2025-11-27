/**
 * Data Usage Optimization Tests Runner
 * Runs tests for request deduplication and conditional requests
 */

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

// Run the tests
try {
  var optimizationTests = require('./src/services/http-client-optimization.test.js');
  
  process.stdout.write('=================================\n');
  process.stdout.write('Data Usage Optimization Tests\n');
  process.stdout.write('=================================\n\n');
  
  var results = optimizationTests.runHttpClientOptimizationTests();
  
  process.stdout.write('\n=================================\n');
  if (results.failed === 0) {
    process.stdout.write('✓ All tests passed!\n');
    process.exit(0);
  } else {
    process.stdout.write('✗ Some tests failed\n');
    process.exit(1);
  }
} catch (error) {
  process.stderr.write('Error running tests: ' + error.message + '\n');
  process.stderr.write(error.stack + '\n');
  process.exit(1);
}
