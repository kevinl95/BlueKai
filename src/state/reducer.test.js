/**
 * Tests for State Reducer
 * Compatible with Gecko 48 (ES5)
 */

var reducer = require('./reducer').reducer;
var actions = require('./actions');
var initialState = require('./app-state').initialState;

/**
 * Test Suite for Reducer
 */
function runReducerTests() {
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
  
  function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  
  console.log('\n=== Reducer Tests ===\n');
  
  // Test 1: Login success
  console.log('Test 1: LOGIN_SUCCESS action');
  var loginAction = actions.loginSuccess(
    { accessJwt: 'token123', refreshJwt: 'refresh123', did: 'did:123', handle: 'user.bsky' },
    { displayName: 'Test User', avatar: 'avatar.jpg' }
  );
  var state1 = reducer(initialState, loginAction);
  assert(state1.session.isAuthenticated === true, 'Sets isAuthenticated to true');
  assert(state1.session.accessJwt === 'token123', 'Sets access token');
  assert(state1.user.handle === 'user.bsky', 'Sets user handle');
  assert(state1.user.displayName === 'Test User', 'Sets user display name');
  assert(state1.navigation.currentView === 'timeline', 'Navigates to timeline');
  
  // Test 2: Login failure
  console.log('\nTest 2: LOGIN_FAILURE action');
  var failAction = actions.loginFailure('Invalid credentials');
  var state2 = reducer(initialState, failAction);
  assert(state2.session.error === 'Invalid credentials', 'Sets error message');
  assert(state2.session.isAuthenticated === false, 'Keeps isAuthenticated false');
  
  // Test 3: Logout
  console.log('\nTest 3: LOGOUT action');
  var authenticatedState = Object.assign({}, initialState, {
    user: { did: 'did:123', handle: 'user.bsky' },
    session: { accessJwt: 'token', isAuthenticated: true },
    settings: { dataSaverMode: true }
  });
  var state3 = reducer(authenticatedState, actions.logout());
  assert(state3.session.isAuthenticated === false, 'Clears authentication');
  assert(state3.session.accessJwt === null, 'Clears access token');
  assert(state3.user.did === null, 'Clears user data');
  assert(state3.settings.dataSaverMode === true, 'Preserves settings');
  assert(state3.navigation.currentView === 'login', 'Navigates to login');
  
  // Test 4: Refresh session
  console.log('\nTest 4: REFRESH_SESSION action');
  var state4 = reducer(authenticatedState, actions.refreshSession({
    accessJwt: 'newtoken',
    refreshJwt: 'newrefresh'
  }));
  assert(state4.session.accessJwt === 'newtoken', 'Updates access token');
  assert(state4.session.refreshJwt === 'newrefresh', 'Updates refresh token');
  assert(state4.session.isAuthenticated === true, 'Maintains authentication');
  
  // Test 5: Timeline load start
  console.log('\nTest 5: TIMELINE_LOAD_START action');
  var state5 = reducer(initialState, actions.timelineLoadStart());
  assert(state5.timeline.loading === true, 'Sets loading to true');
  assert(state5.timeline.error === null, 'Clears error');
  
  // Test 6: Timeline load success
  console.log('\nTest 6: TIMELINE_LOAD_SUCCESS action');
  var posts = [
    { uri: 'post1', text: 'Hello' },
    { uri: 'post2', text: 'World' }
  ];
  var state6 = reducer(initialState, actions.timelineLoadSuccess(posts, 'cursor123'));
  assert(state6.timeline.posts.length === 2, 'Sets posts');
  assert(state6.timeline.cursor === 'cursor123', 'Sets cursor');
  assert(state6.timeline.loading === false, 'Sets loading to false');
  assert(state6.timeline.error === null, 'Clears error');
  assert(state6.timeline.lastFetch !== null, 'Sets lastFetch timestamp');
  
  // Test 7: Timeline load failure
  console.log('\nTest 7: TIMELINE_LOAD_FAILURE action');
  var state7 = reducer(initialState, actions.timelineLoadFailure('Network error'));
  assert(state7.timeline.error === 'Network error', 'Sets error message');
  assert(state7.timeline.loading === false, 'Sets loading to false');
  
  // Test 8: Timeline append
  console.log('\nTest 8: TIMELINE_APPEND action');
  var stateWithPosts = Object.assign({}, initialState, {
    timeline: {
      posts: [{ uri: 'post1' }],
      cursor: 'cursor1',
      loading: false,
      error: null
    }
  });
  var newPosts = [{ uri: 'post2' }, { uri: 'post3' }];
  var state8 = reducer(stateWithPosts, actions.timelineAppend(newPosts, 'cursor2'));
  assert(state8.timeline.posts.length === 3, 'Appends posts');
  assert(state8.timeline.posts[0].uri === 'post1', 'Keeps existing posts');
  assert(state8.timeline.posts[2].uri === 'post3', 'Adds new posts');
  assert(state8.timeline.cursor === 'cursor2', 'Updates cursor');
  
  // Test 9: Timeline clear
  console.log('\nTest 9: TIMELINE_CLEAR action');
  var state9 = reducer(stateWithPosts, actions.timelineClear());
  assert(state9.timeline.posts.length === 0, 'Clears posts');
  assert(state9.timeline.cursor === null, 'Clears cursor');
  
  // Test 10: Timeline update post
  console.log('\nTest 10: TIMELINE_UPDATE_POST action');
  var stateWithPost = Object.assign({}, initialState, {
    timeline: {
      posts: [
        { uri: 'post1', likeCount: 5 },
        { uri: 'post2', likeCount: 10 }
      ],
      cursor: null,
      loading: false,
      error: null
    }
  });
  var state10 = reducer(stateWithPost, actions.timelineUpdatePost('post1', { likeCount: 6 }));
  assert(state10.timeline.posts[0].likeCount === 6, 'Updates target post');
  assert(state10.timeline.posts[1].likeCount === 10, 'Keeps other posts unchanged');
  
  // Test 11: Navigate
  console.log('\nTest 11: NAVIGATE action');
  var state11 = reducer(initialState, actions.navigate('profile', { handle: 'user.bsky' }));
  assert(state11.navigation.currentView === 'profile', 'Sets current view');
  assert(state11.navigation.params.handle === 'user.bsky', 'Sets navigation params');
  assert(state11.navigation.history.length === 1, 'Adds to history');
  assert(state11.navigation.history[0].view === 'login', 'Stores previous view in history');
  
  // Test 12: Navigate back
  console.log('\nTest 12: NAVIGATE_BACK action');
  var stateWithHistory = Object.assign({}, initialState, {
    navigation: {
      currentView: 'profile',
      params: { handle: 'user.bsky' },
      history: [
        { view: 'login', params: {} },
        { view: 'timeline', params: {} }
      ]
    }
  });
  var state12 = reducer(stateWithHistory, actions.navigateBack());
  assert(state12.navigation.currentView === 'timeline', 'Navigates to previous view');
  assert(state12.navigation.history.length === 1, 'Removes from history');
  
  // Test 13: Navigate back with empty history
  console.log('\nTest 13: NAVIGATE_BACK with empty history');
  var state13 = reducer(initialState, actions.navigateBack());
  assert(state13.navigation.currentView === 'login', 'Stays on current view');
  assert(state13.navigation.history.length === 0, 'History remains empty');
  
  // Test 14: Update settings
  console.log('\nTest 14: UPDATE_SETTINGS action');
  var state14 = reducer(initialState, actions.updateSettings({ language: 'es' }));
  assert(state14.settings.language === 'es', 'Updates language setting');
  assert(state14.settings.dataSaverMode === false, 'Keeps other settings');
  
  // Test 15: Toggle data saver
  console.log('\nTest 15: TOGGLE_DATA_SAVER action');
  var state15 = reducer(initialState, actions.toggleDataSaver());
  assert(state15.settings.dataSaverMode === true, 'Toggles data saver on');
  assert(state15.settings.autoLoadImages === false, 'Disables auto load images');
  
  var state15b = reducer(state15, actions.toggleDataSaver());
  assert(state15b.settings.dataSaverMode === false, 'Toggles data saver off');
  assert(state15b.settings.autoLoadImages === true, 'Enables auto load images');
  
  // Test 16: Update user
  console.log('\nTest 16: UPDATE_USER action');
  var stateWithUser = Object.assign({}, initialState, {
    user: { did: 'did:123', handle: 'user.bsky', displayName: 'Old Name' }
  });
  var state16 = reducer(stateWithUser, actions.updateUser({ displayName: 'New Name' }));
  assert(state16.user.displayName === 'New Name', 'Updates display name');
  assert(state16.user.handle === 'user.bsky', 'Keeps other user fields');
  
  // Test 17: Unknown action
  console.log('\nTest 17: Unknown action type');
  var state17 = reducer(initialState, { type: 'UNKNOWN_ACTION' });
  assert(deepEqual(state17, initialState), 'Returns unchanged state');
  
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
    runReducerTests: runReducerTests
  };
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  runReducerTests();
}
