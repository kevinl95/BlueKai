/**
 * Tests for Session Manager
 * Compatible with Gecko 48 (ES5)
 */

var SessionManager = require('./session-manager').SessionManager;
var actions = require('./actions');

/**
 * Test Suite for Session Manager
 */
function runSessionManagerTests() {
  var results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function assert(condition, message) {
    if (condition) {
      results.passed++;
      results.tests.push({ name: message, status: 'PASS' });
      console.log('✓ ' + message);
    } else {
      results.failed++;
      results.tests.push({ name: message, status: 'FAIL' });
      console.error('✗ ' + message);
    }
  }
  
  console.log('\n=== Session Manager Tests ===\n');
  
  // Test 1: Valid session check
  console.log('Test 1: isSessionValid with valid session');
  var validSession = {
    accessJwt: 'token123',
    refreshJwt: 'refresh123',
    isAuthenticated: true,
    expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour from now
  };
  assert(SessionManager.isSessionValid(validSession) === true, 'Returns true for valid session');
  
  // Test 2: Invalid session - no token
  console.log('\nTest 2: isSessionValid with no token');
  var noTokenSession = {
    accessJwt: null,
    isAuthenticated: false
  };
  assert(SessionManager.isSessionValid(noTokenSession) === false, 'Returns false for session without token');
  
  // Test 3: Invalid session - expired
  console.log('\nTest 3: isSessionValid with expired session');
  var expiredSession = {
    accessJwt: 'token123',
    refreshJwt: 'refresh123',
    isAuthenticated: true,
    expiresAt: Date.now() - 1000 // 1 second ago
  };
  assert(SessionManager.isSessionValid(expiredSession) === false, 'Returns false for expired session');
  
  // Test 4: Invalid session - not authenticated
  console.log('\nTest 4: isSessionValid with unauthenticated session');
  var unauthSession = {
    accessJwt: 'token123',
    isAuthenticated: false,
    expiresAt: Date.now() + (60 * 60 * 1000)
  };
  assert(SessionManager.isSessionValid(unauthSession) === false, 'Returns false for unauthenticated session');
  
  // Test 5: Should refresh - near expiration
  console.log('\nTest 5: shouldRefreshSession near expiration');
  var nearExpirySession = {
    accessJwt: 'token123',
    expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes from now
  };
  assert(SessionManager.shouldRefreshSession(nearExpirySession) === true, 'Returns true when near expiration');
  
  // Test 6: Should not refresh - plenty of time
  console.log('\nTest 6: shouldRefreshSession with plenty of time');
  var freshSession = {
    accessJwt: 'token123',
    expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour from now
  };
  assert(SessionManager.shouldRefreshSession(freshSession) === false, 'Returns false when not near expiration');
  
  // Test 7: Should not refresh - already expired
  console.log('\nTest 7: shouldRefreshSession with expired session');
  assert(SessionManager.shouldRefreshSession(expiredSession) === false, 'Returns false for expired session');
  
  // Test 8: Should not refresh - no expiration time
  console.log('\nTest 8: shouldRefreshSession with no expiration time');
  var noExpirySession = {
    accessJwt: 'token123'
  };
  assert(SessionManager.shouldRefreshSession(noExpirySession) === false, 'Returns false when no expiration time');
  
  // Test 9: Logout clears storage
  console.log('\nTest 9: logout clears storage');
  localStorage.setItem('bluekai_state', JSON.stringify({ test: 'data' }));
  var dispatchCalls = [];
  var mockDispatch = function(action) {
    dispatchCalls.push(action);
  };
  var mockClient = {
    clearSession: function() {}
  };
  
  SessionManager.logout(mockDispatch, mockClient);
  assert(localStorage.getItem('bluekai_state') === null, 'Clears localStorage');
  assert(dispatchCalls.length === 1, 'Dispatches logout action');
  assert(dispatchCalls[0].type === 'LOGOUT', 'Dispatches correct action type');
  
  // Test 10: Validate and restore valid session
  console.log('\nTest 10: validateAndRestoreSession with valid session');
  var mockState = {
    session: validSession
  };
  var mockAtpClient = {
    setSession: function(session) {
      this.session = session;
    }
  };
  
  SessionManager.validateAndRestoreSession(mockState, mockDispatch, mockAtpClient)
    .then(function(result) {
      assert(result === true, 'Returns true for valid session');
      assert(mockAtpClient.session !== undefined, 'Sets session in ATP client');
    });
  
  // Test 11: Validate and restore invalid session
  console.log('\nTest 11: validateAndRestoreSession with invalid session');
  var mockStateInvalid = {
    session: noTokenSession
  };
  
  SessionManager.validateAndRestoreSession(mockStateInvalid, mockDispatch, mockAtpClient)
    .then(function(result) {
      assert(result === false, 'Returns false for invalid session');
    });
  
  // Test 12: Refresh session success
  console.log('\nTest 12: refreshSession success');
  var refreshDispatchCalls = [];
  var mockRefreshDispatch = function(action) {
    refreshDispatchCalls.push(action);
  };
  var mockRefreshClient = {
    refreshSession: function() {
      return Promise.resolve({
        accessJwt: 'newtoken',
        refreshJwt: 'newrefresh'
      });
    }
  };
  
  SessionManager.refreshSession(validSession, mockRefreshDispatch, mockRefreshClient)
    .then(function(result) {
      assert(result === true, 'Returns true on success');
      assert(refreshDispatchCalls.length === 1, 'Dispatches refresh action');
      assert(refreshDispatchCalls[0].type === 'REFRESH_SESSION', 'Dispatches correct action type');
    });
  
  // Test 13: Refresh session failure
  console.log('\nTest 13: refreshSession failure');
  var failDispatchCalls = [];
  var mockFailDispatch = function(action) {
    failDispatchCalls.push(action);
  };
  var mockFailClient = {
    refreshSession: function() {
      return Promise.reject(new Error('Refresh failed'));
    },
    clearSession: function() {}
  };
  
  SessionManager.refreshSession(validSession, mockFailDispatch, mockFailClient)
    .then(function(result) {
      assert(result === false, 'Returns false on failure');
      // Should trigger logout
      setTimeout(function() {
        assert(failDispatchCalls.length > 0, 'Dispatches logout on failure');
      }, 100);
    });
  
  // Test 14: Handle session expiration
  console.log('\nTest 14: handleSessionExpiration');
  var expireDispatchCalls = [];
  var mockExpireDispatch = function(action) {
    expireDispatchCalls.push(action);
  };
  
  SessionManager.handleSessionExpiration(mockExpireDispatch, mockClient);
  assert(expireDispatchCalls.length === 1, 'Dispatches logout action');
  assert(expireDispatchCalls[0].type === 'LOGOUT', 'Dispatches logout action type');
  
  // Test 15: Start and stop session refresh timer
  console.log('\nTest 15: Session refresh timer');
  var timerState = {
    session: validSession
  };
  var timerId = SessionManager.startSessionRefreshTimer(timerState, mockDispatch, mockAtpClient);
  assert(typeof timerId === 'number', 'Returns timer ID');
  
  SessionManager.stopSessionRefreshTimer(timerId);
  assert(true, 'Timer stopped without error');
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log('Passed: ' + results.passed);
  console.log('Failed: ' + results.failed);
  console.log('Total: ' + (results.passed + results.failed));
  
  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runSessionManagerTests: runSessionManagerTests
  };
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  runSessionManagerTests();
}
