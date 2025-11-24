/**
 * State Management Usage Examples
 * Demonstrates how to use the state management layer in BlueKai
 * Compatible with Gecko 48 (ES5 transpiled)
 */

var h = require('preact').h;
var render = require('preact').render;

// Import state management modules
var AppStateProvider = require('./AppStateProvider').AppStateProvider;
var useAppState = require('./app-state').useAppState;
var actions = require('./actions');
var SessionManager = require('./session-manager').SessionManager;

/**
 * Example 1: Setting up the application with state provider
 */
function setupApp() {
  var App = require('../components/App');
  
  render(
    h(AppStateProvider, null,
      h(App, null)
    ),
    document.body
  );
}

/**
 * Example 2: Using state in a component
 */
function ExampleComponent() {
  var context = useAppState();
  var state = context.state;
  var dispatch = context.dispatch;
  
  // Access state
  var isAuthenticated = state.session.isAuthenticated;
  var currentView = state.navigation.currentView;
  var posts = state.timeline.posts;
  
  // Dispatch actions
  function handleLogin() {
    var session = {
      accessJwt: 'token123',
      refreshJwt: 'refresh123',
      did: 'did:plc:123',
      handle: 'user.bsky.social'
    };
    
    var user = {
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    };
    
    dispatch(actions.loginSuccess(session, user));
  }
  
  function handleLogout() {
    dispatch(actions.logout());
  }
  
  function handleNavigate() {
    dispatch(actions.navigate('profile', { handle: 'user.bsky.social' }));
  }
  
  return h('div', null,
    h('p', null, 'Authenticated: ' + isAuthenticated),
    h('p', null, 'Current View: ' + currentView),
    h('p', null, 'Posts: ' + posts.length),
    h('button', { onClick: handleLogin }, 'Login'),
    h('button', { onClick: handleLogout }, 'Logout'),
    h('button', { onClick: handleNavigate }, 'Go to Profile')
  );
}

/**
 * Example 3: Session management on app start
 */
function initializeApp(atpClient) {
  // Get initial state
  var context = useAppState();
  var state = context.state;
  var dispatch = context.dispatch;
  
  // Validate and restore session
  SessionManager.validateAndRestoreSession(state, dispatch, atpClient)
    .then(function(isValid) {
      if (isValid) {
        console.log('Session restored successfully');
        
        // Start automatic session refresh
        var timerId = SessionManager.startSessionRefreshTimer(state, dispatch, atpClient);
        
        // Store timer ID for cleanup
        window.sessionRefreshTimer = timerId;
        
        // Navigate to timeline
        dispatch(actions.navigate('timeline'));
      } else {
        console.log('No valid session, showing login');
        dispatch(actions.navigate('login'));
      }
    })
    .catch(function(error) {
      console.error('Session initialization failed:', error);
      dispatch(actions.navigate('login'));
    });
}

/**
 * Example 4: Timeline loading
 */
function loadTimeline(atpClient) {
  var context = useAppState();
  var dispatch = context.dispatch;
  
  // Start loading
  dispatch(actions.timelineLoadStart());
  
  // Fetch timeline from API
  atpClient.getTimeline({ limit: 50 })
    .then(function(response) {
      dispatch(actions.timelineLoadSuccess(response.feed, response.cursor));
    })
    .catch(function(error) {
      dispatch(actions.timelineLoadFailure(error.message));
    });
}

/**
 * Example 5: Pagination (load more posts)
 */
function loadMorePosts(atpClient) {
  var context = useAppState();
  var state = context.state;
  var dispatch = context.dispatch;
  
  var cursor = state.timeline.cursor;
  
  if (!cursor) {
    console.log('No more posts to load');
    return;
  }
  
  atpClient.getTimeline({ limit: 50, cursor: cursor })
    .then(function(response) {
      dispatch(actions.timelineAppend(response.feed, response.cursor));
    })
    .catch(function(error) {
      console.error('Failed to load more posts:', error);
    });
}

/**
 * Example 6: Updating a post (like/unlike)
 */
function likePost(postUri, atpClient) {
  var context = useAppState();
  var state = context.state;
  var dispatch = context.dispatch;
  
  // Find the post
  var post = state.timeline.posts.find(function(p) {
    return p.uri === postUri;
  });
  
  if (!post) {
    console.error('Post not found');
    return;
  }
  
  // Optimistic update
  dispatch(actions.timelineUpdatePost(postUri, {
    likeCount: post.likeCount + 1,
    viewer: { like: 'pending' }
  }));
  
  // Call API
  atpClient.likePost(post.uri, post.cid)
    .then(function(response) {
      // Update with actual like URI
      dispatch(actions.timelineUpdatePost(postUri, {
        viewer: { like: response.uri }
      }));
    })
    .catch(function(error) {
      // Revert on error
      dispatch(actions.timelineUpdatePost(postUri, {
        likeCount: post.likeCount,
        viewer: { like: null }
      }));
      console.error('Failed to like post:', error);
    });
}

/**
 * Example 7: Settings management
 */
function toggleDataSaver() {
  var context = useAppState();
  var dispatch = context.dispatch;
  
  dispatch(actions.toggleDataSaver());
}

function changeLanguage(language) {
  var context = useAppState();
  var dispatch = context.dispatch;
  
  dispatch(actions.updateSettings({ language: language }));
}

/**
 * Example 8: Navigation with history
 */
function navigateToProfile(handle) {
  var context = useAppState();
  var dispatch = context.dispatch;
  
  dispatch(actions.navigate('profile', { handle: handle }));
}

function goBack() {
  var context = useAppState();
  var dispatch = context.dispatch;
  
  dispatch(actions.navigateBack());
}

/**
 * Example 9: Cleanup on app close
 */
function cleanupApp() {
  // Stop session refresh timer
  if (window.sessionRefreshTimer) {
    SessionManager.stopSessionRefreshTimer(window.sessionRefreshTimer);
  }
  
  console.log('App cleanup complete');
}

/**
 * Example 10: Error handling
 */
function handleApiError(error, dispatch) {
  if (error.status === 401) {
    // Session expired
    console.log('Session expired, logging out');
    SessionManager.handleSessionExpiration(dispatch, null);
  } else if (error.status === 429) {
    // Rate limited
    console.log('Rate limited, please wait');
    // Could dispatch an action to show rate limit message
  } else {
    // Generic error
    console.error('API error:', error);
  }
}

/**
 * Export examples
 */
module.exports = {
  setupApp: setupApp,
  ExampleComponent: ExampleComponent,
  initializeApp: initializeApp,
  loadTimeline: loadTimeline,
  loadMorePosts: loadMorePosts,
  likePost: likePost,
  toggleDataSaver: toggleDataSaver,
  changeLanguage: changeLanguage,
  navigateToProfile: navigateToProfile,
  goBack: goBack,
  cleanupApp: cleanupApp,
  handleApiError: handleApiError
};
