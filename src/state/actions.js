/**
 * Action Types and Action Creators
 * Defines all state actions for the application
 * Compatible with Gecko 48 (ES5 transpiled)
 * 
 * Requirements: 5.3, 5.4, 5.6
 */

/**
 * Action Types
 */
var ActionTypes = {
  // Authentication actions
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_SESSION: 'REFRESH_SESSION',
  
  // Timeline actions
  TIMELINE_LOAD_START: 'TIMELINE_LOAD_START',
  TIMELINE_LOAD_SUCCESS: 'TIMELINE_LOAD_SUCCESS',
  TIMELINE_LOAD_FAILURE: 'TIMELINE_LOAD_FAILURE',
  TIMELINE_APPEND: 'TIMELINE_APPEND',
  TIMELINE_CLEAR: 'TIMELINE_CLEAR',
  TIMELINE_UPDATE_POST: 'TIMELINE_UPDATE_POST',
  
  // Navigation actions
  NAVIGATE: 'NAVIGATE',
  NAVIGATE_BACK: 'NAVIGATE_BACK',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  TOGGLE_DATA_SAVER: 'TOGGLE_DATA_SAVER',
  
  // User actions
  UPDATE_USER: 'UPDATE_USER',
  
  // Network actions
  NETWORK_STATUS_CHANGE: 'NETWORK_STATUS_CHANGE',
  ADD_RETRY_REQUEST: 'ADD_RETRY_REQUEST',
  CLEAR_RETRY_QUEUE: 'CLEAR_RETRY_QUEUE'
};

/**
 * Action Creators
 */

/**
 * Login success action
 * Requirements: 5.3 - Store session token locally
 * 
 * @param {Object} session - Session data from ATP API
 * @param {Object} user - User data
 */
function loginSuccess(session, user) {
  return {
    type: ActionTypes.LOGIN_SUCCESS,
    payload: {
      session: {
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
        isAuthenticated: true
      },
      user: {
        did: session.did || user.did,
        handle: session.handle || user.handle,
        displayName: user.displayName || null,
        avatar: user.avatar || null,
        email: session.email || user.email || null
      }
    }
  };
}

/**
 * Login failure action
 * 
 * @param {string} error - Error message
 */
function loginFailure(error) {
  return {
    type: ActionTypes.LOGIN_FAILURE,
    payload: { error: error }
  };
}

/**
 * Logout action
 * Requirements: 5.6 - Clear all stored credentials and session data
 */
function logout() {
  return {
    type: ActionTypes.LOGOUT
  };
}

/**
 * Refresh session action
 * Requirements: 5.5 - Automatic session refresh
 * 
 * @param {Object} session - New session data
 */
function refreshSession(session) {
  return {
    type: ActionTypes.REFRESH_SESSION,
    payload: {
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      expiresAt: Date.now() + (2 * 60 * 60 * 1000)
    }
  };
}

/**
 * Timeline load start action
 */
function timelineLoadStart() {
  return {
    type: ActionTypes.TIMELINE_LOAD_START
  };
}

/**
 * Timeline load success action
 * 
 * @param {Array} posts - Array of posts
 * @param {string} cursor - Pagination cursor
 */
function timelineLoadSuccess(posts, cursor) {
  return {
    type: ActionTypes.TIMELINE_LOAD_SUCCESS,
    payload: {
      posts: posts,
      cursor: cursor,
      lastFetch: Date.now()
    }
  };
}

/**
 * Timeline load failure action
 * 
 * @param {string} error - Error message
 */
function timelineLoadFailure(error) {
  return {
    type: ActionTypes.TIMELINE_LOAD_FAILURE,
    payload: { error: error }
  };
}

/**
 * Append posts to timeline (for pagination)
 * 
 * @param {Array} posts - Array of posts to append
 * @param {string} cursor - New pagination cursor
 */
function timelineAppend(posts, cursor) {
  return {
    type: ActionTypes.TIMELINE_APPEND,
    payload: {
      posts: posts,
      cursor: cursor
    }
  };
}

/**
 * Clear timeline
 */
function timelineClear() {
  return {
    type: ActionTypes.TIMELINE_CLEAR
  };
}

/**
 * Update a single post in timeline (for like/repost updates)
 * 
 * @param {string} uri - Post URI
 * @param {Object} updates - Updates to apply
 */
function timelineUpdatePost(uri, updates) {
  return {
    type: ActionTypes.TIMELINE_UPDATE_POST,
    payload: {
      uri: uri,
      updates: updates
    }
  };
}

/**
 * Navigate to a view
 * 
 * @param {string} view - View name
 * @param {Object} params - Optional navigation parameters
 */
function navigate(view, params) {
  return {
    type: ActionTypes.NAVIGATE,
    payload: {
      view: view,
      params: params || {}
    }
  };
}

/**
 * Navigate back
 */
function navigateBack() {
  return {
    type: ActionTypes.NAVIGATE_BACK
  };
}

/**
 * Update settings
 * 
 * @param {Object} settings - Settings to update
 */
function updateSettings(settings) {
  return {
    type: ActionTypes.UPDATE_SETTINGS,
    payload: settings
  };
}

/**
 * Toggle data saver mode
 */
function toggleDataSaver() {
  return {
    type: ActionTypes.TOGGLE_DATA_SAVER
  };
}

/**
 * Update user profile
 * 
 * @param {Object} user - User data to update
 */
function updateUser(user) {
  return {
    type: ActionTypes.UPDATE_USER,
    payload: user
  };
}

/**
 * Network status change action
 * Requirements: 6.1 - Add network status to app state
 * 
 * @param {boolean} isOnline - Online status
 */
function networkStatusChange(isOnline) {
  return {
    type: ActionTypes.NETWORK_STATUS_CHANGE,
    payload: {
      isOnline: isOnline,
      lastOnlineAt: isOnline ? Date.now() : null
    }
  };
}

/**
 * Add request to retry queue
 * Requirements: 6.4 - Automatic retry when connection restored
 * 
 * @param {Object} request - Request to retry
 */
function addRetryRequest(request) {
  return {
    type: ActionTypes.ADD_RETRY_REQUEST,
    payload: request
  };
}

/**
 * Clear retry queue
 */
function clearRetryQueue() {
  return {
    type: ActionTypes.CLEAR_RETRY_QUEUE
  };
}

/**
 * Export action types and creators
 */
export {
  ActionTypes,
  loginSuccess,
  loginFailure,
  logout,
  refreshSession,
  timelineLoadStart,
  timelineLoadSuccess,
  timelineLoadFailure,
  timelineAppend,
  timelineClear,
  timelineUpdatePost,
  navigate,
  navigateBack,
  updateSettings,
  toggleDataSaver,
  updateUser,
  networkStatusChange,
  addRetryRequest,
  clearRetryQueue
};
