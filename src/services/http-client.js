/**
 * Enhanced HTTP Client with interceptors and retry logic
 * Compatible with Gecko 48 (no Fetch API available)
 */

import http from '../utils/http.js';

/**
 * HTTP Client with interceptors and retry logic
 */
function HttpClient(config) {
  this.config = Object.assign({
    baseURL: '',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504]
  }, config || {});

  this.requestInterceptors = [];
  this.responseInterceptors = [];
}

/**
 * Add request interceptor
 * @param {Function} onFulfilled - Called before request is sent
 * @param {Function} onRejected - Called if request setup fails
 * @returns {number} Interceptor ID for removal
 */
HttpClient.prototype.addRequestInterceptor = function(onFulfilled, onRejected) {
  var id = this.requestInterceptors.length;
  this.requestInterceptors.push({
    fulfilled: onFulfilled,
    rejected: onRejected
  });
  return id;
};

/**
 * Add response interceptor
 * @param {Function} onFulfilled - Called on successful response
 * @param {Function} onRejected - Called on error response
 * @returns {number} Interceptor ID for removal
 */
HttpClient.prototype.addResponseInterceptor = function(onFulfilled, onRejected) {
  var id = this.responseInterceptors.length;
  this.responseInterceptors.push({
    fulfilled: onFulfilled,
    rejected: onRejected
  });
  return id;
};

/**
 * Remove request interceptor
 * @param {number} id - Interceptor ID
 */
HttpClient.prototype.removeRequestInterceptor = function(id) {
  if (this.requestInterceptors[id]) {
    this.requestInterceptors[id] = null;
  }
};

/**
 * Remove response interceptor
 * @param {number} id - Interceptor ID
 */
HttpClient.prototype.removeResponseInterceptor = function(id) {
  if (this.responseInterceptors[id]) {
    this.responseInterceptors[id] = null;
  }
};

/**
 * Apply request interceptors
 * @param {Object} config - Request config
 * @returns {Promise} Promise that resolves with modified config
 */
HttpClient.prototype.applyRequestInterceptors = function(config) {
  var promise = Promise.resolve(config);
  
  for (var i = 0; i < this.requestInterceptors.length; i++) {
    var interceptor = this.requestInterceptors[i];
    if (interceptor) {
      promise = promise.then(interceptor.fulfilled, interceptor.rejected);
    }
  }
  
  return promise;
};

/**
 * Apply response interceptors
 * @param {Object} response - Response object
 * @returns {Promise} Promise that resolves with modified response
 */
HttpClient.prototype.applyResponseInterceptors = function(response) {
  var promise = Promise.resolve(response);
  
  for (var i = 0; i < this.responseInterceptors.length; i++) {
    var interceptor = this.responseInterceptors[i];
    if (interceptor) {
      promise = promise.then(interceptor.fulfilled, interceptor.rejected);
    }
  }
  
  return promise;
};

/**
 * Calculate retry delay with exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
HttpClient.prototype.calculateRetryDelay = function(attempt) {
  var baseDelay = this.config.retryDelay;
  var exponentialDelay = baseDelay * Math.pow(2, attempt);
  var jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
};

/**
 * Check if error should be retried
 * @param {Object} error - Error response
 * @param {number} attempt - Current attempt number
 * @returns {boolean} True if should retry
 */
HttpClient.prototype.shouldRetry = function(error, attempt) {
  if (attempt >= this.config.maxRetries) {
    return false;
  }
  
  // Retry on network errors
  if (error.error === 'NetworkError' || error.error === 'TimeoutError') {
    return true;
  }
  
  // Retry on specific status codes
  if (error.status && this.config.retryStatusCodes.indexOf(error.status) !== -1) {
    return true;
  }
  
  return false;
};

/**
 * Make HTTP request with retry logic
 * @param {Object} config - Request configuration
 * @returns {Promise} Promise that resolves with response
 */
HttpClient.prototype.request = function(config) {
  var self = this;
  
  // Merge with default config
  var requestConfig = Object.assign({}, this.config, config);
  
  // Add base URL if relative URL
  if (requestConfig.url && requestConfig.url.indexOf('http') !== 0) {
    requestConfig.url = this.config.baseURL + requestConfig.url;
  }
  
  // Apply request interceptors
  return this.applyRequestInterceptors(requestConfig)
    .then(function(modifiedConfig) {
      return self.executeRequest(modifiedConfig, 0);
    });
};

/**
 * Execute request with retry logic
 * @param {Object} config - Request configuration
 * @param {number} attempt - Current attempt number
 * @returns {Promise} Promise that resolves with response
 */
HttpClient.prototype.executeRequest = function(config, attempt) {
  var self = this;
  
  return http.request(config)
    .then(function(response) {
      // Apply response interceptors on success
      return self.applyResponseInterceptors(response);
    })
    .catch(function(error) {
      // Check if we should retry
      if (self.shouldRetry(error, attempt)) {
        var delay = self.calculateRetryDelay(attempt);
        
        // Wait and retry
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve(self.executeRequest(config, attempt + 1));
          }, delay);
        });
      }
      
      // Apply response interceptors on error
      return self.applyResponseInterceptors(Promise.reject(error));
    });
};

/**
 * Convenience method for GET requests
 * @param {string} url - Request URL
 * @param {Object} config - Additional configuration
 * @returns {Promise} Promise that resolves with response
 */
HttpClient.prototype.get = function(url, config) {
  return this.request(Object.assign({}, config, {
    url: url,
    method: 'GET'
  }));
};

/**
 * Convenience method for POST requests
 * @param {string} url - Request URL
 * @param {*} data - Request body
 * @param {Object} config - Additional configuration
 * @returns {Promise} Promise that resolves with response
 */
HttpClient.prototype.post = function(url, data, config) {
  return this.request(Object.assign({}, config, {
    url: url,
    method: 'POST',
    body: data
  }));
};

/**
 * Convenience method for PUT requests
 * @param {string} url - Request URL
 * @param {*} data - Request body
 * @param {Object} config - Additional configuration
 * @returns {Promise} Promise that resolves with response
 */
HttpClient.prototype.put = function(url, data, config) {
  return this.request(Object.assign({}, config, {
    url: url,
    method: 'PUT',
    body: data
  }));
};

/**
 * Convenience method for DELETE requests
 * @param {string} url - Request URL
 * @param {Object} config - Additional configuration
 * @returns {Promise} Promise that resolves with response
 */
HttpClient.prototype.delete = function(url, config) {
  return this.request(Object.assign({}, config, {
    url: url,
    method: 'DELETE'
  }));
};

export default HttpClient;
