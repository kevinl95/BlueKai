/**
 * Network Status Utility
 * Provides offline detection and network status monitoring for KaiOS
 */

class NetworkStatus {
  constructor() {
    this.listeners = [];
    this.isOnline = this.checkOnlineStatus();
    if (typeof window !== 'undefined') {
      this.setupListeners();
    }
  }

  /**
   * Check current online status
   * @returns {boolean} True if online
   */
  checkOnlineStatus() {
    // Check navigator.onLine (supported in Gecko 48)
    if (typeof navigator !== 'undefined' && typeof navigator.onLine !== 'undefined') {
      return navigator.onLine;
    }
    // Fallback: assume online
    return true;
  }

  /**
   * Set up event listeners for online/offline events
   */
  setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    this.notifyListeners(true);
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    this.notifyListeners(false);
  }

  /**
   * Subscribe to network status changes
   * @param {Function} callback - Called with boolean online status
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return function() {
      var index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }.bind(this);
  }

  /**
   * Notify all listeners of status change
   * @param {boolean} isOnline - Current online status
   */
  notifyListeners(isOnline) {
    this.listeners.forEach(function(listener) {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Get current online status
   * @returns {boolean} True if online
   */
  getStatus() {
    return this.isOnline;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (typeof window === 'undefined') return;

    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.listeners = [];
  }
}

// Create singleton instance
var networkStatus = new NetworkStatus();

module.exports = networkStatus;
