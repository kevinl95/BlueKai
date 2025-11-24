/**
 * Session Management Logic
 * Handles session validation, refresh, and expiration
 * Compatible with Gecko 48 (ES5 transpiled)
 * 
 * Requirements: 5.4, 5.5, 5.6
 */

var actions = require('./actions');

/**
 * Session Manager
 * Provides utilities for managing user sessions
 */
var SessionManager = {
  /**
   * Check if session is valid
   * Requirements: 5.4 - Validate session on app start
   * 
   * @param {Object} session - Session object from state
   * @returns {boolean} True if session is valid
   */
  isSessionValid: function(session) {
    if (!session || !session.accessJwt || !session.isAuthenticated) {
      return false;
    }
    
    // Check if session has expired
    if (session.expiresAt && Date.now() >= session.expiresAt) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Check if session needs refresh
   * Requirements: 5.5 - Automatic session refresh
   * 
   * @param {Object} session - Session object from state
   * @returns {boolean} True if session should be refreshed
   */
  shouldRefreshSession: function(session) {
    if (!session || !session.expiresAt) {
      return false;
    }
    
    // Refresh if within 15 minutes of expiration
    var refreshThreshold = 15 * 60 * 1000; // 15 minutes
    var timeUntilExpiry = session.expiresAt - Date.now();
    
    return timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold;
  },
  
  /**
   * Validate and restore session on app start
   * Requirements: 5.4 - Automatically restore previous session if valid
   * 
   * @param {Object} state - Current app state
   * @param {Function} dispatch - Dispatch function
   * @param {Object} atpClient - ATP client instance
   * @returns {Promise<boolean>} True if session was restored
   */
  validateAndRestoreSession: function(state, dispatch, atpClient) {
    return new Promise(function(resolve) {
      var session = state.session;
      
      // Check if session exists and is valid
      if (!SessionManager.isSessionValid(session)) {
        console.log('No valid session found');
        resolve(false);
        return;
      }
      
      // Set the session in ATP client
      atpClient.setSession(session);
      
      // Check if session needs refresh
      if (SessionManager.shouldRefreshSession(session)) {
        console.log('Session needs refresh');
        SessionManager.refreshSession(session, dispatch, atpClient)
          .then(function(success) {
            resolve(success);
          })
          .catch(function(error) {
            console.error('Session refresh failed:', error);
            // Session is still valid even if refresh fails
            resolve(true);
          });
      } else {
        console.log('Session is valid');
        resolve(true);
      }
    });
  },
  
  /**
   * Refresh session using refresh token
   * Requirements: 5.5 - Automatic session refresh
   * 
   * @param {Object} session - Current session
   * @param {Function} dispatch - Dispatch function
   * @param {Object} atpClient - ATP client instance
   * @returns {Promise<boolean>} True if refresh succeeded
   */
  refreshSession: function(session, dispatch, atpClient) {
    if (!session || !session.refreshJwt) {
      return Promise.reject(new Error('No refresh token available'));
    }
    
    return atpClient.refreshSession()
      .then(function(newSession) {
        dispatch(actions.refreshSession(newSession));
        return true;
      })
      .catch(function(error) {
        console.error('Failed to refresh session:', error);
        // If refresh fails, logout
        SessionManager.logout(dispatch, atpClient);
        return false;
      });
  },
  
  /**
   * Logout and clear session
   * Requirements: 5.6 - Clear all stored credentials and session data
   * 
   * @param {Function} dispatch - Dispatch function
   * @param {Object} atpClient - ATP client instance (optional)
   */
  logout: function(dispatch, atpClient) {
    // Clear session from ATP client
    if (atpClient) {
      atpClient.clearSession();
    }
    
    // Clear stored state
    try {
      localStorage.removeItem('bluekai_state');
    } catch (e) {
      console.error('Failed to clear stored state:', e);
    }
    
    // Dispatch logout action
    dispatch(actions.logout());
  },
  
  /**
   * Handle session expiration
   * Requirements: 5.5 - Prompt user to log in again if session expires
   * 
   * @param {Function} dispatch - Dispatch function
   * @param {Object} atpClient - ATP client instance
   */
  handleSessionExpiration: function(dispatch, atpClient) {
    console.log('Session expired');
    SessionManager.logout(dispatch, atpClient);
  },
  
  /**
   * Start automatic session refresh timer
   * Requirements: 5.5 - Automatic session refresh
   * 
   * @param {Object} state - Current app state
   * @param {Function} dispatch - Dispatch function
   * @param {Object} atpClient - ATP client instance
   * @returns {number} Timer ID
   */
  startSessionRefreshTimer: function(state, dispatch, atpClient) {
    // Check every 5 minutes
    var checkInterval = 5 * 60 * 1000;
    
    var timerId = setInterval(function() {
      var session = state.session;
      
      if (!SessionManager.isSessionValid(session)) {
        SessionManager.handleSessionExpiration(dispatch, atpClient);
        clearInterval(timerId);
        return;
      }
      
      if (SessionManager.shouldRefreshSession(session)) {
        SessionManager.refreshSession(session, dispatch, atpClient);
      }
    }, checkInterval);
    
    return timerId;
  },
  
  /**
   * Stop session refresh timer
   * 
   * @param {number} timerId - Timer ID to clear
   */
  stopSessionRefreshTimer: function(timerId) {
    if (timerId) {
      clearInterval(timerId);
    }
  }
};

/**
 * Export session manager
 */
module.exports = {
  SessionManager: SessionManager
};
