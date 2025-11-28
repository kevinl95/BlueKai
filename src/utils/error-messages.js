/**
 * Error Message Mapping
 * Maps error types and codes to user-friendly messages
 */

// Error message mappings
export var ERROR_MESSAGES = {
  // Network errors
  'NetworkError': 'Cannot connect. Check your connection.',
  'TimeoutError': 'Request timed out. Please try again.',
  'ConnectionError': 'Connection failed. Check your network.',
  
  // Authentication errors
  'AuthError': 'Login expired. Please sign in again.',
  'InvalidCredentials': 'Invalid username or password.',
  'SessionExpired': 'Your session has expired. Please log in again.',
  'Unauthorized': 'You are not authorized to perform this action.',
  
  // API errors
  'RateLimitError': 'Too many requests. Please wait a moment.',
  'ServerError': 'BlueSky is having issues. Try again later.',
  'BadRequest': 'Invalid request. Please check your input.',
  'NotFound': 'The requested content was not found.',
  'Forbidden': 'You do not have permission to access this.',
  
  // Storage errors
  'StorageError': 'Storage full. Clearing cache...',
  'QuotaExceeded': 'Storage limit reached. Some data may not be saved.',
  
  // Client errors
  'ValidationError': 'Please check your input and try again.',
  'InvalidState': 'Something went wrong. Please refresh the app.',
  
  // Generic fallback
  'UnknownError': 'An unexpected error occurred. Please try again.'
};

/**
 * Get user-friendly error message
 * @param {Error|string} error - The error object or error type
 * @param {string} defaultMessage - Default message if no mapping found
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error, defaultMessage) {
  if (!error) {
    return defaultMessage || ERROR_MESSAGES.UnknownError;
  }

  // If error is a string, use it as the type
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || defaultMessage || ERROR_MESSAGES.UnknownError;
  }

  // Check for error type property
  if (error.type && ERROR_MESSAGES[error.type]) {
    return ERROR_MESSAGES[error.type];
  }

  // Check for error name
  if (error.name && ERROR_MESSAGES[error.name]) {
    return ERROR_MESSAGES[error.name];
  }

  // Check for HTTP status codes
  if (error.status) {
    var statusMessage = getStatusMessage(error.status);
    if (statusMessage) {
      return statusMessage;
    }
  }

  // Check for specific error messages
  if (error.message && typeof error.message === 'string') {
    // Network-related errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NetworkError;
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TimeoutError;
    }
    if (error.message.includes('quota') || error.message.includes('storage')) {
      return ERROR_MESSAGES.QuotaExceeded;
    }
  }

  // Return default message or generic error
  return defaultMessage || error.message || ERROR_MESSAGES.UnknownError;
}

/**
 * Get error message based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string|null} Error message or null if no mapping
 */
export function getStatusMessage(status) {
  var statusMessages = {
    400: ERROR_MESSAGES.BadRequest,
    401: ERROR_MESSAGES.AuthError,
    403: ERROR_MESSAGES.Forbidden,
    404: ERROR_MESSAGES.NotFound,
    429: ERROR_MESSAGES.RateLimitError,
    500: ERROR_MESSAGES.ServerError,
    502: ERROR_MESSAGES.ServerError,
    503: ERROR_MESSAGES.ServerError,
    504: ERROR_MESSAGES.TimeoutError
  };

  return statusMessages[status] || null;
}

/**
 * Determine if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is retryable
 */
export function isRetryableError(error) {
  if (!error) {
    return false;
  }

  // Network errors are retryable
  if (error.type === 'NetworkError' || error.name === 'NetworkError') {
    return true;
  }

  // Timeout errors are retryable
  if (error.type === 'TimeoutError' || (error.message && typeof error.message === 'string' && error.message.includes('timeout'))) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Rate limit errors are retryable (after waiting)
  if (error.status === 429) {
    return true;
  }

  return false;
}

/**
 * Get error category for logging/analytics
 * @param {Error} error - The error to categorize
 * @returns {string} Error category
 */
export function getErrorCategory(error) {
  if (!error) {
    return 'unknown';
  }

  // Check status codes
  if (error.status) {
    if (error.status === 401 || error.status === 403) {
      return 'auth';
    }
    if (error.status === 429) {
      return 'rate_limit';
    }
    if (error.status >= 500) {
      return 'server';
    }
    if (error.status >= 400) {
      return 'client';
    }
  }

  // Check error types
  if (error.type && typeof error.type === 'string') {
    if (error.type.includes('Network') || error.type.includes('Connection')) {
      return 'network';
    }
    if (error.type.includes('Auth')) {
      return 'auth';
    }
    if (error.type.includes('Storage')) {
      return 'storage';
    }
  }

  // Check error message
  if (error.message && typeof error.message === 'string') {
    if (error.message.includes('network') || error.message.includes('connection')) {
      return 'network';
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'auth';
    }
    if (error.message.includes('storage') || error.message.includes('quota')) {
      return 'storage';
    }
  }

  return 'unknown';
}
