/**
 * App State Structure and Context
 * Defines the global application state and provides Preact context for state management
 * Compatible with Gecko 48 (ES5 transpiled)
 */

// Import Preact hooks
var h = require('preact').h;
var createContext = require('preact').createContext;
var useContext = require('preact').useContext;
var useReducer = require('preact').useReducer;
var useEffect = require('preact').useEffect;

/**
 * Initial state structure
 * Requirements: 5.3, 5.4
 */
var initialState = {
  // User information
  user: {
    did: null,
    handle: null,
    displayName: null,
    avatar: null,
    email: null
  },
  
  // Session data
  session: {
    accessJwt: null,
    refreshJwt: null,
    expiresAt: null,
    isAuthenticated: false
  },
  
  // Timeline state
  timeline: {
    posts: [],
    cursor: null,
    loading: false,
    error: null,
    lastFetch: null
  },
  
  // Application settings
  settings: {
    dataSaverMode: false,
    autoLoadImages: true,
    language: 'en'
  },
  
  // Navigation state
  navigation: {
    currentView: 'login',
    history: [],
    params: {}
  }
};

/**
 * Create the App State Context
 */
var AppStateContext = createContext(null);

/**
 * Get initial state with hydration from storage
 * Requirements: 5.4 - Restore session on app load
 */
function getInitialState() {
  try {
    var stored = localStorage.getItem('bluekai_state');
    if (stored) {
      var parsed = JSON.parse(stored);
      // Merge stored state with initial state to handle new fields
      return Object.assign({}, initialState, parsed, {
        // Reset loading states
        timeline: Object.assign({}, initialState.timeline, parsed.timeline || {}, {
          loading: false,
          error: null
        })
      });
    }
  } catch (e) {
    console.error('Failed to load state from storage:', e);
  }
  return initialState;
}

/**
 * Custom hook to consume app state
 * Requirements: 5.3, 5.4
 * 
 * @returns {Object} { state, dispatch }
 */
function useAppState() {
  var context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

/**
 * Export the context, initial state, and hooks
 */
module.exports = {
  AppStateContext: AppStateContext,
  initialState: initialState,
  getInitialState: getInitialState,
  useAppState: useAppState
};
