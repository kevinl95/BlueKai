/**
 * Toast Manager
 * Manages toast notifications globally
 */

// Toast queue
var toasts = [];
var listeners = [];
var nextId = 1;

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {Object} options - Toast options
 * @param {string} options.type - Toast type: 'info', 'success', 'warning', 'error'
 * @param {number} options.duration - Duration in ms (default: 3000)
 * @returns {number} Toast ID
 */
export function showToast(message, options) {
  options = options || {};
  
  var toast = {
    id: nextId++,
    message: message,
    type: options.type || 'info',
    duration: options.duration !== undefined ? options.duration : 3000
  };

  toasts.push(toast);
  notifyListeners();

  return toast.id;
}

/**
 * Show an info toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms
 * @returns {number} Toast ID
 */
export function showInfo(message, duration) {
  return showToast(message, { type: 'info', duration: duration });
}

/**
 * Show a success toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms
 * @returns {number} Toast ID
 */
export function showSuccess(message, duration) {
  return showToast(message, { type: 'success', duration: duration });
}

/**
 * Show a warning toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms
 * @returns {number} Toast ID
 */
export function showWarning(message, duration) {
  return showToast(message, { type: 'warning', duration: duration });
}

/**
 * Show an error toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default: 5000 for errors)
 * @returns {number} Toast ID
 */
export function showError(message, duration) {
  return showToast(message, { 
    type: 'error', 
    duration: duration !== undefined ? duration : 5000 
  });
}

/**
 * Dismiss a toast by ID
 * @param {number} id - Toast ID to dismiss
 */
export function dismissToast(id) {
  toasts = toasts.filter(function(toast) {
    return toast.id !== id;
  });
  notifyListeners();
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  toasts = [];
  notifyListeners();
}

/**
 * Get all active toasts
 * @returns {Array} Array of toast objects
 */
export function getToasts() {
  return toasts.slice();
}

/**
 * Subscribe to toast changes
 * @param {Function} listener - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener) {
  listeners.push(listener);
  
  return function unsubscribe() {
    listeners = listeners.filter(function(l) {
      return l !== listener;
    });
  };
}

/**
 * Notify all listeners of toast changes
 */
function notifyListeners() {
  listeners.forEach(function(listener) {
    listener(toasts.slice());
  });
}
