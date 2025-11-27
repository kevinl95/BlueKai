import { h } from 'preact';
import { getErrorMessage as getErrorMsg, isRetryableError } from '../utils/error-messages.js';

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
  
  // Get user-friendly error message using centralized utility
  var message = getErrorMsg(error);
  
  // Determine if error is retryable
  var showRetry = onRetry && (props.showRetry !== false) && isRetryableError(error);
  
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
    showRetry && h('button', {
      className: 'error-message__retry',
      onClick: onRetry,
      type: 'button',
      'data-focusable': 'true'
    }, 'Retry')
  );
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getErrorMessage from error-messages.js instead
 */
function getErrorMessage(error) {
  return getErrorMsg(error);
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getErrorMessage from error-messages.js instead
 */
function mapErrorMessage(message, error) {
  return getErrorMsg(error || message);
}

export default ErrorMessage;
export { getErrorMessage, mapErrorMessage };
