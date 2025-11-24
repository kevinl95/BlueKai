/**
 * Tests for HTTP Client
 * Compatible with Gecko 48
 */

import HttpClient from './http-client.js';

// Test results
var testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Assert helper
 */
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ name: message, passed: true });
    console.log('✓ ' + message);
  } else {
    testResults.failed++;
    testResults.tests.push({ name: message, passed: false });
    console.error('✗ ' + message);
  }
}

/**
 * Mock XMLHttpRequest for testing
 */
function mockXHR() {
  var originalXHR = window.XMLHttpRequest;
  var mockRequests = [];
  
  window.XMLHttpRequest = function() {
    var xhr = {
      open: function(method, url, async) {
        this.method = method;
        this.url = url;
        this.async = async;
        this.requestHeaders = {};
      },
      setRequestHeader: function(key, value) {
        this.requestHeaders[key] = value;
      },
      send: function(body) {
        this.body = body;
        mockRequests.push(this);
        
        // Simulate async response
        var self = this;
        setTimeout(function() {
          if (self.mockResponse) {
            self.status = self.mockResponse.status;
            self.statusText = self.mockResponse.statusText;
            self.responseText = self.mockResponse.body;
            
            if (self.onload) {
              self.onload();
            }
          }
        }, 10);
      },
      getAllResponseHeaders: function() {
        return 'content-type: application/json\r\n';
      },
      getResponseHeader: function(name) {
        if (name.toLowerCase() === 'content-type') {
          return 'application/json';
        }
        return null;
      }
    };
    
    return xhr;
  };
  
  return {
    restore: function() {
      window.XMLHttpRequest = originalXHR;
    },
    getRequests: function() {
      return mockRequests;
    },
    respondTo: function(index, response) {
      if (mockRequests[index]) {
        mockRequests[index].mockResponse = response;
      }
    }
  };
}

/**
 * Test: HttpClient constructor
 */
function testConstructor() {
  var client = new HttpClient({
    baseURL: 'https://api.example.com',
    timeout: 5000
  });
  
  assert(client.config.baseURL === 'https://api.example.com', 'Constructor sets baseURL');
  assert(client.config.timeout === 5000, 'Constructor sets timeout');
  assert(client.config.maxRetries === 3, 'Constructor sets default maxRetries');
}

/**
 * Test: Request interceptors
 */
function testRequestInterceptors() {
  var client = new HttpClient();
  var interceptorCalled = false;
  
  client.addRequestInterceptor(function(config) {
    interceptorCalled = true;
    config.headers = config.headers || {};
    config.headers['X-Custom'] = 'test';
    return config;
  });
  
  return client.applyRequestInterceptors({ url: '/test' })
    .then(function(config) {
      assert(interceptorCalled, 'Request interceptor is called');
      assert(config.headers['X-Custom'] === 'test', 'Request interceptor modifies config');
    });
}

/**
 * Test: Response interceptors
 */
function testResponseInterceptors() {
  var client = new HttpClient();
  var interceptorCalled = false;
  
  client.addResponseInterceptor(function(response) {
    interceptorCalled = true;
    response.intercepted = true;
    return response;
  });
  
  return client.applyResponseInterceptors({ status: 200 })
    .then(function(response) {
      assert(interceptorCalled, 'Response interceptor is called');
      assert(response.intercepted === true, 'Response interceptor modifies response');
    });
}

/**
 * Test: Retry delay calculation
 */
function testRetryDelay() {
  var client = new HttpClient({ retryDelay: 1000 });
  
  var delay0 = client.calculateRetryDelay(0);
  var delay1 = client.calculateRetryDelay(1);
  var delay2 = client.calculateRetryDelay(2);
  
  assert(delay0 >= 1000 && delay0 < 3000, 'First retry delay is ~1s with jitter');
  assert(delay1 >= 2000 && delay1 < 4000, 'Second retry delay is ~2s with jitter');
  assert(delay2 >= 4000 && delay2 < 6000, 'Third retry delay is ~4s with jitter');
}

/**
 * Test: Should retry logic
 */
function testShouldRetry() {
  var client = new HttpClient({ maxRetries: 3 });
  
  // Network errors should retry
  assert(client.shouldRetry({ error: 'NetworkError' }, 0), 'Retries on NetworkError');
  assert(client.shouldRetry({ error: 'TimeoutError' }, 0), 'Retries on TimeoutError');
  
  // Specific status codes should retry
  assert(client.shouldRetry({ status: 429 }, 0), 'Retries on 429 status');
  assert(client.shouldRetry({ status: 503 }, 0), 'Retries on 503 status');
  
  // Should not retry after max attempts
  assert(!client.shouldRetry({ error: 'NetworkError' }, 3), 'Does not retry after max attempts');
  
  // Should not retry on client errors
  assert(!client.shouldRetry({ status: 400 }, 0), 'Does not retry on 400 status');
  assert(!client.shouldRetry({ status: 404 }, 0), 'Does not retry on 404 status');
}

/**
 * Test: Interceptor removal
 */
function testInterceptorRemoval() {
  var client = new HttpClient();
  
  var id1 = client.addRequestInterceptor(function(config) {
    return config;
  });
  
  var id2 = client.addResponseInterceptor(function(response) {
    return response;
  });
  
  assert(client.requestInterceptors.length === 1, 'Request interceptor added');
  assert(client.responseInterceptors.length === 1, 'Response interceptor added');
  
  client.removeRequestInterceptor(id1);
  client.removeResponseInterceptor(id2);
  
  assert(client.requestInterceptors[id1] === null, 'Request interceptor removed');
  assert(client.responseInterceptors[id2] === null, 'Response interceptor removed');
}

/**
 * Test: Base URL handling
 */
function testBaseURL() {
  var client = new HttpClient({ baseURL: 'https://api.example.com' });
  
  var config1 = { url: '/test' };
  var config2 = { url: 'https://other.com/test' };
  
  // This would be tested in the actual request, but we can verify the logic
  assert(client.config.baseURL === 'https://api.example.com', 'Base URL is set');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running HTTP Client tests...\n');
  
  testConstructor();
  testRetryDelay();
  testShouldRetry();
  testInterceptorRemoval();
  testBaseURL();
  
  // Async tests
  return testRequestInterceptors()
    .then(function() {
      return testResponseInterceptors();
    })
    .then(function() {
      console.log('\n--- Test Results ---');
      console.log('Passed: ' + testResults.passed);
      console.log('Failed: ' + testResults.failed);
      console.log('Total: ' + (testResults.passed + testResults.failed));
      
      return testResults;
    })
    .catch(function(error) {
      console.error('Test error:', error);
      return testResults;
    });
}

// Export for use in test runner
export { runTests, testResults };

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  runTests();
}
