/**
 * Performance Optimization Utilities
 * Requirements: 7.1, 7.2, 7.3, 7.4
 * Provides memoization, debouncing, throttling, and other performance helpers
 */

/**
 * Memoize a function to cache results based on arguments
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Optional function to generate cache key from arguments
 * @returns {Function} Memoized function
 */
function memoize(fn, keyGenerator) {
  var cache = {};
  
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var key = keyGenerator ? keyGenerator.apply(null, args) : JSON.stringify(args);
    
    if (cache.hasOwnProperty(key)) {
      return cache[key];
    }
    
    var result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  var timeoutId = null;
  
  return function() {
    var context = this;
    var args = arguments;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 * Throttle a function to limit execution frequency
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between executions in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(fn, limit) {
  var inThrottle = false;
  var lastResult;
  
  return function() {
    var context = this;
    var args = arguments;
    
    if (!inThrottle) {
      lastResult = fn.apply(context, args);
      inThrottle = true;
      
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

/**
 * Request deduplication manager
 * Prevents duplicate concurrent requests for the same resource
 */
function createRequestDeduplicator() {
  var pendingRequests = {};
  
  return {
    /**
     * Execute a request with deduplication
     * @param {string} key - Unique key for the request
     * @param {Function} requestFn - Function that returns a Promise
     * @returns {Promise} Request promise
     */
    dedupe: function(key, requestFn) {
      // If request is already pending, return existing promise
      if (pendingRequests[key]) {
        return pendingRequests[key];
      }
      
      // Create new request
      var promise = requestFn().then(
        function(result) {
          delete pendingRequests[key];
          return result;
        },
        function(error) {
          delete pendingRequests[key];
          throw error;
        }
      );
      
      pendingRequests[key] = promise;
      return promise;
    },
    
    /**
     * Clear a specific pending request
     * @param {string} key - Request key to clear
     */
    clear: function(key) {
      delete pendingRequests[key];
    },
    
    /**
     * Clear all pending requests
     */
    clearAll: function() {
      pendingRequests = {};
    }
  };
}

/**
 * Create a batched function that collects calls and executes them together
 * @param {Function} fn - Function to batch (receives array of arguments)
 * @param {number} delay - Delay before executing batch
 * @returns {Function} Batched function
 */
function batch(fn, delay) {
  var queue = [];
  var timeoutId = null;
  
  function flush() {
    if (queue.length > 0) {
      var items = queue.slice();
      queue = [];
      fn(items);
    }
    timeoutId = null;
  }
  
  return function() {
    var args = Array.prototype.slice.call(arguments);
    queue.push(args);
    
    if (!timeoutId) {
      timeoutId = setTimeout(flush, delay);
    }
  };
}

/**
 * Simple LRU (Least Recently Used) cache implementation
 * @param {number} maxSize - Maximum number of items to cache
 * @returns {Object} Cache instance
 */
function createLRUCache(maxSize) {
  var cache = {};
  var keys = [];
  
  return {
    get: function(key) {
      if (cache.hasOwnProperty(key)) {
        // Move to end (most recently used)
        var index = keys.indexOf(key);
        if (index > -1) {
          keys.splice(index, 1);
          keys.push(key);
        }
        return cache[key];
      }
      return null;
    },
    
    set: function(key, value) {
      // If key exists, update and move to end
      if (cache.hasOwnProperty(key)) {
        var index = keys.indexOf(key);
        if (index > -1) {
          keys.splice(index, 1);
        }
      }
      
      // Add new item
      cache[key] = value;
      keys.push(key);
      
      // Evict oldest if over limit
      if (keys.length > maxSize) {
        var oldestKey = keys.shift();
        delete cache[oldestKey];
      }
    },
    
    has: function(key) {
      return cache.hasOwnProperty(key);
    },
    
    delete: function(key) {
      if (cache.hasOwnProperty(key)) {
        delete cache[key];
        var index = keys.indexOf(key);
        if (index > -1) {
          keys.splice(index, 1);
        }
      }
    },
    
    clear: function() {
      cache = {};
      keys = [];
    },
    
    size: function() {
      return keys.length;
    }
  };
}

/**
 * RAF-based throttle for scroll/animation handlers
 * @param {Function} fn - Function to throttle
 * @returns {Function} Throttled function
 */
function rafThrottle(fn) {
  var rafId = null;
  var context = null;
  var args = null;
  
  function execute() {
    fn.apply(context, args);
    rafId = null;
  }
  
  return function() {
    context = this;
    args = arguments;
    
    if (!rafId) {
      rafId = requestAnimationFrame(execute);
    }
  };
}

module.exports = {
  memoize: memoize,
  debounce: debounce,
  throttle: throttle,
  createRequestDeduplicator: createRequestDeduplicator,
  batch: batch,
  createLRUCache: createLRUCache,
  rafThrottle: rafThrottle
};
