/**
 * Retry Handler
 * Provides retry mechanisms for failed requests
 */

import { isRetryableError } from './error-messages.js';
import { logError } from './error-logger.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry (should return a Promise)
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Custom function to determine if error is retryable
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise} Promise that resolves with the result or rejects with the final error
 */
export function retryWithBackoff(fn, options) {
  options = options || {};
  var maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
  var initialDelay = options.initialDelay || 1000;
  var maxDelay = options.maxDelay || 10000;
  var shouldRetry = options.shouldRetry || isRetryableError;
  var onRetry = options.onRetry;

  var attempt = 0;

  function executeAttempt() {
    return fn().catch(function(error) {
      attempt++;

      // Check if we should retry
      if (attempt >= maxRetries || !shouldRetry(error)) {
        logError(error, {
          type: 'retry_failed',
          attempts: attempt,
          maxRetries: maxRetries
        });
        throw error;
      }

      // Calculate delay with exponential backoff
      var delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);

      // Add jitter to prevent thundering herd
      delay = delay + Math.random() * 1000;

      logError(error, {
        type: 'retry_attempt',
        attempt: attempt,
        maxRetries: maxRetries,
        nextDelay: delay
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, delay, error);
      }

      // Wait and retry
      return new Promise(function(resolve) {
        setTimeout(resolve, delay);
      }).then(executeAttempt);
    });
  }

  return executeAttempt();
}

/**
 * Retry a function a fixed number of times with a fixed delay
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Promise that resolves with the result or rejects with the final error
 */
export function retryFixed(fn, maxRetries, delay) {
  maxRetries = maxRetries || 3;
  delay = delay || 1000;

  var attempt = 0;

  function executeAttempt() {
    return fn().catch(function(error) {
      attempt++;

      if (attempt >= maxRetries) {
        throw error;
      }

      return new Promise(function(resolve) {
        setTimeout(resolve, delay);
      }).then(executeAttempt);
    });
  }

  return executeAttempt();
}

/**
 * Create a retryable version of a function
 * @param {Function} fn - Function to make retryable
 * @param {Object} options - Retry options (same as retryWithBackoff)
 * @returns {Function} Retryable function
 */
export function makeRetryable(fn, options) {
  return function() {
    var args = arguments;
    var self = this;
    
    return retryWithBackoff(function() {
      return fn.apply(self, args);
    }, options);
  };
}

/**
 * Retry handler for network requests
 * Specialized retry logic for HTTP requests
 * @param {Function} requestFn - Function that makes the request
 * @param {Object} options - Retry options
 * @returns {Promise} Promise that resolves with the response
 */
export function retryRequest(requestFn, options) {
  options = options || {};
  
  // Custom shouldRetry for network requests
  var shouldRetry = function(error) {
    // Don't retry client errors (4xx except 429)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }
    
    // Retry network errors, timeouts, and server errors
    return isRetryableError(error);
  };

  return retryWithBackoff(requestFn, {
    maxRetries: options.maxRetries || 3,
    initialDelay: options.initialDelay || 1000,
    maxDelay: options.maxDelay || 10000,
    shouldRetry: shouldRetry,
    onRetry: options.onRetry
  });
}
