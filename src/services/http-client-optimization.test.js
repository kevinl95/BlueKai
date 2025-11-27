/**
 * HTTP Client Data Usage Optimization Tests
 * Tests for request deduplication and conditional requests
 * Requirements: 2.4
 */

var HttpClient = require('./http-client');

/**
 * Mock HTTP implementation for testing
 */
var mockHttp = {
  requestCount: 0,
  responses: {},
  
  request: function(config) {
    this.requestCount++;
    var url = config.url || '';
    var response = this.responses[url];
    
    if (response) {
      if (response.error) {
        return Promise.reject(response.error);
      }
      return Promise.resolve(response);
    }
    
    return Promise.resolve({
      status: 200,
      data: { test: 'data' },
      headers: {}
    });
  },
  
  reset: function() {
    this.requestCount = 0;
    this.responses = {};
  }
};

/**
 * Test suite for HTTP client optimizations
 */
function runHttpClientOptimizationTests() {
  var results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function assert(condition, message) {
    if (condition) {
      results.passed++;
      results.tests.push({ name: message, passed: true });
    } else {
      results.failed++;
      results.tests.push({ name: message, passed: false });
      console.error('FAILED:', message);
    }
  }
  
  console.log('Running HTTP Client Optimization Tests...');
  
  // Test: Request deduplication for concurrent GET requests
  console.log('\nTest: Request deduplication');
  mockHttp.reset();
  
  var client = new HttpClient({
    baseURL: 'https://api.test.com',
    enableDeduplication: true
  });
  
  // Mock the http module
  var originalHttp = require('../utils/http');
  require.cache[require.resolve('../utils/http')].exports = mockHttp;
  
  var url = '/test-endpoint';
  
  // Make three concurrent requests to the same endpoint
  var promise1 = client.get(url);
  var promise2 = client.get(url);
  var promise3 = client.get(url);
  
  Promise.all([promise1, promise2, promise3])
    .then(function() {
      assert(
        mockHttp.requestCount === 1,
        'Should only make one HTTP request for concurrent identical requests'
      );
      
      // Restore original http module
      require.cache[require.resolve('../utils/http')].exports = originalHttp;
    })
    .catch(function(error) {
      console.error('Test failed:', error);
      assert(false, 'Request deduplication test failed');
      require.cache[require.resolve('../utils/http')].exports = originalHttp;
    });
  
  // Test: Request deduplication does not apply to POST requests
  console.log('\nTest: POST requests not deduplicated');
  mockHttp.reset();
  
  var client2 = new HttpClient({
    baseURL: 'https://api.test.com',
    enableDeduplication: true
  });
  
  require.cache[require.resolve('../utils/http')].exports = mockHttp;
  
  var postUrl = '/post-endpoint';
  
  // Make two concurrent POST requests
  var postPromise1 = client2.post(postUrl, { data: 'test1' });
  var postPromise2 = client2.post(postUrl, { data: 'test2' });
  
  Promise.all([postPromise1, postPromise2])
    .then(function() {
      assert(
        mockHttp.requestCount === 2,
        'Should make separate requests for POST requests'
      );
      
      require.cache[require.resolve('../utils/http')].exports = originalHttp;
    })
    .catch(function(error) {
      console.error('Test failed:', error);
      assert(false, 'POST deduplication test failed');
      require.cache[require.resolve('../utils/http')].exports = originalHttp;
    });
  
  // Test: ETag cache stores and retrieves ETags
  console.log('\nTest: ETag caching');
  
  var client3 = new HttpClient({
    baseURL: 'https://api.test.com',
    enableETagCache: true
  });
  
  var testUrl = 'https://api.test.com/test';
  var testETag = '"abc123"';
  
  // Store an ETag
  client3.storeETag(testUrl, {
    headers: { 'etag': testETag }
  });
  
  assert(
    client3.etagCache[testUrl] === testETag,
    'Should store ETag in cache'
  );
  
  // Test: ETag headers added to requests
  var config = { url: testUrl, method: 'GET', headers: {} };
  var modifiedConfig = client3.addETagHeaders(config);
  
  assert(
    modifiedConfig.headers['If-None-Match'] === testETag,
    'Should add If-None-Match header with cached ETag'
  );
  
  // Test: ETag not added to POST requests
  var postConfig = { url: testUrl, method: 'POST', headers: {} };
  var postModifiedConfig = client3.addETagHeaders(postConfig);
  
  assert(
    !postModifiedConfig.headers['If-None-Match'],
    'Should not add ETag header to POST requests'
  );
  
  // Test: Request key generation
  console.log('\nTest: Request key generation');
  
  var client4 = new HttpClient();
  
  var key1 = client4.getRequestKey({ method: 'GET', url: '/test' });
  var key2 = client4.getRequestKey({ method: 'GET', url: '/test' });
  var key3 = client4.getRequestKey({ method: 'GET', url: '/test', params: { id: 1 } });
  var key4 = client4.getRequestKey({ method: 'POST', url: '/test' });
  
  assert(
    key1 === key2,
    'Should generate same key for identical requests'
  );
  
  assert(
    key1 !== key3,
    'Should generate different key for requests with different params'
  );
  
  assert(
    key1 !== key4,
    'Should generate different key for requests with different methods'
  );
  
  // Print results
  console.log('\n=== HTTP Client Optimization Test Results ===');
  console.log('Passed:', results.passed);
  console.log('Failed:', results.failed);
  console.log('Total:', results.passed + results.failed);
  
  results.tests.forEach(function(test) {
    console.log(test.passed ? '✓' : '✗', test.name);
  });
  
  return results;
}

// Export test runner
module.exports = {
  runHttpClientOptimizationTests: runHttpClientOptimizationTests
};

// Run tests if executed directly
if (typeof window !== 'undefined') {
  window.runHttpClientOptimizationTests = runHttpClientOptimizationTests;
}
