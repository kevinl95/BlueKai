/**
 * Error Logger Tests
 */

import {
  logError,
  getErrorLog,
  clearErrorLog,
  getErrorCount,
  logNetworkError,
  logAuthError,
  logApiError,
  logStorageError
} from './error-logger.js';

describe('Error Logger', function() {
  beforeEach(function() {
    clearErrorLog();
  });

  it('should log errors with context', function() {
    var error = new Error('Test error');
    var context = { type: 'test', action: 'testing' };
    
    var entry = logError(error, context);
    
    console.assert(entry.message === 'Test error', 'Should log error message');
    console.assert(entry.context.type === 'test', 'Should include context');
    console.assert(entry.timestamp !== undefined, 'Should include timestamp');
  });

  it('should store errors in log', function() {
    logError(new Error('Error 1'));
    logError(new Error('Error 2'));
    
    var log = getErrorLog();
    console.assert(log.length === 2, 'Should store multiple errors');
    console.assert(log[0].message === 'Error 1', 'Should store first error');
    console.assert(log[1].message === 'Error 2', 'Should store second error');
  });

  it('should clear error log', function() {
    logError(new Error('Test'));
    console.assert(getErrorLog().length === 1, 'Should have one error');
    
    clearErrorLog();
    console.assert(getErrorLog().length === 0, 'Should clear all errors');
  });

  it('should count errors by type', function() {
    logError(new Error('Error 1'), { type: 'network' });
    logError(new Error('Error 2'), { type: 'network' });
    logError(new Error('Error 3'), { type: 'auth' });
    
    console.assert(getErrorCount() === 3, 'Should count all errors');
    console.assert(getErrorCount('network') === 2, 'Should count network errors');
    console.assert(getErrorCount('auth') === 1, 'Should count auth errors');
  });

  it('should log network errors with request info', function() {
    var error = new Error('Network failed');
    var requestInfo = {
      url: '/api/test',
      method: 'GET',
      status: 500
    };
    
    var entry = logNetworkError(error, requestInfo);
    
    console.assert(entry.context.type === 'network_error', 'Should set type');
    console.assert(entry.context.url === '/api/test', 'Should include URL');
    console.assert(entry.context.method === 'GET', 'Should include method');
    console.assert(entry.context.status === 500, 'Should include status');
  });

  it('should log auth errors with redacted info', function() {
    var error = new Error('Auth failed');
    var authInfo = {
      action: 'login',
      identifier: 'user@example.com'
    };
    
    var entry = logAuthError(error, authInfo);
    
    console.assert(entry.context.type === 'auth_error', 'Should set type');
    console.assert(entry.context.action === 'login', 'Should include action');
    console.assert(entry.context.identifier === '[REDACTED]', 'Should redact identifier');
  });

  it('should log API errors with endpoint info', function() {
    var error = new Error('API error');
    var apiInfo = {
      endpoint: '/api/posts',
      method: 'POST',
      status: 400,
      statusText: 'Bad Request'
    };
    
    var entry = logApiError(error, apiInfo);
    
    console.assert(entry.context.type === 'api_error', 'Should set type');
    console.assert(entry.context.endpoint === '/api/posts', 'Should include endpoint');
    console.assert(entry.context.status === 400, 'Should include status');
  });

  it('should log storage errors with operation info', function() {
    var error = new Error('Storage full');
    var storageInfo = {
      operation: 'set',
      key: 'test-key'
    };
    
    var entry = logStorageError(error, storageInfo);
    
    console.assert(entry.context.type === 'storage_error', 'Should set type');
    console.assert(entry.context.operation === 'set', 'Should include operation');
    console.assert(entry.context.key === 'test-key', 'Should include key');
  });

  it('should handle string errors', function() {
    var entry = logError('String error message');
    console.assert(entry.message === 'String error message', 'Should handle string errors');
  });

  it('should limit log size', function() {
    // Log more than MAX_LOG_SIZE (50) errors
    for (var i = 0; i < 60; i++) {
      logError(new Error('Error ' + i));
    }
    
    var log = getErrorLog();
    console.assert(log.length <= 50, 'Should limit log size to 50');
    console.assert(log[0].message === 'Error 10', 'Should remove oldest entries');
  });
});

console.log('Error Logger tests completed');
