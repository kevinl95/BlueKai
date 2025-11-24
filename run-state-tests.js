#!/usr/bin/env node

/**
 * State Management Test Runner
 * Runs all state management tests in Node.js environment
 * Compatible with Gecko 48 (ES5)
 */

// Mock Preact for Node.js testing
var preactMock = {
  h: function() { return {}; },
  createContext: function(defaultValue) {
    return {
      Provider: function() {},
      Consumer: function() {},
      _defaultValue: defaultValue
    };
  },
  useContext: function(context) {
    return context._defaultValue;
  },
  useReducer: function(reducer, initialState) {
    return [initialState, function() {}];
  },
  useEffect: function() {}
};

// Mock require for 'preact'
var Module = require('module');
var originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'preact') {
    return preactMock;
  }
  return originalRequire.apply(this, arguments);
};

// Mock localStorage for Node.js
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _data: {},
    getItem: function(key) {
      return this._data[key] || null;
    },
    setItem: function(key, value) {
      this._data[key] = String(value);
    },
    removeItem: function(key) {
      delete this._data[key];
    },
    clear: function() {
      this._data = {};
    }
  };
}

// Load test modules
var appStateTests = require('./src/state/app-state.test.js');
var reducerTests = require('./src/state/reducer.test.js');
var sessionManagerTests = require('./src/state/session-manager.test.js');

console.log('='.repeat(60));
console.log('RUNNING ALL STATE MANAGEMENT TESTS');
console.log('='.repeat(60));

var totalPassed = 0;
var totalFailed = 0;

try {
  // Run app state tests
  console.log('\n--- Running App State Tests ---');
  var appStateResults = appStateTests.runAppStateTests();
  totalPassed += appStateResults.passed;
  totalFailed += appStateResults.failed;
  
  // Run reducer tests
  console.log('\n--- Running Reducer Tests ---');
  var reducerResults = reducerTests.runReducerTests();
  totalPassed += reducerResults.passed;
  totalFailed += reducerResults.failed;
  
  // Run session manager tests
  console.log('\n--- Running Session Manager Tests ---');
  var sessionResults = sessionManagerTests.runSessionManagerTests();
  totalPassed += sessionResults.passed;
  totalFailed += sessionResults.failed;
  
  // Display final summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('Total Passed: ' + totalPassed);
  console.log('Total Failed: ' + totalFailed);
  console.log('Total Tests: ' + (totalPassed + totalFailed));
  console.log('Success Rate: ' + ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2) + '%');
  console.log('='.repeat(60));
  
  if (totalFailed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
  }
} catch (error) {
  console.error('\nError running tests:', error);
  process.exit(1);
}
