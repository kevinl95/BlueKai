import { h } from 'preact';

/**
 * ErrorMessage - User-friendly error display component
 * @param {Object} props
 * @param {string|Error} props.error - Error object or message
 * @param {Function} props.onRetry - Optional retry callback
 * @param {string} props.title - Optional error title
 * @param {boolean} props.inline - Whether to display inline
 */
function ErrorMessage(props) {
  var error = props.error;
  var onRetry = props.onRetry;
  var title = props.title || 'Error';
  var inline = props.inline || false;
  
  // Get user-friendly error message
  var message = getErrorMessage(error);
  
  var className = 'error-message';
  if (inline) {
    className += ' error-message--inline';
  }
  
  return h('div', { className: className, role: 'alert', 'aria-live': 'assertive' },
    h('div', { className: 'error-message__icon' }, '⚠'),
    h('div', { className: 'error-message__content' },
      h('div', { className: 'error-message__title' }, title),
      h('div', { className: 'error-message__text' }, message)
    ),
    onRetry && h('button', {
      className: 'error-message__retry',
      onClick: onRetry,
      type: 'button'
    }, 'Retry')
  );
}

/**
 * Get user-friendly error message from error object or string
 */
function getErrorMessage(error) {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // If it's a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // If it's an Error object with a message
  if (error.message) {
    return mapErrorMessage(error.message, error);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Map technical error messages to user-friendly ones
 */
function mapErrorMessage(message, error) {
  var errorMap = {
    'NetworkError': 'Cannot connect. Check your connection.',
    'Network request failed': 'Cannot connect. Check your connection.',
    'Failed to fetch': 'Cannot connect. Check your connection.',
    'AuthError': 'Login expired. Please sign in again.',
    'Invalid credentials': 'Invalid username or password.',
    'Unauthorized': 'Login expired. Please sign in again.',
    'RateLimitError': 'Too many requests. Please wait.',
    'Too Many Requests': 'Too many requests. Please wait.',
    'ServerError': 'BlueSky is having issues. Try again later.',
    'Internal Server Error': 'BlueSky is having issues. Try again later.',
    'StorageError': 'Storage full. Clearing cache...',
    'QuotaExceededError': 'Storage full. Clearing cache...'
  };
  
  // Check for exact matches
  if (errorMap[message]) {
    return errorMap[message];
  }
  
  // Check for partial matches
  for (var key in errorMap) {
    if (message.indexOf(key) !== -1) {
      return errorMap[key];
    }
  }
  
  // Check HTTP status codes
  if (error && error.status) {
    if (error.status === 401) {
      return 'Login expired. Please sign in again.';
    }
    if (error.status === 429) {
      return 'Too many requests. Please wait.';
    }
    if (error.status >= 500) {
      return 'BlueSky is having issues. Try again later.';
    }
    if (error.status >= 400) {
      return 'Invalid request. Please try again.';
    }
  }
  
  // Return original message if no mapping found
  return message;
}

export default ErrorMessage;
export { getErrorMessage, mapErrorMessage };
