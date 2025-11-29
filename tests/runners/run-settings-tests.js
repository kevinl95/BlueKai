/**
 * Settings Tests Runner
 * Runs settings utilities tests in Node.js environment
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
  var settingsTests = require('./src/utils/settings.test.js');
  
  process.stdout.write('=================================\n');
  process.stdout.write('Settings Utilities Tests\n');
  process.stdout.write('=================================\n\n');
  
  var results = settingsTests.runSettingsTests();
  
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
