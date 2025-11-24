/**
 * Unit tests for StorageManager
 * Simple test runner compatible with Gecko 48
 */

// Mock localStorage for testing
function createMockStorage() {
  var store = {};
  var length = 0;
  
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      if (!store.hasOwnProperty(key)) {
        length++;
      }
      store[key] = String(value);
    },
    removeItem: function(key) {
      if (store.hasOwnProperty(key)) {
        delete store[key];
        length--;
      }
    },
    clear: function() {
      store = {};
      length = 0;
    },
    key: function(index) {
      var keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
}

// Test runner
function runTests() {
  var tests = [];
  var passed = 0;
  var failed = 0;
  
  function test(name, fn) {
    tests.push({ name: name, fn: fn });
  }
  
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || 'Expected ' + expected + ' but got ' + actual);
    }
  }
  
  function assertDeepEqual(actual, expected, message) {
    var actualStr = JSON.stringify(actual);
    var expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(message || 'Expected ' + expectedStr + ' but got ' + actualStr);
    }
  }
  
  // Load StorageManager
  var StorageManager;
  if (typeof require !== 'undefined') {
    try {
      StorageManager = require('./storage.js');
    } catch (e) {
      console.error('Failed to load StorageManager:', e.message);
      return { passed: 0, failed: tests.length, total: tests.length };
    }
  } else if (typeof window !== 'undefined' && window.StorageManager) {
    StorageManager = window.StorageManager;
  }
  
  if (!StorageManager) {
    console.error('StorageManager not found');
    return { passed: 0, failed: tests.length, total: tests.length };
  }
  
  // Test: Basic set and get
  test('should set and get string values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    var result = manager.set('test', 'value');
    assert(result === true, 'set should return true');
    
    var value = manager.get('test');
    assertEqual(value, 'value', 'should retrieve stored value');
  });
  
  // Test: Complex object serialization
  test('should serialize and deserialize complex objects', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    var obj = {
      name: 'Test User',
      age: 25,
      tags: ['tag1', 'tag2'],
      nested: { key: 'value' }
    };
    
    manager.set('user', obj);
    var retrieved = manager.get('user');
    
    assertDeepEqual(retrieved, obj, 'should retrieve identical object');
  });
  
  // Test: Default values
  test('should return default value for non-existent keys', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    var value = manager.get('nonexistent', 'default');
    assertEqual(value, 'default', 'should return default value');
    
    var nullValue = manager.get('nonexistent');
    assertEqual(nullValue, null, 'should return null when no default');
  });
  
  // Test: Remove
  test('should remove values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    manager.set('test', 'value');
    assert(manager.has('test'), 'key should exist');
    
    manager.remove('test');
    assert(!manager.has('test'), 'key should not exist after removal');
  });
  
  // Test: Clear
  test('should clear all prefixed values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    manager.set('key1', 'value1');
    manager.set('key2', 'value2');
    manager.set('key3', 'value3');
    
    // Add a non-prefixed key
    mockStorage.setItem('other_key', 'other_value');
    
    manager.clear();
    
    assert(!manager.has('key1'), 'key1 should be cleared');
    assert(!manager.has('key2'), 'key2 should be cleared');
    assert(!manager.has('key3'), 'key3 should be cleared');
    assert(mockStorage.getItem('other_key') === 'other_value', 'non-prefixed key should remain');
  });
  
  // Test: Keys
  test('should list all keys', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    manager.set('key1', 'value1');
    manager.set('key2', 'value2');
    
    var keys = manager.keys();
    assertEqual(keys.length, 2, 'should have 2 keys');
    assert(keys.indexOf('key1') !== -1, 'should include key1');
    assert(keys.indexOf('key2') !== -1, 'should include key2');
  });
  
  // Test: Has
  test('should check key existence', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    assert(!manager.has('test'), 'key should not exist initially');
    
    manager.set('test', 'value');
    assert(manager.has('test'), 'key should exist after set');
  });
  
  // Test: Quota exceeded handling
  test('should handle quota exceeded errors', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    // Add some cache entries
    manager.set('cache_item1', 'data1');
    manager.set('cache_item2', 'data2');
    manager.set('important', 'keep this');
    
    // Override setItem to throw quota error once
    var originalSetItem = mockStorage.setItem;
    var throwCount = 0;
    mockStorage.setItem = function(key, value) {
      if (throwCount === 0 && key === 'bluekai_newkey') {
        throwCount++;
        var error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      originalSetItem.call(mockStorage, key, value);
    };
    
    var result = manager.set('newkey', 'newvalue');
    assert(result === true, 'should succeed after clearing cache');
    assert(manager.get('important') === 'keep this', 'important data should remain');
  });
  
  // Test: Array values
  test('should handle array values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    var arr = [1, 2, 3, 'four', { five: 5 }];
    manager.set('array', arr);
    
    var retrieved = manager.get('array');
    assertDeepEqual(retrieved, arr, 'should retrieve identical array');
  });
  
  // Test: Boolean values
  test('should handle boolean values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    manager.set('bool_true', true);
    manager.set('bool_false', false);
    
    assertEqual(manager.get('bool_true'), true, 'should retrieve true');
    assertEqual(manager.get('bool_false'), false, 'should retrieve false');
  });
  
  // Test: Number values
  test('should handle number values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    manager.set('int', 42);
    manager.set('float', 3.14);
    manager.set('zero', 0);
    
    assertEqual(manager.get('int'), 42, 'should retrieve integer');
    assertEqual(manager.get('float'), 3.14, 'should retrieve float');
    assertEqual(manager.get('zero'), 0, 'should retrieve zero');
  });
  
  // Test: Null values
  test('should handle null values', function() {
    var mockStorage = createMockStorage();
    var manager = new StorageManager();
    manager.storage = mockStorage;
    
    manager.set('null_value', null);
    assertEqual(manager.get('null_value'), null, 'should retrieve null');
  });
  
  // Run all tests
  console.log('Running StorageManager tests...\n');
  
  tests.forEach(function(testCase) {
    try {
      testCase.fn();
      passed++;
      console.log('✓ ' + testCase.name);
    } catch (error) {
      failed++;
      console.log('✗ ' + testCase.name);
      console.log('  Error: ' + error.message);
    }
  });
  
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  
  return { passed: passed, failed: failed, total: tests.length };
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
  window.runStorageTests = runTests;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = runTests;
}

// Auto-run in Node.js
if (typeof require !== 'undefined' && require.main === module) {
  var results = runTests();
  process.exit(results.failed > 0 ? 1 : 0);
}
