/**
 * Error Messages Tests
 */

import {
  ERROR_MESSAGES,
  getErrorMessage,
  getStatusMessage,
  isRetryableError,
  getErrorCategory
} from './error-messages.js';

describe('Error Messages', function() {
  it('should return mapped error message for error type', function() {
    var message = getErrorMessage('NetworkError');
    console.assert(message === ERROR_MESSAGES.NetworkError, 'Should return network error message');
  });

  it('should return mapped error message for error object with type', function() {
    var error = { type: 'AuthError', message: 'Auth failed' };
    var message = getErrorMessage(error);
    console.assert(message === ERROR_MESSAGES.AuthError, 'Should return auth error message');
  });

  it('should return mapped error message for error object with name', function() {
    var error = new Error('Test');
    error.name = 'RateLimitError';
    var message = getErrorMessage(error);
    console.assert(message === ERROR_MESSAGES.RateLimitError, 'Should return rate limit message');
  });

  it('should return status-based message for HTTP errors', function() {
    var error = { status: 404, message: 'Not found' };
    var message = getErrorMessage(error);
    console.assert(message === ERROR_MESSAGES.NotFound, 'Should return 404 message');
  });

  it('should detect network errors from message', function() {
    var error = new Error('network request failed');
    var message = getErrorMessage(error);
    console.assert(message === ERROR_MESSAGES.NetworkError, 'Should detect network error');
  });

  it('should detect timeout errors from message', function() {
    var error = new Error('request timeout');
    var message = getErrorMessage(error);
    console.assert(message === ERROR_MESSAGES.TimeoutError, 'Should detect timeout error');
  });

  it('should detect storage errors from message', function() {
    var error = new Error('quota exceeded');
    var message = getErrorMessage(error);
    console.assert(message === ERROR_MESSAGES.QuotaExceeded, 'Should detect storage error');
  });

  it('should return default message for unknown errors', function() {
    var error = new Error('Unknown error type');
    var message = getErrorMessage(error);
    console.assert(message === 'Unknown error type', 'Should return error message');
  });

  it('should return custom default message when provided', function() {
    var error = { type: 'UnknownType' };
    var message = getErrorMessage(error, 'Custom default');
    console.assert(message === 'Custom default', 'Should return custom default');
  });

  it('should return status messages for common HTTP codes', function() {
    console.assert(getStatusMessage(400) === ERROR_MESSAGES.BadRequest, 'Should return 400 message');
    console.assert(getStatusMessage(401) === ERROR_MESSAGES.AuthError, 'Should return 401 message');
    console.assert(getStatusMessage(403) === ERROR_MESSAGES.Forbidden, 'Should return 403 message');
    console.assert(getStatusMessage(404) === ERROR_MESSAGES.NotFound, 'Should return 404 message');
    console.assert(getStatusMessage(429) === ERROR_MESSAGES.RateLimitError, 'Should return 429 message');
    console.assert(getStatusMessage(500) === ERROR_MESSAGES.ServerError, 'Should return 500 message');
  });

  it('should identify retryable network errors', function() {
    var error = { type: 'NetworkError' };
    console.assert(isRetryableError(error) === true, 'Network errors should be retryable');
  });

  it('should identify retryable timeout errors', function() {
    var error = new Error('request timeout');
    console.assert(isRetryableError(error) === true, 'Timeout errors should be retryable');
  });

  it('should identify retryable server errors', function() {
    var error = { status: 500 };
    console.assert(isRetryableError(error) === true, '500 errors should be retryable');
    
    error = { status: 503 };
    console.assert(isRetryableError(error) === true, '503 errors should be retryable');
  });

  it('should identify retryable rate limit errors', function() {
    var error = { status: 429 };
    console.assert(isRetryableError(error) === true, '429 errors should be retryable');
  });

  it('should identify non-retryable client errors', function() {
    var error = { status: 400 };
    console.assert(isRetryableError(error) === false, '400 errors should not be retryable');
    
    error = { status: 404 };
    console.assert(isRetryableError(error) === false, '404 errors should not be retryable');
  });

  it('should categorize auth errors', function() {
    var error = { status: 401 };
    console.assert(getErrorCategory(error) === 'auth', 'Should categorize 401 as auth');
    
    error = { status: 403 };
    console.assert(getErrorCategory(error) === 'auth', 'Should categorize 403 as auth');
  });

  it('should categorize network errors', function() {
    var error = { type: 'NetworkError' };
    console.assert(getErrorCategory(error) === 'network', 'Should categorize as network');
    
    error = new Error('network failed');
    console.assert(getErrorCategory(error) === 'network', 'Should detect network from message');
  });

  it('should categorize server errors', function() {
    var error = { status: 500 };
    console.assert(getErrorCategory(error) === 'server', 'Should categorize 500 as server');
  });

  it('should categorize storage errors', function() {
    var error = { type: 'StorageError' };
    console.assert(getErrorCategory(error) === 'storage', 'Should categorize as storage');
    
    error = new Error('quota exceeded');
    console.assert(getErrorCategory(error) === 'storage', 'Should detect storage from message');
  });

  it('should categorize rate limit errors', function() {
    var error = { status: 429 };
    console.assert(getErrorCategory(error) === 'rate_limit', 'Should categorize 429 as rate_limit');
  });

  it('should return unknown for unrecognized errors', function() {
    var error = { type: 'WeirdError' };
    console.assert(getErrorCategory(error) === 'unknown', 'Should return unknown category');
  });
});

console.log('Error Messages tests completed');
