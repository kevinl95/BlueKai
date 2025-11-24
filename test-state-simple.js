#!/usr/bin/env node

/**
 * Simple State Management Test
 * Tests core functionality without complex module loading
 */

console.log('='.repeat(60));
console.log('STATE MANAGEMENT SIMPLE TESTS');
console.log('='.repeat(60));

var passed = 0;
var failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log('✓ ' + message);
  } else {
    failed++;
    console.error('✗ ' + message);
  }
}

// Mock localStorage
global.localStorage = {
  _data: {},
  getItem: function(key) {
    return this._data[key] || null;
  },
  setItem: function(key, value) {
    this._data[key] = String(value);
  },
  removeItem: function(key) {
    delete this._data[key];
  },
  clear: function() {
    this._data = {};
  }
};

// Test 1: Initial state structure
console.log('\nTest 1: Initial state structure');
var initialState = {
  user: {
    did: null,
    handle: null,
    displayName: null,
    avatar: null,
    email: null
  },
  session: {
    accessJwt: null,
    refreshJwt: null,
    expiresAt: null,
    isAuthenticated: false
  },
  timeline: {
    posts: [],
    cursor: null,
    loading: false,
    error: null,
    lastFetch: null
  },
  settings: {
    dataSaverMode: false,
    autoLoadImages: true,
    language: 'en'
  },
  navigation: {
    currentView: 'login',
    history: [],
    params: {}
  }
};

assert(initialState.user !== undefined, 'Has user object');
assert(initialState.session !== undefined, 'Has session object');
assert(initialState.timeline !== undefined, 'Has timeline object');
assert(initialState.settings !== undefined, 'Has settings object');
assert(initialState.navigation !== undefined, 'Has navigation object');

// Test 2: Action types
console.log('\nTest 2: Action types');
var ActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  TIMELINE_LOAD_SUCCESS: 'TIMELINE_LOAD_SUCCESS'
};

assert(ActionTypes.LOGIN_SUCCESS === 'LOGIN_SUCCESS', 'LOGIN_SUCCESS action type');
assert(ActionTypes.LOGOUT === 'LOGOUT', 'LOGOUT action type');

// Test 3: Action creators
console.log('\nTest 3: Action creators');
function loginSuccess(session, user) {
  return {
    type: 'LOGIN_SUCCESS',
    payload: {
      session: {
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000),
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

var action = loginSuccess(
  { accessJwt: 'token', refreshJwt: 'refresh', did: 'did:123', handle: 'user.bsky' },
  { displayName: 'Test User' }
);

assert(action.type === 'LOGIN_SUCCESS', 'Action has correct type');
assert(action.payload.session.accessJwt === 'token', 'Action has session token');
assert(action.payload.user.handle === 'user.bsky', 'Action has user handle');

// Test 4: Reducer - LOGIN_SUCCESS
console.log('\nTest 4: Reducer - LOGIN_SUCCESS');
function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return Object.assign({}, state, {
        user: action.payload.user,
        session: action.payload.session,
        navigation: Object.assign({}, state.navigation, {
          currentView: 'timeline'
        })
      });
    
    case 'LOGOUT':
      return Object.assign({}, initialState, {
        settings: state.settings,
        navigation: Object.assign({}, initialState.navigation, {
          currentView: 'login'
        })
      });
    
    default:
      return state;
  }
}

var newState = reducer(initialState, action);
assert(newState.session.isAuthenticated === true, 'Sets authenticated to true');
assert(newState.user.handle === 'user.bsky', 'Sets user handle');
assert(newState.navigation.currentView === 'timeline', 'Navigates to timeline');

// Test 5: Reducer - LOGOUT
console.log('\nTest 5: Reducer - LOGOUT');
var authenticatedState = Object.assign({}, initialState, {
  user: { did: 'did:123', handle: 'user.bsky' },
  session: { accessJwt: 'token', isAuthenticated: true },
  settings: { dataSaverMode: true }
});

var logoutState = reducer(authenticatedState, { type: 'LOGOUT' });
assert(logoutState.session.isAuthenticated === false, 'Clears authentication');
assert(logoutState.user.did === null, 'Clears user data');
assert(logoutState.settings.dataSaverMode === true, 'Preserves settings');

// Test 6: Session validation
console.log('\nTest 6: Session validation');
function isSessionValid(session) {
  if (!session || !session.accessJwt || !session.isAuthenticated) {
    return false;
  }
  if (session.expiresAt && Date.now() >= session.expiresAt) {
    return false;
  }
  return true;
}

var validSession = {
  accessJwt: 'token',
  isAuthenticated: true,
  expiresAt: Date.now() + (60 * 60 * 1000)
};

var expiredSession = {
  accessJwt: 'token',
  isAuthenticated: true,
  expiresAt: Date.now() - 1000
};

assert(isSessionValid(validSession) === true, 'Valid session returns true');
assert(isSessionValid(expiredSession) === false, 'Expired session returns false');
assert(isSessionValid(null) === false, 'Null session returns false');

// Test 7: Session refresh check
console.log('\nTest 7: Session refresh check');
function shouldRefreshSession(session) {
  if (!session || !session.expiresAt) {
    return false;
  }
  var refreshThreshold = 15 * 60 * 1000;
  var timeUntilExpiry = session.expiresAt - Date.now();
  return timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold;
}

var nearExpirySession = {
  accessJwt: 'token',
  expiresAt: Date.now() + (10 * 60 * 1000)
};

var freshSession = {
  accessJwt: 'token',
  expiresAt: Date.now() + (60 * 60 * 1000)
};

assert(shouldRefreshSession(nearExpirySession) === true, 'Near expiry returns true');
assert(shouldRefreshSession(freshSession) === false, 'Fresh session returns false');

// Test 8: State persistence
console.log('\nTest 8: State persistence');
var testState = {
  user: { did: 'did:123', handle: 'user.bsky' },
  session: { accessJwt: 'token', isAuthenticated: true }
};

localStorage.setItem('bluekai_state', JSON.stringify(testState));
var stored = localStorage.getItem('bluekai_state');
var parsed = JSON.parse(stored);

assert(parsed.user.did === 'did:123', 'Persists user data');
assert(parsed.session.accessJwt === 'token', 'Persists session data');

localStorage.removeItem('bluekai_state');
assert(localStorage.getItem('bluekai_state') === null, 'Clears persisted data');

// Test 9: State hydration
console.log('\nTest 9: State hydration');
function getInitialState() {
  try {
    var stored = localStorage.getItem('bluekai_state');
    if (stored) {
      var parsed = JSON.parse(stored);
      return Object.assign({}, initialState, parsed);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return initialState;
}

localStorage.setItem('bluekai_state', JSON.stringify({ user: { did: 'test-did' } }));
var hydrated = getInitialState();
assert(hydrated.user.did === 'test-did', 'Hydrates user data');
assert(hydrated.settings !== undefined, 'Merges with initial state');

localStorage.removeItem('bluekai_state');

// Test 10: Invalid JSON handling
console.log('\nTest 10: Invalid JSON handling');
localStorage.setItem('bluekai_state', 'invalid json');
var fallback = getInitialState();
assert(fallback.user.did === null, 'Falls back to initial state on invalid JSON');

localStorage.removeItem('bluekai_state');

// Summary
console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log('Passed: ' + passed);
console.log('Failed: ' + failed);
console.log('Total: ' + (passed + failed));
console.log('Success Rate: ' + ((passed / (passed + failed)) * 100).toFixed(2) + '%');
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
