/**
 * Error Logging Utility
 * Provides centralized error logging with categorization and context
 */

// Error log storage (in-memory for now, could be persisted to LocalStorage)
var errorLog = [];
var MAX_LOG_SIZE = 50;

/**
 * Log an error with context
 * @param {Error|string} error - The error to log
 * @param {Object} context - Additional context about the error
 */
export function logError(error, context) {
  var errorEntry = {
    timestamp: new Date().toISOString(),
    message: error.message || String(error),
    stack: error.stack || null,
    context: context || {},
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };

  // Add to in-memory log
  errorLog.push(errorEntry);

  // Keep log size manageable
  if (errorLog.length > MAX_LOG_SIZE) {
    errorLog.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorLogger]', errorEntry);
  }

  // In production, could send to a logging service
  // sendToLoggingService(errorEntry);

  return errorEntry;
}

/**
 * Get all logged errors
 * @returns {Array} Array of error entries
 */
export function getErrorLog() {
  return errorLog.slice();
}

/**
 * Clear the error log
 */
export function clearErrorLog() {
  errorLog = [];
}

/**
 * Get error count by type
 * @param {string} type - Error type to count
 * @returns {number} Count of errors of that type
 */
export function getErrorCount(type) {
  if (!type) {
    return errorLog.length;
  }
  return errorLog.filter(function(entry) {
    return entry.context.type === type;
  }).length;
}

/**
 * Log a network error
 * @param {Error} error - The network error
 * @param {Object} requestInfo - Information about the failed request
 */
export function logNetworkError(error, requestInfo) {
  return logError(error, {
    type: 'network_error',
    url: requestInfo.url,
    method: requestInfo.method,
    status: requestInfo.status
  });
}

/**
 * Log an authentication error
 * @param {Error} error - The auth error
 * @param {Object} authInfo - Information about the auth attempt
 */
export function logAuthError(error, authInfo) {
  return logError(error, {
    type: 'auth_error',
    action: authInfo.action,
    identifier: authInfo.identifier ? '[REDACTED]' : null
  });
}

/**
 * Log an API error
 * @param {Error} error - The API error
 * @param {Object} apiInfo - Information about the API call
 */
export function logApiError(error, apiInfo) {
  return logError(error, {
    type: 'api_error',
    endpoint: apiInfo.endpoint,
    method: apiInfo.method,
    status: apiInfo.status,
    statusText: apiInfo.statusText
  });
}

/**
 * Log a storage error
 * @param {Error} error - The storage error
 * @param {Object} storageInfo - Information about the storage operation
 */
export function logStorageError(error, storageInfo) {
  return logError(error, {
    type: 'storage_error',
    operation: storageInfo.operation,
    key: storageInfo.key
  });
}
