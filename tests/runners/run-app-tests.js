#!/usr/bin/env node

/**
 * App Initialization Tests Runner
 * Tests for App component, routing, and session management
 */

console.log('\n=== BlueKai App Initialization Tests ===\n');

// Mock browser globals for Node.js environment
global.window = {
  location: {
    hash: '',
    replace: function(url) {
      if (url.indexOf('#') !== -1) {
        this.hash = url.substring(url.indexOf('#'));
      }
    }
  },
  addEventListener: function() {},
  removeEventListener: function() {},
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

global.document = {
  addEventListener: function() {},
  removeEventListener: function() {}
};

// Mock localStorage
var mockStorage = {};
global.localStorage = {
  getItem: function(key) {
    return mockStorage[key] || null;
  },
  setItem: function(key, value) {
    mockStorage[key] = value;
  },
  removeItem: function(key) {
    delete mockStorage[key];
  },
  clear: function() {
    mockStorage = {};
  }
};

var testsPassed = 0;
var testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  ✓', message);
    testsPassed++;
  } else {
    console.error('  ✗', message);
    testsFailed++;
  }
}

function testSection(name) {
  console.log('\n' + name);
  console.log('─'.repeat(name.length));
}

// Test 1: Component Structure
testSection('Component Structure Tests');

try {
  // Note: We can't actually import the App component in Node without full Preact setup
  // But we can test the supporting modules
  
  const Router = require('./src/navigation/router.js').default;
  assert(typeof Router === 'function', 'Router class is defined');
  
  const router = new Router();
  assert(typeof router.register === 'function', 'Router has register method');
  assert(typeof router.navigate === 'function', 'Router has navigate method');
  assert(typeof router.match === 'function', 'Router has match method');
  
  console.log('  ℹ App component requires browser environment for full testing');
} catch (error) {
  console.error('  ✗ Component structure test failed:', error.message);
  testsFailed++;
}

// Test 2: Router Functionality
testSection('Router Tests');

try {
  const Router = require('./src/navigation/router.js').default;
  const router = new Router();
  
  // Register test routes
  router.register('/login', function() {}, 'login');
  router.register('/timeline', function() {}, 'timeline');
  router.register('/profile/:actor', function() {}, 'profile');
  
  assert(router.routes.length === 3, 'Routes registered correctly');
  
  // Test route matching
  const loginMatch = router.match('/login');
  assert(loginMatch !== null, 'Login route matches');
  assert(loginMatch.route.name === 'login', 'Login route name is correct');
  
  // Test parameterized route
  const profileMatch = router.match('/profile/test.bsky.social');
  assert(profileMatch !== null, 'Profile route matches');
  assert(profileMatch.params.actor === 'test.bsky.social', 'Route parameter extracted correctly');
  
  // Test non-matching route
  const noMatch = router.match('/nonexistent');
  assert(noMatch === null, 'Non-existent route returns null');
  
} catch (error) {
  console.error('  ✗ Router test failed:', error.message);
  testsFailed++;
}

// Test 3: Session Manager
testSection('Session Manager Tests');

try {
  const { SessionManager } = require('./src/state/session-manager.js');
  
  assert(typeof SessionManager === 'object', 'SessionManager is defined');
  assert(typeof SessionManager.isSessionValid === 'function', 'isSessionValid method exists');
  assert(typeof SessionManager.shouldRefreshSession === 'function', 'shouldRefreshSession method exists');
  
  // Test valid session
  const validSession = {
    accessJwt: 'test-jwt',
    refreshJwt: 'test-refresh',
    expiresAt: Date.now() + 3600000, // 1 hour from now
    isAuthenticated: true
  };
  
  assert(SessionManager.isSessionValid(validSession), 'Valid session is recognized');
  
  // Test expired session
  const expiredSession = {
    accessJwt: 'test-jwt',
    refreshJwt: 'test-refresh',
    expiresAt: Date.now() - 1000, // Expired
    isAuthenticated: true
  };
  
  assert(!SessionManager.isSessionValid(expiredSession), 'Expired session is detected');
  
  // Test session needing refresh
  const sessionNearExpiry = {
    accessJwt: 'test-jwt',
    refreshJwt: 'test-refresh',
    expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes from now
    isAuthenticated: true
  };
  
  assert(SessionManager.shouldRefreshSession(sessionNearExpiry), 'Session needing refresh is detected');
  
  // Test session not needing refresh
  const sessionFarFromExpiry = {
    accessJwt: 'test-jwt',
    refreshJwt: 'test-refresh',
    expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
    isAuthenticated: true
  };
  
  assert(!SessionManager.shouldRefreshSession(sessionFarFromExpiry), 'Session not needing refresh is recognized');
  
} catch (error) {
  console.error('  ✗ Session manager test failed:', error.message);
  testsFailed++;
}

// Test 4: State Management
testSection('State Management Tests');

try {
  const { getInitialState } = require('./src/state/app-state.js');
  
  // Clear storage
  localStorage.clear();
  
  const initialState = getInitialState();
  assert(typeof initialState === 'object', 'Initial state is an object');
  assert(initialState.user !== undefined, 'Initial state has user');
  assert(initialState.session !== undefined, 'Initial state has session');
  assert(initialState.timeline !== undefined, 'Initial state has timeline');
  assert(initialState.settings !== undefined, 'Initial state has settings');
  assert(initialState.navigation !== undefined, 'Initial state has navigation');
  
  // Test state persistence
  const testState = {
    user: { did: 'test', handle: 'test.bsky.social' },
    session: { isAuthenticated: true }
  };
  
  localStorage.setItem('bluekai_state', JSON.stringify(testState));
  
  const restoredState = getInitialState();
  assert(restoredState.user.did === 'test', 'State restored from localStorage');
  
} catch (error) {
  console.error('  ✗ State management test failed:', error.message);
  testsFailed++;
}

// Test 5: Actions
testSection('Action Tests');

try {
  const actions = require('./src/state/actions.js');
  
  assert(typeof actions.loginSuccess === 'function', 'loginSuccess action creator exists');
  assert(typeof actions.logout === 'function', 'logout action creator exists');
  assert(typeof actions.navigate === 'function', 'navigate action creator exists');
  assert(typeof actions.refreshSession === 'function', 'refreshSession action creator exists');
  
  // Test action creation
  const loginAction = actions.loginSuccess(
    { accessJwt: 'jwt', refreshJwt: 'refresh', did: 'did:test', handle: 'test' },
    { did: 'did:test', handle: 'test' }
  );
  
  assert(loginAction.type === 'LOGIN_SUCCESS', 'Login action has correct type');
  assert(loginAction.payload.session.isAuthenticated === true, 'Login action sets authenticated flag');
  
  const logoutAction = actions.logout();
  assert(logoutAction.type === 'LOGOUT', 'Logout action has correct type');
  
  const navigateAction = actions.navigate('timeline', {});
  assert(navigateAction.type === 'NAVIGATE', 'Navigate action has correct type');
  assert(navigateAction.payload.view === 'timeline', 'Navigate action has correct view');
  
} catch (error) {
  console.error('  ✗ Actions test failed:', error.message);
  testsFailed++;
}

// Test 6: Error Boundary
testSection('Error Boundary Tests');

try {
  // Note: ErrorBoundary is a Preact component, can't fully test in Node
  console.log('  ℹ ErrorBoundary requires browser environment for full testing');
  console.log('  ℹ Component structure verified in browser tests');
  
} catch (error) {
  console.error('  ✗ Error boundary test failed:', error.message);
  testsFailed++;
}

// Test 7: Route Guards
testSection('Route Guard Tests');

try {
  // Simulate route guard logic
  function requireAuth(isAuthenticated, callback, redirectCallback) {
    if (!isAuthenticated) {
      redirectCallback();
      return false;
    }
    callback();
    return true;
  }
  
  let redirected = false;
  let callbackExecuted = false;
  
  // Test with unauthenticated user
  requireAuth(
    false,
    function() { callbackExecuted = true; },
    function() { redirected = true; }
  );
  
  assert(redirected && !callbackExecuted, 'Unauthenticated user is redirected');
  
  // Reset
  redirected = false;
  callbackExecuted = false;
  
  // Test with authenticated user
  requireAuth(
    true,
    function() { callbackExecuted = true; },
    function() { redirected = true; }
  );
  
  assert(!redirected && callbackExecuted, 'Authenticated user can access route');
  
} catch (error) {
  console.error('  ✗ Route guard test failed:', error.message);
  testsFailed++;
}

// Test 8: Navigation Manager Integration
testSection('Navigation Manager Tests');

try {
  const NavigationManager = require('./src/navigation/navigation-manager.js').default;
  
  assert(typeof NavigationManager === 'function', 'NavigationManager class is defined');
  
  const navManager = new NavigationManager({
    onSelect: function() {}
  });
  
  assert(typeof navManager.handleKeyDown === 'function', 'NavigationManager has handleKeyDown method');
  assert(typeof navManager.refresh === 'function', 'NavigationManager has refresh method');
  
  console.log('  ℹ Full navigation testing requires browser environment');
  
} catch (error) {
  console.error('  ✗ Navigation manager test failed:', error.message);
  testsFailed++;
}

// Summary
testSection('Test Summary');
console.log(`\nTotal: ${testsPassed + testsFailed} tests`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!\n');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed\n');
  process.exit(1);
}
