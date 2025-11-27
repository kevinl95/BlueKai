/**
 * ToastContainer Component
 * Container for displaying toast notifications
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Toast from './Toast.js';
import { subscribe, dismissToast } from '../utils/toast-manager.js';

/**
 * Container component that displays all active toasts
 */
function ToastContainer() {
  var _useState = useState([]);
  var toasts = _useState[0];
  var setToasts = _useState[1];

  useEffect(function() {
    // Subscribe to toast changes
    var unsubscribe = subscribe(function(newToasts) {
      setToasts(newToasts);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return h('div', { className: 'toast-container' },
    toasts.map(function(toast) {
      return h(Toast, {
        key: toast.id,
        message: toast.message,
        type: toast.type,
        duration: toast.duration,
        onClose: function() {
          dismissToast(toast.id);
        }
      });
    })
  );
}

export default ToastContainer;
