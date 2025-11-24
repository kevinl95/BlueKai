/**
 * Tests for App State Structure and Context
 * Compatible with Gecko 48 (ES5)
 */

var appState = require('./app-state');

/**
 * Test Suite for App State
 */
function runAppStateTests() {
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
  
  console.log('\n=== App State Tests ===\n');
  
  // Test 1: Initial state structure
  console.log('Test 1: Initial state has correct structure');
  var initial = appState.initialState;
  assert(initial.user !== undefined, 'Initial state has user object');
  assert(initial.session !== undefined, 'Initial state has session object');
  assert(initial.timeline !== undefined, 'Initial state has timeline object');
  assert(initial.settings !== undefined, 'Initial state has settings object');
  assert(initial.navigation !== undefined, 'Initial state has navigation object');
  
  // Test 2: User state structure
  console.log('\nTest 2: User state has correct fields');
  assert(initial.user.did === null, 'User did is null initially');
  assert(initial.user.handle === null, 'User handle is null initially');
  assert(initial.user.displayName === null, 'User displayName is null initially');
  assert(initial.user.avatar === null, 'User avatar is null initially');
  
  // Test 3: Session state structure
  console.log('\nTest 3: Session state has correct fields');
  assert(initial.session.accessJwt === null, 'Session accessJwt is null initially');
  assert(initial.session.refreshJwt === null, 'Session refreshJwt is null initially');
  assert(initial.session.expiresAt === null, 'Session expiresAt is null initially');
  assert(initial.session.isAuthenticated === false, 'Session isAuthenticated is false initially');
  
  // Test 4: Timeline state structure
  console.log('\nTest 4: Timeline state has correct fields');
  assert(Array.isArray(initial.timeline.posts), 'Timeline posts is an array');
  assert(initial.timeline.posts.length === 0, 'Timeline posts is empty initially');
  assert(initial.timeline.cursor === null, 'Timeline cursor is null initially');
  assert(initial.timeline.loading === false, 'Timeline loading is false initially');
  assert(initial.timeline.error === null, 'Timeline error is null initially');
  
  // Test 5: Settings state structure
  console.log('\nTest 5: Settings state has correct fields');
  assert(initial.settings.dataSaverMode === false, 'Data saver mode is false by default');
  assert(initial.settings.autoLoadImages === true, 'Auto load images is true by default');
  assert(initial.settings.language === 'en', 'Language is en by default');
  
  // Test 6: Navigation state structure
  console.log('\nTest 6: Navigation state has correct fields');
  assert(initial.navigation.currentView === 'login', 'Current view is login initially');
  assert(Array.isArray(initial.navigation.history), 'Navigation history is an array');
  assert(initial.navigation.history.length === 0, 'Navigation history is empty initially');
  
  // Test 7: State hydration from localStorage
  console.log('\nTest 7: State hydration from localStorage');
  // Save test state
  var testState = {
    user: { did: 'test-did', handle: 'test.handle' },
    session: { accessJwt: 'test-token', isAuthenticated: true }
  };
  localStorage.setItem('bluekai_state', JSON.stringify(testState));
  
  var hydrated = appState.getInitialState();
  assert(hydrated.user.did === 'test-did', 'Hydrated state has correct user did');
  assert(hydrated.user.handle === 'test.handle', 'Hydrated state has correct user handle');
  assert(hydrated.session.accessJwt === 'test-token', 'Hydrated state has correct session token');
  assert(hydrated.session.isAuthenticated === true, 'Hydrated state has correct auth status');
  
  // Clean up
  localStorage.removeItem('bluekai_state');
  
  // Test 8: State hydration with invalid data
  console.log('\nTest 8: State hydration handles invalid data');
  localStorage.setItem('bluekai_state', 'invalid json');
  var fallback = appState.getInitialState();
  assert(fallback.user.did === null, 'Falls back to initial state on invalid JSON');
  localStorage.removeItem('bluekai_state');
  
  // Test 9: State hydration merges with initial state
  console.log('\nTest 9: State hydration merges with initial state');
  var partialState = {
    user: { did: 'test-did' }
  };
  localStorage.setItem('bluekai_state', JSON.stringify(partialState));
  var merged = appState.getInitialState();
  assert(merged.user.did === 'test-did', 'Merged state has stored user did');
  assert(merged.settings !== undefined, 'Merged state has default settings');
  assert(merged.timeline !== undefined, 'Merged state has default timeline');
  localStorage.removeItem('bluekai_state');
  
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
    runAppStateTests: runAppStateTests
  };
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  runAppStateTests();
}
