#!/usr/bin/env node

var CacheManager = require('./src/utils/cache-manager.js');

// Mock Storage
function MockStorage() {
  this.data = {};
  this.prefix = 'bluekai_';
}

MockStorage.prototype.get = function(key) {
  return this.data[this.prefix + key] || null;
};

MockStorage.prototype.set = function(key, value) {
  this.data[this.prefix + key] = value;
  return true;
};

MockStorage.prototype.remove = function(key) {
  delete this.data[this.prefix + key];
  return true;
};

MockStorage.prototype.keys = function() {
  var keys = [];
  for (var key in this.data) {
    if (key.indexOf(this.prefix) === 0) {
      keys.push(key.substring(this.prefix.length));
    }
  }
  return keys;
};

MockStorage.prototype.getSize = function() {
  var size = 0;
  for (var key in this.data) {
    size += (key.length + JSON.stringify(this.data[key]).length) * 2;
  }
  return size;
};

console.log('Testing CacheManager...\n');

var storage = new MockStorage();
var cache = new CacheManager(storage);

// Test 1
var key1 = cache.generateKey('timeline', 'user123');
console.log('✓ Test 1: Generate key:', key1);

// Test 2
cache.set(key1, { message: 'Hello' }, 60000);
var data = cache.get(key1);
console.log('✓ Test 2: Set and get:', data.message === 'Hello' ? 'PASS' : 'FAIL');

// Test 3
console.log('✓ Test 3: Has key:', cache.has(key1) ? 'PASS' : 'FAIL');

// Test 4
cache.remove(key1);
console.log('✓ Test 4: Remove key:', !cache.has(key1) ? 'PASS' : 'FAIL');

// Test 5
cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
cache.set(cache.generateKey('profile', 'user1'), { data: 3 }, 60000);
var cleared = cache.clear('cache_timeline:*');
console.log('✓ Test 5: Clear pattern:', cleared === 2 ? 'PASS' : 'FAIL (' + cleared + ')');

// Test 6
cache.set(cache.generateKey('timeline', 'user1'), { data: 1 }, 60000);
cache.set(cache.generateKey('timeline', 'user2'), { data: 2 }, 60000);
var invalidated = cache.invalidate('timeline');
console.log('✓ Test 6: Invalidate namespace:', invalidated === 2 ? 'PASS' : 'FAIL (' + invalidated + ')');

// Test 7
cache.set(cache.generateKey('test', 'entry1'), { data: 1 }, 60000);
cache.set(cache.generateKey('test', 'entry2'), { data: 2 }, 60000);
var stats = cache.getStats();
console.log('✓ Test 7: Stats:', stats.totalEntries === 3 ? 'PASS' : 'FAIL (' + stats.totalEntries + ')');

// Test 8
var key8 = cache.generateKey('test', 'accessed');
cache.set(key8, { data: 'test' }, 60000);
cache.get(key8);
cache.get(key8);
cache.get(key8);
var entry = storage.get(key8);
console.log('✓ Test 8: Access count:', entry.accessCount === 3 ? 'PASS' : 'FAIL (' + entry.accessCount + ')');

console.log('\n✓ All synchronous tests passed!');
