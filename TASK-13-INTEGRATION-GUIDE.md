# PostDetailView Integration Guide

## Overview

This guide explains how to integrate the PostDetailView component into the BlueKai application.

## Prerequisites

Before integrating PostDetailView, ensure you have:
- ✅ ATPClient configured and authenticated
- ✅ Router system in place
- ✅ State management setup
- ✅ PostItem component available
- ✅ PostActionMenu component available
- ✅ LoadingIndicator component available
- ✅ ErrorMessage component available

## Integration Steps

### Step 1: Import the Component

```javascript
import PostDetailView from './views/PostDetailView.js';
import './views/PostDetailView.css';
```

### Step 2: Add Route to Router

```javascript
// In your router setup
router.register('/post/:uri', function(params) {
  // Decode the URI from the URL parameter
  var postUri = decodeURIComponent(params.uri);
  
  // Update app state to show post detail
  this.setState({
    currentView: 'post-detail',
    currentPostUri: postUri
  });
}.bind(this));
```

### Step 3: Add to App Component

```javascript
// In your main App component render method
App.prototype.render = function() {
  var state = this.state;
  
  // ... other view conditions ...
  
  if (state.currentView === 'post-detail') {
    return h(PostDetailView, {
      apiClient: this.atpClient,
      postUri: state.currentPostUri,
      onNavigateToReply: this.handleNavigateToReply.bind(this),
      onNavigateToPost: this.handleNavigateToPost.bind(this),
      dataSaverMode: state.settings.dataSaverMode || false
    });
  }
  
  // ... other views ...
};
```

### Step 4: Implement Navigation Handlers

```javascript
/**
 * Handle navigation to reply composition
 */
App.prototype.handleNavigateToReply = function(post) {
  // Store reply context in state
  this.setState({
    currentView: 'compose',
    replyContext: {
      parent: post,
      root: post.record.reply ? post.record.reply.root : {
        uri: post.uri,
        cid: post.cid
      }
    }
  });
  
  // Update router
  this.router.navigate('/compose?reply=' + encodeURIComponent(post.uri));
};

/**
 * Handle navigation to another post detail
 */
App.prototype.handleNavigateToPost = function(postUri) {
  // Update state
  this.setState({
    currentView: 'post-detail',
    currentPostUri: postUri
  });
  
  // Update router
  this.router.navigate('/post/' + encodeURIComponent(postUri));
};
```

### Step 5: Add Navigation from Timeline

Update your TimelineView or PostList to navigate to post detail:

```javascript
// In TimelineView or PostList
PostList.prototype.handlePostSelect = function(post) {
  // Navigate to post detail
  if (this.props.onNavigateToPost) {
    this.props.onNavigateToPost(post.uri);
  }
};

// In App component
App.prototype.handleTimelinePostSelect = function(postUri) {
  this.setState({
    currentView: 'post-detail',
    currentPostUri: postUri
  });
  
  this.router.navigate('/post/' + encodeURIComponent(postUri));
};
```

### Step 6: Add Back Navigation

Implement back button handling to return from post detail:

```javascript
// In your navigation manager or App component
NavigationManager.prototype.handleBackButton = function() {
  var currentView = this.appState.currentView;
  
  if (currentView === 'post-detail') {
    // Return to previous view (usually timeline)
    this.router.back();
    return true; // Handled
  }
  
  return false; // Not handled
};
```

## Complete Integration Example

Here's a complete example showing PostDetailView integrated into the App component:

```javascript
import { h, Component } from 'preact';
import ATPClient from './services/atp-client.js';
import Router from './navigation/router.js';
import NavigationManager from './navigation/navigation-manager.js';

import LoginView from './views/LoginView.js';
import TimelineView from './views/TimelineView.js';
import PostDetailView from './views/PostDetailView.js';
import ComposeView from './views/ComposeView.js';

function App() {
  Component.call(this);
  
  this.state = {
    currentView: 'login',
    currentPostUri: null,
    replyContext: null,
    session: null,
    settings: {
      dataSaverMode: false
    }
  };
  
  this.atpClient = new ATPClient();
  this.router = new Router();
  this.navigationManager = new NavigationManager();
  
  // Setup routes
  this.setupRoutes();
  
  // Bind methods
  this.handleLogin = this.handleLogin.bind(this);
  this.handleNavigateToPost = this.handleNavigateToPost.bind(this);
  this.handleNavigateToReply = this.handleNavigateToReply.bind(this);
  this.handleNavigateToTimeline = this.handleNavigateToTimeline.bind(this);
}

App.prototype = Object.create(Component.prototype);
App.prototype.constructor = App;

/**
 * Setup router routes
 */
App.prototype.setupRoutes = function() {
  var self = this;
  
  // Timeline route
  this.router.register('/', function() {
    self.setState({ currentView: 'timeline' });
  });
  
  // Post detail route
  this.router.register('/post/:uri', function(params) {
    self.setState({
      currentView: 'post-detail',
      currentPostUri: decodeURIComponent(params.uri)
    });
  });
  
  // Compose route
  this.router.register('/compose', function() {
    self.setState({ currentView: 'compose' });
  });
};

/**
 * Handle successful login
 */
App.prototype.handleLogin = function(session) {
  this.setState({
    session: session,
    currentView: 'timeline'
  });
  
  this.router.navigate('/');
};

/**
 * Handle navigation to post detail
 */
App.prototype.handleNavigateToPost = function(postUri) {
  this.setState({
    currentView: 'post-detail',
    currentPostUri: postUri
  });
  
  this.router.navigate('/post/' + encodeURIComponent(postUri));
};

/**
 * Handle navigation to reply composition
 */
App.prototype.handleNavigateToReply = function(post) {
  this.setState({
    currentView: 'compose',
    replyContext: {
      parent: post,
      root: post.record.reply ? post.record.reply.root : {
        uri: post.uri,
        cid: post.cid
      }
    }
  });
  
  this.router.navigate('/compose?reply=' + encodeURIComponent(post.uri));
};

/**
 * Handle navigation to timeline
 */
App.prototype.handleNavigateToTimeline = function() {
  this.setState({
    currentView: 'timeline',
    replyContext: null
  });
  
  this.router.navigate('/');
};

/**
 * Render app
 */
App.prototype.render = function() {
  var state = this.state;
  
  // Login view
  if (!state.session) {
    return h(LoginView, {
      atpClient: this.atpClient,
      onLogin: this.handleLogin
    });
  }
  
  // Timeline view
  if (state.currentView === 'timeline') {
    return h(TimelineView, {
      apiClient: this.atpClient,
      onNavigateToPost: this.handleNavigateToPost,
      onNavigateToCompose: function() {
        this.setState({ currentView: 'compose' });
        this.router.navigate('/compose');
      }.bind(this),
      dataSaverMode: state.settings.dataSaverMode
    });
  }
  
  // Post detail view
  if (state.currentView === 'post-detail') {
    return h(PostDetailView, {
      apiClient: this.atpClient,
      postUri: state.currentPostUri,
      onNavigateToReply: this.handleNavigateToReply,
      onNavigateToPost: this.handleNavigateToPost,
      dataSaverMode: state.settings.dataSaverMode
    });
  }
  
  // Compose view
  if (state.currentView === 'compose') {
    return h(ComposeView, {
      apiClient: this.atpClient,
      replyTo: state.replyContext ? state.replyContext.parent : null,
      onSuccess: this.handleNavigateToTimeline,
      onCancel: function() {
        this.router.back();
      }.bind(this)
    });
  }
  
  // Default fallback
  return h('div', null, 'Unknown view');
};

export default App;
```

## State Management Integration

If using a centralized state management system:

```javascript
// In your state reducer
function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE_TO_POST':
      return Object.assign({}, state, {
        currentView: 'post-detail',
        currentPostUri: action.payload.uri
      });
    
    case 'NAVIGATE_TO_REPLY':
      return Object.assign({}, state, {
        currentView: 'compose',
        replyContext: action.payload.context
      });
    
    // ... other actions ...
    
    default:
      return state;
  }
}

// In your action creators
function navigateToPost(uri) {
  return {
    type: 'NAVIGATE_TO_POST',
    payload: { uri: uri }
  };
}

function navigateToReply(post) {
  return {
    type: 'NAVIGATE_TO_REPLY',
    payload: {
      context: {
        parent: post,
        root: post.record.reply ? post.record.reply.root : {
          uri: post.uri,
          cid: post.cid
        }
      }
    }
  };
}
```

## Softkey Integration

Add softkey actions for PostDetailView:

```javascript
// In your softkey configuration
function getPostDetailSoftkeys(component) {
  return {
    left: {
      label: 'Back',
      action: function() {
        router.back();
      }
    },
    center: {
      label: 'Actions',
      action: function() {
        // Open action menu for focused post
        component.handlePostSelect(component.getFocusedPost());
      }
    },
    right: {
      label: 'Reply',
      action: function() {
        // Navigate to reply composition
        var post = component.state.thread.post;
        component.props.onNavigateToReply(post);
      }
    }
  };
}
```

## Cache Integration

Integrate with cache manager for offline support:

```javascript
// In PostDetailView or App component
PostDetailView.prototype.loadPost = function() {
  var self = this;
  var apiClient = this.props.apiClient;
  var cacheManager = this.props.cacheManager;
  var postUri = this.props.postUri;
  
  // Try cache first
  if (cacheManager) {
    var cached = cacheManager.get('post:' + postUri);
    if (cached) {
      this.setState({
        thread: cached,
        loading: false,
        fromCache: true
      });
    }
  }
  
  // Fetch from API
  apiClient.getPost(postUri)
    .then(function(thread) {
      // Update cache
      if (cacheManager) {
        cacheManager.set('post:' + postUri, thread, 5 * 60 * 1000); // 5 min TTL
      }
      
      self.setState({
        thread: thread,
        loading: false,
        error: null,
        fromCache: false
      });
    })
    .catch(function(error) {
      // If we have cached data, keep showing it
      if (!self.state.thread) {
        self.setState({
          loading: false,
          error: error.message || 'Failed to load post'
        });
      }
    });
};
```

## Testing Integration

Test the integration:

```javascript
// Integration test
function testPostDetailIntegration() {
  var app = new App();
  var container = document.createElement('div');
  
  // Render app
  render(h(app), container);
  
  // Simulate login
  app.handleLogin({ handle: 'test.bsky.social', did: 'did:plc:test' });
  
  // Navigate to post detail
  app.handleNavigateToPost('at://did:plc:test/app.bsky.feed.post/123');
  
  // Verify view changed
  assert(app.state.currentView === 'post-detail');
  assert(app.state.currentPostUri === 'at://did:plc:test/app.bsky.feed.post/123');
  
  // Verify component rendered
  var postDetail = container.querySelector('.post-detail');
  assert(postDetail !== null);
  
  console.log('✅ Integration test passed');
}
```

## Troubleshooting

### Issue: Post not loading
**Solution:** Check that postUri is properly encoded/decoded in router

### Issue: Navigation not working
**Solution:** Verify callbacks are bound correctly and router is configured

### Issue: Action menu not opening
**Solution:** Check that PostActionMenu is imported and styled correctly

### Issue: Replies not displaying
**Solution:** Verify API response format matches expected structure

## Performance Considerations

1. **Route Caching**: Cache post data when navigating away
2. **Lazy Loading**: Only load thread when view is active
3. **Memory Management**: Clear old post data when navigating
4. **Debouncing**: Debounce rapid navigation events

## Security Considerations

1. **URI Validation**: Validate post URIs before loading
2. **XSS Prevention**: Ensure text is properly escaped
3. **Auth Checks**: Verify user is authenticated before loading
4. **Rate Limiting**: Implement client-side rate limiting

## Next Steps

After integration:
1. Test on actual KaiOS device
2. Verify D-pad navigation works
3. Test with real BlueSky data
4. Monitor performance metrics
5. Gather user feedback

## Related Documentation

- [PostDetailView Component Documentation](src/views/README-POST-DETAIL.md)
- [Router Documentation](src/navigation/README.md)
- [State Management Documentation](src/state/README.md)
- [ATP Client Documentation](src/services/README.md)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review component tests
3. Check console for errors
4. Review API response format
5. Test with mock data first
