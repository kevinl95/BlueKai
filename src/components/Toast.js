/**
 * Toast Component
 * Displays non-critical notifications that auto-dismiss
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Toast type: 'info', 'success', 'warning', 'error'
 * @param {number} props.duration - Duration in ms before auto-dismiss (default: 3000)
 * @param {Function} props.onClose - Callback when toast is dismissed
 */
function Toast(props) {
  var message = props.message;
  var type = props.type || 'info';
  var duration = props.duration || 3000;
  var onClose = props.onClose;

  var _useState = useState(true);
  var visible = _useState[0];
  var setVisible = _useState[1];

  useEffect(function() {
    if (duration > 0) {
      var timer = setTimeout(function() {
        setVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for animation
        }
      }, duration);

      return function() {
        clearTimeout(timer);
      };
    }
  }, [duration, onClose]);

  var handleClose = function() {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  if (!visible) {
    return null;
  }

  var className = 'toast toast--' + type;
  if (!visible) {
    className += ' toast--hidden';
  }

  var icon = getToastIcon(type);

  return h('div', {
    className: className,
    role: 'alert',
    'aria-live': type === 'error' ? 'assertive' : 'polite'
  },
    h('div', { className: 'toast__icon' }, icon),
    h('div', { className: 'toast__message' }, message),
    h('button', {
      className: 'toast__close',
      onClick: handleClose,
      'aria-label': 'Close notification',
      type: 'button'
    }, '×')
  );
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon character
 */
function getToastIcon(type) {
  var icons = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕'
  };
  return icons[type] || icons.info;
}

export default Toast;
