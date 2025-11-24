#!/usr/bin/env node

/**
 * Simple test runner for CacheManager
 */

// Load dependencies
var StorageManager = require('./src/utils/storage.js');
var CacheManager = require('./src/utils/cache-manager.js');

// Mock StorageManager for testing
function MockStorage() {
  this.data = {};
  this.prefix = 'bluekai_';
}

MockStorage.prototype.get = function(key) {
  var prefixedKey = this.prefix + key;
  var value = this.data[prefixedKey];
  return value !== undefined ? value : null;
};

MockStorage.prototype.set = function(key, value) {
  var prefixedKey = this.prefix + key;
  this.data[prefixedKey] = value;
  return true;
};

MockStorage.prototype.remove = function(key) {
  var prefixedKey = this.prefix + key;
  delete this.data[prefixedKey];
  return true;
};

MockStorage.prototype.keys = function() {
  var keys = [];
  var prefixLength = this.prefix.length;
  
  for (var key in this.data) {
    if (this.data.hasOwnProperty(key) && key.indexOf(this.prefix) === 0) {
      keys.push(key.substring(prefixLength));
    }
  }
  
  return keys;
};

MockStorage.prototype.getSize = function() {
  var size = 0;
  for (var key in this.data) {
    if (this.data.hasOwnProperty(key)) {
      var value = this.data[key];
      size += (key.length + JSON.stringify(value).length) * 2;
    }
  }
  return size;
};

MockStorage.prototype.clear = function() {
  this.data = {};
  return true;
};

console.log('Running CacheManager Tests...\n');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('✓ ' + name);
    passed++;
  } catch (error) {
    console.error('✗ ' + name + ': ' + error.message);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Cache key generation
test('Generate cache key from string identifier', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  var key = cache.generateKey('timeline', 'user123');
  assert(key === 'cache_timeline:user123', 'Expected cache_timeline:user123, got ' + key);
});

// Test 2: Set and get cache entry
test('Set and get cache entry', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  var key = cache.generateKey('test', 'data1');
  var data = { message: 'Hello, World!' };
  
  var setResult = cache.set(key, data, 60000);
  var getData = cache.get(key);
  
  assert(setResult === true, 'Set should return true');
  assert(getData && getData.message === 'Hello, World!', 'Get should return correct data');
});

// Test 3: Cache has() method
test('Cache has() method', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  var key = cache.generateKey('test', 'exists');
  
  cache.set(key, { data: 'test' }, 60000);
  
  assert(cache.has(key) === true, 'has() should return true for existing entry');
  assert(cache.has(cache.generateKey('test', 'notexists')) === false, 'has() should return false for non-existing entry');
});

// Test 4: Remove cache entry
test('Remove cache entry', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  var key = cache.generateKey('test', 'remove');
  
  cache.set(key, { data: 'test' }, 60000);
  assert(cache.has(key) === true, 'Entry should exist before removal');
  
  cache.remove(key);
  assert(cache.has(key) === false, 'Entry should not exist after removal');
});

// Test 5: Clear cache with pattern
test('Clear cache with pattern', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  
  cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
  cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
  cache.set(cache.generateKey('profile', 'user1'), { data: 3 }, 60000);
  
  var cleared = cache.clear('cache_timeline:*');
  
  assert(cleared === 2, 'Should clear 2 timeline entries');
  assert(!cache.has(cache.generateKey('timeline', 'user1')), 'Timeline entry should be removed');
  assert(cache.has(cache.generateKey('profile', 'user1')), 'Profile entry should remain');
});

// Test 6: Invalidate by namespace
test('Invalidate by namespace', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  
  cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
  cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
  cache.set(cache.generateKey('profile', 'user1'), { data: 3 }, 60000);
  
  var invalidated = cache.invalidate('timeline');
  
  assert(invalidated === 2, 'Should invalidate 2 timeline entries');
  assert(!cache.has(cache.generateKey('timeline', 'user1')), 'Timeline should be removed');
  assert(cache.has(cache.generateKey('profile', 'user1')), 'Profile should remain');
});

// Test 7: Cache statistics
test('Cache statistics', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  
  cache.set(cache.generateKey('test', 'entry1'), { data: 1 }, 60000);
  cache.set(cache.generateKey('test', 'entry2'), { data: 2 }, 60000);
  
  var stats = cache.getStats();
  
  assert(stats && stats.totalEntries === 2, 'Should show 2 total entries');
  assert(stats && stats.validEntries === 2, 'Should show 2 valid entries');
});

// Test 8: Access count tracking
test('Access count tracking', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  var key = cache.generateKey('test', 'accessed');
  
  cache.set(key, { data: 'test' }, 60000);
  cache.get(key);
  cache.get(key);
  cache.get(key);
  
  var entry = storage.get(key);
  assert(entry && entry.accessCount === 3, 'Access count should be 3');
});

// Test 9: Default TTL
test('Default TTL', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage, { defaultTTL: 100 });
  var key = cache.generateKey('test', 'defaultttl');
  
  cache.set(key, { data: 'test' });
  
  var entry = storage.get(key);
  var now = Date.now();
  var expectedExpiry = now + 100;
  
  assert(entry && Math.abs(entry.expiresAt - expectedExpiry) < 50, 'Default TTL should be applied');
});

// Test 10: Cache entry metadata
test('Cache entry metadata', function() {
  var storage = new MockStorage();
  var cache = new CacheManager(storage);
  var key = cache.generateKey('test', 'metadata');
  
  var beforeSet = Date.now();
  cache.set(key, { data: 'test' }, 60000);
  var afterSet = Date.now();
  
  var entry = storage.get(key);
  
  assert(entry && entry.createdAt >= beforeSet && entry.createdAt <= afterSet, 'Should have createdAt timestamp');
  assert(entry && entry.accessedAt >= beforeSet && entry.accessedAt <= afterSet, 'Should have accessedAt timestamp');
  assert(entry && entry.accessCount === 0, 'Should have initial accessCount of 0');
});

// Async tests
setTimeout(function() {
  // Test 11: Cache entry expiration
  var storage11 = new MockStorage();
  var cache11 = new CacheManager(storage11);
  var key11 = cache11.generateKey('test', 'expiring');
  
  cache11.set(key11, { value: 42 }, 50);
  
  setTimeout(function() {
    test('Cache entry expiration', function() {
      var getData = cache11.get(key11);
      assert(getData === null, 'Expired entry should return null');
    });
    
    // Test 12: Prune expired entries
    var storage12 = new MockStorage();
    var cache12 = new CacheManager(storage12);
    
    cache12.set(cache12.generateKey('test', 'valid'), { data: 1 }, 60000);
    cache12.set(cache12.generateKey('test', 'expired1'), { data: 2 }, 50);
    cache12.set(cache12.generateKey('test', 'expired2'), { data: 3 }, 50);
    
    setTimeout(function() {
      test('Prune expired entries', function() {
        var pruned = cache12.prune();
        assert(pruned === 2, 'Should prune 2 expired entries, got ' + pruned);
        assert(cache12.has(cache12.generateKey('test', 'valid')), 'Valid entry should remain');
        assert(!cache12.has(cache12.generateKey('test', 'expired1')), 'Expired entry should be removed');
      });
      
      // Print summary after all tests
      console.log('\n' + '='.repeat(50));
      console.log('Test Summary:');
      console.log('Passed: ' + passed);
      console.log('Failed: ' + failed);
      console.log('Total: ' + (passed + failed));
      console.log('='.repeat(50));
      
      if (failed === 0) {
        console.log('\n✓ All tests passed!');
        process.exit(0);
      } else {
        console.log('\n✗ Some tests failed.');
        process.exit(1);
      }
    }, 100);
  }, 100);
}, 50);
