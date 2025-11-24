/**
 * Tests for CacheManager
 * Compatible with Gecko 48 (ES5)
 */

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

// Load CacheManager
var CacheManager;
if (typeof require !== 'undefined') {
  CacheManager = require('./cache-manager.js');
}

/**
 * Test Suite for CacheManager
 */
function runCacheManagerTests() {
  var results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function assert(condition, testName, message) {
    if (condition) {
      results.passed++;
      results.tests.push({ name: testName, status: 'PASS' });
      console.log('✓ ' + testName);
    } else {
      results.failed++;
      results.tests.push({ name: testName, status: 'FAIL', message: message });
      console.error('✗ ' + testName + ': ' + message);
    }
  }
  
  console.log('Running CacheManager Tests...\n');
  
  // Test 1: Cache key generation
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key1 = cache.generateKey('timeline', 'user123');
    var key2 = cache.generateKey('profile', { did: 'did:plc:123' });
    
    assert(
      key1 === 'cache_timeline:user123',
      'Generate cache key from string identifier',
      'Expected cache_timeline:user123, got ' + key1
    );
    
    assert(
      key2.indexOf('cache_profile:') === 0,
      'Generate cache key from object identifier',
      'Expected key to start with cache_profile:, got ' + key2
    );
  })();
  
  // Test 2: Set and get cache entry
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key = cache.generateKey('test', 'data1');
    var data = { message: 'Hello, World!' };
    
    var setResult = cache.set(key, data, 60000); // 1 minute TTL
    var getData = cache.get(key);
    
    assert(
      setResult === true,
      'Set cache entry returns true',
      'Expected true, got ' + setResult
    );
    
    assert(
      getData && getData.message === 'Hello, World!',
      'Get cache entry returns correct data',
      'Expected data with message, got ' + JSON.stringify(getData)
    );
  })();
  
  // Test 3: Cache entry expiration
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key = cache.generateKey('test', 'expiring');
    var data = { value: 42 };
    
    // Set with very short TTL
    cache.set(key, data, 1); // 1ms TTL
    
    // Wait for expiration
    setTimeout(function() {
      var getData = cache.get(key);
      
      assert(
        getData === null,
        'Expired cache entry returns null',
        'Expected null, got ' + JSON.stringify(getData)
      );
    }, 10);
  })();
  
  // Test 4: Cache has() method
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key = cache.generateKey('test', 'exists');
    cache.set(key, { data: 'test' }, 60000);
    
    var exists = cache.has(key);
    var notExists = cache.has(cache.generateKey('test', 'notexists'));
    
    assert(
      exists === true,
      'has() returns true for existing entry',
      'Expected true, got ' + exists
    );
    
    assert(
      notExists === false,
      'has() returns false for non-existing entry',
      'Expected false, got ' + notExists
    );
  })();
  
  // Test 5: Remove cache entry
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key = cache.generateKey('test', 'remove');
    cache.set(key, { data: 'test' }, 60000);
    
    var beforeRemove = cache.has(key);
    cache.remove(key);
    var afterRemove = cache.has(key);
    
    assert(
      beforeRemove === true && afterRemove === false,
      'Remove deletes cache entry',
      'Expected entry to exist before and not after removal'
    );
  })();
  
  // Test 6: Clear cache with pattern
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    // Add multiple entries
    cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
    cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
    cache.set(cache.generateKey('profile', 'user1'), { data: 3 }, 60000);
    
    var cleared = cache.clear('cache_timeline:*');
    
    var timeline1Exists = cache.has(cache.generateKey('timeline', 'user1'));
    var timeline2Exists = cache.has(cache.generateKey('timeline', 'user2'));
    var profileExists = cache.has(cache.generateKey('profile', 'user1'));
    
    assert(
      cleared === 2,
      'Clear with pattern removes matching entries',
      'Expected 2 cleared, got ' + cleared
    );
    
    assert(
      !timeline1Exists && !timeline2Exists && profileExists,
      'Clear preserves non-matching entries',
      'Timeline entries should be removed, profile should remain'
    );
  })();
  
  // Test 7: Invalidate by namespace
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
    cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
    cache.set(cache.generateKey('profile', 'user1'), { data: 3 }, 60000);
    
    var invalidated = cache.invalidate('timeline');
    
    var timelineExists = cache.has(cache.generateKey('timeline', 'user1'));
    var profileExists = cache.has(cache.generateKey('profile', 'user1'));
    
    assert(
      invalidated === 2,
      'Invalidate removes all entries in namespace',
      'Expected 2 invalidated, got ' + invalidated
    );
    
    assert(
      !timelineExists && profileExists,
      'Invalidate preserves other namespaces',
      'Timeline should be removed, profile should remain'
    );
  })();
  
  // Test 8: Prune expired entries
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    // Add entries with different TTLs
    cache.set(cache.generateKey('test', 'valid'), { data: 1 }, 60000); // Valid
    cache.set(cache.generateKey('test', 'expired1'), { data: 2 }, 1); // Expired
    cache.set(cache.generateKey('test', 'expired2'), { data: 3 }, 1); // Expired
    
    // Wait for expiration
    setTimeout(function() {
      var pruned = cache.prune();
      
      var validExists = cache.has(cache.generateKey('test', 'valid'));
      var expired1Exists = cache.has(cache.generateKey('test', 'expired1'));
      
      assert(
        pruned === 2,
        'Prune removes expired entries',
        'Expected 2 pruned, got ' + pruned
      );
      
      assert(
        validExists && !expired1Exists,
        'Prune preserves valid entries',
        'Valid entry should remain, expired should be removed'
      );
    }, 10);
  })();
  
  // Test 9: Cache statistics
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    cache.set(cache.generateKey('test', 'entry1'), { data: 1 }, 60000);
    cache.set(cache.generateKey('test', 'entry2'), { data: 2 }, 60000);
    cache.set(cache.generateKey('test', 'expired'), { data: 3 }, 1);
    
    setTimeout(function() {
      var stats = cache.getStats();
      
      assert(
        stats && stats.totalEntries === 3,
        'Stats show total entries',
        'Expected 3 total entries, got ' + (stats ? stats.totalEntries : 'null')
      );
      
      assert(
        stats && stats.validEntries === 2,
        'Stats show valid entries',
        'Expected 2 valid entries, got ' + (stats ? stats.validEntries : 'null')
      );
      
      assert(
        stats && stats.expiredEntries === 1,
        'Stats show expired entries',
        'Expected 1 expired entry, got ' + (stats ? stats.expiredEntries : 'null')
      );
    }, 10);
  })();
  
  // Test 10: Access count tracking
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key = cache.generateKey('test', 'accessed');
    cache.set(key, { data: 'test' }, 60000);
    
    // Access multiple times
    cache.get(key);
    cache.get(key);
    cache.get(key);
    
    var entry = storage.get(key);
    
    assert(
      entry && entry.accessCount === 3,
      'Access count is tracked',
      'Expected accessCount 3, got ' + (entry ? entry.accessCount : 'null')
    );
  })();
  
  // Test 11: LRU eviction
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage, {
      maxStorageSize: 1000, // Very small limit
      pruneThreshold: 0.5
    });
    
    // Add entries
    for (var i = 0; i < 10; i++) {
      var key = cache.generateKey('test', 'entry' + i);
      cache.set(key, { data: 'Large data string to fill storage quickly: ' + new Array(50).join('x') }, 60000);
    }
    
    // Access some entries to make them more recently used
    cache.get(cache.generateKey('test', 'entry8'));
    cache.get(cache.generateKey('test', 'entry9'));
    
    // Force eviction by adding more data
    cache.set(cache.generateKey('test', 'trigger'), { data: 'trigger eviction' }, 60000);
    
    // Check that recently accessed entries are more likely to remain
    var entry8Exists = cache.has(cache.generateKey('test', 'entry8'));
    var entry9Exists = cache.has(cache.generateKey('test', 'entry9'));
    
    assert(
      entry8Exists || entry9Exists,
      'LRU eviction preserves recently accessed entries',
      'At least one recently accessed entry should remain'
    );
  })();
  
  // Test 12: Pattern to regex conversion
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
    cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
    cache.set(cache.generateKey('profile', 'user1'), { data: 3 }, 60000);
    cache.set(cache.generateKey('notifications', 'user1'), { data: 4 }, 60000);
    
    var cleared = cache.clear('cache_*line:*');
    
    var timelineExists = cache.has(cache.generateKey('timeline', 'user1'));
    var profileExists = cache.has(cache.generateKey('profile', 'user1'));
    
    assert(
      cleared === 2,
      'Wildcard pattern matches correctly',
      'Expected 2 cleared (timeline entries), got ' + cleared
    );
    
    assert(
      !timelineExists && profileExists,
      'Wildcard pattern preserves non-matching entries',
      'Timeline should be removed, profile should remain'
    );
  })();
  
  // Test 13: Default TTL
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage, {
      defaultTTL: 100 // 100ms default
    });
    
    var key = cache.generateKey('test', 'defaultttl');
    cache.set(key, { data: 'test' }); // No TTL specified
    
    var entry = storage.get(key);
    var now = Date.now();
    var expectedExpiry = now + 100;
    
    assert(
      entry && Math.abs(entry.expiresAt - expectedExpiry) < 50,
      'Default TTL is applied when not specified',
      'Expected expiry around ' + expectedExpiry + ', got ' + (entry ? entry.expiresAt : 'null')
    );
  })();
  
  // Test 14: Cache entry metadata
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    var key = cache.generateKey('test', 'metadata');
    var beforeSet = Date.now();
    cache.set(key, { data: 'test' }, 60000);
    var afterSet = Date.now();
    
    var entry = storage.get(key);
    
    assert(
      entry && entry.createdAt >= beforeSet && entry.createdAt <= afterSet,
      'Cache entry has createdAt timestamp',
      'Expected timestamp between ' + beforeSet + ' and ' + afterSet
    );
    
    assert(
      entry && entry.accessedAt >= beforeSet && entry.accessedAt <= afterSet,
      'Cache entry has accessedAt timestamp',
      'Expected timestamp between ' + beforeSet + ' and ' + afterSet
    );
    
    assert(
      entry && entry.accessCount === 0,
      'Cache entry has initial accessCount of 0',
      'Expected accessCount 0, got ' + (entry ? entry.accessCount : 'null')
    );
  })();
  
  // Test 15: Clear all cache entries
  (function() {
    var storage = new MockStorage();
    var cache = new CacheManager(storage);
    
    cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
    cache.set(cache.generateKey('profile', 'user1'), { data: 2 }, 60000);
    cache.set(cache.generateKey('notifications', 'user1'), { data: 3 }, 60000);
    
    var cleared = cache.clear(); // No pattern = clear all
    
    var stats = cache.getStats();
    
    assert(
      cleared === 3,
      'Clear without pattern removes all entries',
      'Expected 3 cleared, got ' + cleared
    );
    
    assert(
      stats && stats.totalEntries === 0,
      'All cache entries are removed',
      'Expected 0 entries, got ' + (stats ? stats.totalEntries : 'null')
    );
  })();
  
  // Wait for async tests to complete
  setTimeout(function() {
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary:');
    console.log('Passed: ' + results.passed);
    console.log('Failed: ' + results.failed);
    console.log('Total: ' + (results.passed + results.failed));
    console.log('='.repeat(50));
    
    if (results.failed === 0) {
      console.log('\n✓ All tests passed!');
    } else {
      console.log('\n✗ Some tests failed.');
    }
  }, 200);
  
  return results;
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runCacheManagerTests: runCacheManagerTests, MockStorage: MockStorage };
  
  // Auto-run if executed directly
  if (require.main === module) {
    runCacheManagerTests();
  }
}
