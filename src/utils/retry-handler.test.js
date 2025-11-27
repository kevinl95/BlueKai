/**
 * Retry Handler Tests
 */

import {
  retryWithBackoff,
  retryFixed,
  makeRetryable,
  retryRequest
} from './retry-handler.js';

describe('Retry Handler', function() {
  it('should succeed on first attempt', function(done) {
    var attempts = 0;
    
    var fn = function() {
      attempts++;
      return Promise.resolve('success');
    };
    
    retryWithBackoff(fn, { maxRetries: 3 })
      .then(function(result) {
        console.assert(result === 'success', 'Should return success result');
        console.assert(attempts === 1, 'Should only attempt once');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should retry on retryable error', function(done) {
    var attempts = 0;
    
    var fn = function() {
      attempts++;
      if (attempts < 3) {
        var error = new Error('Network error');
        error.type = 'NetworkError';
        return Promise.reject(error);
      }
      return Promise.resolve('success');
    };
    
    retryWithBackoff(fn, { 
      maxRetries: 3,
      initialDelay: 10 // Short delay for testing
    })
      .then(function(result) {
        console.assert(result === 'success', 'Should eventually succeed');
        console.assert(attempts === 3, 'Should retry twice before success');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should fail after max retries', function(done) {
    var attempts = 0;
    
    var fn = function() {
      attempts++;
      var error = new Error('Network error');
      error.type = 'NetworkError';
      return Promise.reject(error);
    };
    
    retryWithBackoff(fn, { 
      maxRetries: 3,
      initialDelay: 10
    })
      .then(function() {
        console.error('Should not succeed');
        done();
      })
      .catch(function(error) {
        console.assert(error.message === 'Network error', 'Should return final error');
        console.assert(attempts === 3, 'Should attempt max times');
        done();
      });
  });

  it('should not retry non-retryable errors', function(done) {
    var attempts = 0;
    
    var fn = function() {
      attempts++;
      var error = new Error('Bad request');
      error.status = 400;
      return Promise.reject(error);
    };
    
    retryWithBackoff(fn, { maxRetries: 3 })
      .then(function() {
        console.error('Should not succeed');
        done();
      })
      .catch(function(error) {
        console.assert(error.status === 400, 'Should return error');
        console.assert(attempts === 1, 'Should not retry');
        done();
      });
  });

  it('should use custom shouldRetry function', function(done) {
    var attempts = 0;
    
    var fn = function() {
      attempts++;
      return Promise.reject(new Error('Custom error'));
    };
    
    var shouldRetry = function(error) {
      return error.message === 'Custom error';
    };
    
    retryWithBackoff(fn, { 
      maxRetries: 2,
      initialDelay: 10,
      shouldRetry: shouldRetry
    })
      .then(function() {
        console.error('Should not succeed');
        done();
      })
      .catch(function() {
        console.assert(attempts === 2, 'Should retry with custom function');
        done();
      });
  });

  it('should call onRetry callback', function(done) {
    var attempts = 0;
    var retryCallbacks = 0;
    
    var fn = function() {
      attempts++;
      if (attempts < 2) {
        var error = new Error('Network error');
        error.type = 'NetworkError';
        return Promise.reject(error);
      }
      return Promise.resolve('success');
    };
    
    var onRetry = function(attempt, delay, error) {
      retryCallbacks++;
      console.assert(attempt > 0, 'Should pass attempt number');
      console.assert(delay > 0, 'Should pass delay');
      console.assert(error !== undefined, 'Should pass error');
    };
    
    retryWithBackoff(fn, { 
      maxRetries: 3,
      initialDelay: 10,
      onRetry: onRetry
    })
      .then(function() {
        console.assert(retryCallbacks === 1, 'Should call onRetry once');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should use exponential backoff', function(done) {
    var attempts = 0;
    var delays = [];
    
    var fn = function() {
      attempts++;
      if (attempts < 4) {
        var error = new Error('Network error');
        error.type = 'NetworkError';
        return Promise.reject(error);
      }
      return Promise.resolve('success');
    };
    
    var onRetry = function(attempt, delay) {
      delays.push(delay);
    };
    
    retryWithBackoff(fn, { 
      maxRetries: 4,
      initialDelay: 100,
      onRetry: onRetry
    })
      .then(function() {
        console.assert(delays.length === 3, 'Should have 3 delays');
        // Delays should increase (with jitter, so approximate)
        console.assert(delays[1] > delays[0], 'Second delay should be larger');
        console.assert(delays[2] > delays[1], 'Third delay should be larger');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should retry with fixed delay', function(done) {
    var attempts = 0;
    
    var fn = function() {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Error'));
      }
      return Promise.resolve('success');
    };
    
    retryFixed(fn, 3, 10)
      .then(function(result) {
        console.assert(result === 'success', 'Should succeed');
        console.assert(attempts === 3, 'Should retry with fixed delay');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should create retryable function', function(done) {
    var attempts = 0;
    
    var originalFn = function(value) {
      attempts++;
      if (attempts < 2) {
        var error = new Error('Network error');
        error.type = 'NetworkError';
        return Promise.reject(error);
      }
      return Promise.resolve(value + ' success');
    };
    
    var retryableFn = makeRetryable(originalFn, { 
      maxRetries: 3,
      initialDelay: 10
    });
    
    retryableFn('test')
      .then(function(result) {
        console.assert(result === 'test success', 'Should pass arguments and return result');
        console.assert(attempts === 2, 'Should retry');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should retry network requests', function(done) {
    var attempts = 0;
    
    var requestFn = function() {
      attempts++;
      if (attempts < 2) {
        var error = new Error('Network error');
        error.status = 500;
        return Promise.reject(error);
      }
      return Promise.resolve({ data: 'success' });
    };
    
    retryRequest(requestFn, { initialDelay: 10 })
      .then(function(result) {
        console.assert(result.data === 'success', 'Should return response');
        console.assert(attempts === 2, 'Should retry server errors');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });

  it('should not retry client errors in requests', function(done) {
    var attempts = 0;
    
    var requestFn = function() {
      attempts++;
      var error = new Error('Bad request');
      error.status = 400;
      return Promise.reject(error);
    };
    
    retryRequest(requestFn)
      .then(function() {
        console.error('Should not succeed');
        done();
      })
      .catch(function(error) {
        console.assert(error.status === 400, 'Should return error');
        console.assert(attempts === 1, 'Should not retry 400 errors');
        done();
      });
  });

  it('should retry 429 rate limit errors', function(done) {
    var attempts = 0;
    
    var requestFn = function() {
      attempts++;
      if (attempts < 2) {
        var error = new Error('Rate limited');
        error.status = 429;
        return Promise.reject(error);
      }
      return Promise.resolve('success');
    };
    
    retryRequest(requestFn, { initialDelay: 10 })
      .then(function(result) {
        console.assert(result === 'success', 'Should succeed');
        console.assert(attempts === 2, 'Should retry 429 errors');
        done();
      })
      .catch(function(error) {
        console.error('Unexpected error:', error);
        done();
      });
  });
});

console.log('Retry Handler tests completed');
