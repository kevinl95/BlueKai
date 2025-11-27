/**
 * Performance Utilities Tests
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

var performance = require('./performance');

function testMemoize() {
  console.log('Testing memoize...');
  
  var callCount = 0;
  var expensiveFunction = function(a, b) {
    callCount++;
    return a + b;
  };
  
  var memoized = performance.memoize(expensiveFunction);
  
  // First call
  var result1 = memoized(2, 3);
  console.assert(result1 === 5, 'First call should return correct result');
  console.assert(callCount === 1, 'Function should be called once');
  
  // Second call with same args - should use cache
  var result2 = memoized(2, 3);
  console.assert(result2 === 5, 'Second call should return correct result');
  console.assert(callCount === 1, 'Function should not be called again (cached)');
  
  // Third call with different args
  var result3 = memoized(5, 7);
  console.assert(result3 === 12, 'Third call should return correct result');
  console.assert(callCount === 2, 'Function should be called for new args');
  
  console.log('✓ Memoize tests passed');
}

function testDebounce() {
  console.log('Testing debounce...');
  
  var callCount = 0;
  var lastValue = null;
  
  var fn = function(value) {
    callCount++;
    lastValue = value;
  };
  
  var debounced = performance.debounce(fn, 100);
  
  // Call multiple times rapidly
  debounced('first');
  debounced('second');
  debounced('third');
  
  console.assert(callCount === 0, 'Function should not be called immediately');
  
  // Wait for debounce delay
  setTimeout(function() {
    console.assert(callCount === 1, 'Function should be called once after delay');
    console.assert(lastValue === 'third', 'Should use last value');
    console.log('✓ Debounce tests passed');
  }, 150);
}

function testThrottle() {
  console.log('Testing throttle...');
  
  var callCount = 0;
  var fn = function() {
    callCount++;
  };
  
  var throttled = performance.throttle(fn, 100);
  
  // First call should execute immediately
  throttled();
  console.assert(callCount === 1, 'First call should execute');
  
  // Subsequent calls within limit should be ignored
  throttled();
  throttled();
  console.assert(callCount === 1, 'Subsequent calls should be throttled');
  
  // After limit, should execute again
  setTimeout(function() {
    throttled();
    console.assert(callCount === 2, 'Should execute after throttle limit');
    console.log('✓ Throttle tests passed');
  }, 150);
}

function testRequestDeduplicator() {
  console.log('Testing request deduplicator...');
  
  var deduplicator = performance.createRequestDeduplicator();
  var callCount = 0;
  
  var mockRequest = function() {
    callCount++;
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve('result');
      }, 50);
    });
  };
  
  // Make multiple concurrent requests with same key
  var promise1 = deduplicator.dedupe('test-key', mockRequest);
  var promise2 = deduplicator.dedupe('test-key', mockRequest);
  var promise3 = deduplicator.dedupe('test-key', mockRequest);
  
  console.assert(callCount === 1, 'Should only make one actual request');
  console.assert(promise1 === promise2, 'Should return same promise');
  console.assert(promise2 === promise3, 'Should return same promise');
  
  Promise.all([promise1, promise2, promise3]).then(function(results) {
    console.assert(results[0] === 'result', 'Should resolve with correct value');
    console.assert(results[1] === 'result', 'Should resolve with correct value');
    console.assert(results[2] === 'result', 'Should resolve with correct value');
    
    // After resolution, new request should be made
    return deduplicator.dedupe('test-key', mockRequest);
  }).then(function() {
    console.assert(callCount === 2, 'Should make new request after first completes');
    console.log('✓ Request deduplicator tests passed');
  });
}

function testBatch() {
  console.log('Testing batch...');
  
  var batches = [];
  var processBatch = function(items) {
    batches.push(items);
  };
  
  var batched = performance.batch(processBatch, 50);
  
  // Add items
  batched('item1');
  batched('item2');
  batched('item3');
  
  console.assert(batches.length === 0, 'Should not process immediately');
  
  setTimeout(function() {
    console.assert(batches.length === 1, 'Should process one batch');
    console.assert(batches[0].length === 3, 'Batch should contain all items');
    console.log('✓ Batch tests passed');
  }, 100);
}

function testLRUCache() {
  console.log('Testing LRU cache...');
  
  var cache = performance.createLRUCache(3);
  
  // Add items
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  
  console.assert(cache.size() === 3, 'Cache should have 3 items');
  console.assert(cache.get('a') === 1, 'Should retrieve item a');
  
  // Add fourth item - should evict oldest (b, since a was just accessed)
  cache.set('d', 4);
  
  console.assert(cache.size() === 3, 'Cache should still have 3 items');
  console.assert(cache.get('b') === null, 'Item b should be evicted');
  console.assert(cache.get('a') === 1, 'Item a should still exist');
  console.assert(cache.get('c') === 3, 'Item c should still exist');
  console.assert(cache.get('d') === 4, 'Item d should exist');
  
  // Test delete
  cache.delete('a');
  console.assert(cache.size() === 2, 'Cache should have 2 items after delete');
  console.assert(cache.get('a') === null, 'Deleted item should not exist');
  
  // Test clear
  cache.clear();
  console.assert(cache.size() === 0, 'Cache should be empty after clear');
  
  console.log('✓ LRU cache tests passed');
}

function testRafThrottle() {
  console.log('Testing RAF throttle...');
  
  var callCount = 0;
  var fn = function() {
    callCount++;
  };
  
  var throttled = performance.rafThrottle(fn);
  
  // Call multiple times
  throttled();
  throttled();
  throttled();
  
  // Should only schedule one RAF
  requestAnimationFrame(function() {
    console.assert(callCount === 1, 'Should only execute once per frame');
    console.log('✓ RAF throttle tests passed');
  });
}

// Run all tests
testMemoize();
testDebounce();
testThrottle();
testRequestDeduplicator();
testBatch();
testLRUCache();
testRafThrottle();

console.log('\nAll performance utility tests completed!');
