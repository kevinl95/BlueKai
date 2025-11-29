/**
 * TimelineView Component
 * Displays the user's timeline with posts
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 4.2, 4.3, 6.1, 6.2, 6.4, 9.4
 */

import { h, Component } from 'preact';
import PostList from './PostList.js';
import PostActionMenu from './PostActionMenu.js';
import LoadingIndicator from '../components/LoadingIndicator.js';
import ErrorMessage from '../components/ErrorMessage.js';
import ATPClient from '../services/atp-client.js';
import CacheManager from '../utils/cache-manager.js';
import StorageManager from '../utils/storage.js';

/**
 * @class TimelineView
 * @description View that fetches and displays the user's timeline
 */
function TimelineView(props) {
  return h(TimelineViewClass, props);
}

function TimelineViewClass(props) {
  Component.call(this, props);
  
  this.state = {
    posts: [],
    cursor: null,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: true,
    showActionMenu: false,
    selectedPost: null,
    focusedIndex: 0
  };
  
  // Memory management: Limit in-memory timeline size
  // Requirements: 7.5 - Limit in-memory timeline size
  this.MAX_POSTS_IN_MEMORY = 100;
  
  // Initialize services
  this.atpClient = props.atpClient || new ATPClient();
  this.storage = new StorageManager();
  this.cacheManager = new CacheManager(this.storage, {
    defaultTTL: 5 * 60 * 1000 // 5 minutes
  });
  
  // Bind methods
  this.loadTimeline = this.loadTimeline.bind(this);
  this.loadMore = this.loadMore.bind(this);
  this.refresh = this.refresh.bind(this);
  this.handleSelectPost = this.handleSelectPost.bind(this);
  this.handleRetry = this.handleRetry.bind(this);
  this.trimPostsIfNeeded = this.trimPostsIfNeeded.bind(this);
  this.openActionMenu = this.openActionMenu.bind(this);
  this.closeActionMenu = this.closeActionMenu.bind(this);
  this.getFocusedPost = this.getFocusedPost.bind(this);
  this.handleFocusChange = this.handleFocusChange.bind(this);
}

// Inherit from Component
TimelineViewClass.prototype = Object.create(Component.prototype);
TimelineViewClass.prototype.constructor = TimelineViewClass;

/**
 * Component lifecycle - mount
 */
TimelineViewClass.prototype.componentDidMount = function() {
  // Try to load from cache first
  this.loadFromCache();
  
  // Then fetch fresh data
  this.loadTimeline();
  
  // Set up softkey actions
  if (this.props.onSoftkeyUpdate) {
    this.props.onSoftkeyUpdate({
      left: { label: 'Refresh', action: this.refresh },
      center: { label: 'Select', action: null },
      right: { label: 'Menu', action: this.props.onOpenMainMenu }
    });
  }
};

/**
 * Load timeline from cache
 */
TimelineViewClass.prototype.loadFromCache = function() {
  try {
    var cacheKey = this.cacheManager.generateKey('timeline', 'home');
    var cached = this.cacheManager.get(cacheKey);
    
    if (cached && cached.posts && cached.posts.length > 0) {
      this.setState({
        posts: cached.posts,
        cursor: cached.cursor,
        loading: false
      });
    }
  } catch (error) {
    console.error('Failed to load from cache:', error);
  }
};

/**
 * Load timeline from API
 * Requirements: 4.2, 4.3 - Fetch and display timeline
 */
TimelineViewClass.prototype.loadTimeline = function() {
  var self = this;
  
  this.setState({ loading: true, error: null });
  
  this.atpClient.getTimeline({
    limit: 50
  })
  .then(function(response) {
    var feed = response.feed || [];
    var cursor = response.cursor || null;
    
    // Extract posts from feed items
    // BlueSky API returns feed items with a 'post' property
    var posts = feed.map(function(item) {
      return item.post;
    });
    
    // Trim posts if needed to manage memory
    var trimmedPosts = self.trimPostsIfNeeded(posts);
    
    self.setState({
      posts: trimmedPosts,
      cursor: cursor,
      loading: false,
      hasMore: !!cursor
    });
    
    // Cache the results
    // Requirements: 6.4 - Integrate cache for offline viewing
    self.cacheTimeline(trimmedPosts, cursor);
  })
  .catch(function(error) {
    console.error('Failed to load timeline:', error);
    
    self.setState({
      loading: false,
      error: error.message || 'Failed to load timeline'
    });
  });
};

/**
 * Load more posts (pagination)
 * Requirements: 4.3 - Cursor pagination
 */
TimelineViewClass.prototype.loadMore = function() {
  var self = this;
  
  if (this.state.loadingMore || !this.state.hasMore || !this.state.cursor) {
    return;
  }
  
  this.setState({ loadingMore: true });
  
  this.atpClient.getTimeline({
    limit: 50,
    cursor: this.state.cursor
  })
  .then(function(response) {
    var feed = response.feed || [];
    var cursor = response.cursor || null;
    
    // Extract posts from feed items
    var newPosts = feed.map(function(item) {
      return item.post;
    });
    
    // Combine and trim posts if needed to manage memory
    var allPosts = self.state.posts.concat(newPosts);
    var trimmedPosts = self.trimPostsIfNeeded(allPosts);
    
    self.setState({
      posts: trimmedPosts,
      cursor: cursor,
      loadingMore: false,
      hasMore: !!cursor
    });
    
    // Update cache
    self.cacheTimeline(trimmedPosts, cursor);
  })
  .catch(function(error) {
    console.error('Failed to load more posts:', error);
    
    self.setState({
      loadingMore: false,
      error: error.message || 'Failed to load more posts'
    });
  });
};

/**
 * Refresh timeline
 * Requirements: 4.2 - Pull-to-refresh via softkey action
 */
TimelineViewClass.prototype.refresh = function() {
  this.setState({
    posts: [],
    cursor: null,
    hasMore: true
  });
  
  this.loadTimeline();
};

/**
 * Cache timeline data
 * Requirements: 6.2, 6.4 - Cache for offline viewing
 */
TimelineViewClass.prototype.cacheTimeline = function(posts, cursor) {
  try {
    var cacheKey = this.cacheManager.generateKey('timeline', 'home');
    this.cacheManager.set(cacheKey, {
      posts: posts,
      cursor: cursor
    });
  } catch (error) {
    console.error('Failed to cache timeline:', error);
  }
};

/**
 * Handle post selection - navigates to post detail
 * Requirements: 6.1 - Wire up navigation to post detail on selection
 */
TimelineViewClass.prototype.handleSelectPost = function(post) {
  if (this.props.onNavigateToPost && post.uri) {
    this.props.onNavigateToPost(post.uri);
  }
};

/**
 * Handle retry after error
 * Requirements: 9.4 - Display errors with retry option
 */
TimelineViewClass.prototype.handleRetry = function() {
  this.loadTimeline();
};

/**
 * Get the currently focused post
 */
TimelineViewClass.prototype.getFocusedPost = function() {
  var posts = this.state.posts;
  var focusedIndex = this.state.focusedIndex;
  return posts[focusedIndex] || null;
};

/**
 * Handle focus change from PostList
 */
TimelineViewClass.prototype.handleFocusChange = function(index) {
  this.setState({ focusedIndex: index });
};

/**
 * Open action menu for focused post
 */
TimelineViewClass.prototype.openActionMenu = function() {
  var focusedPost = this.getFocusedPost();
  if (focusedPost) {
    this.setState({
      showActionMenu: true,
      selectedPost: focusedPost
    });
  }
};

/**
 * Close action menu
 */
TimelineViewClass.prototype.closeActionMenu = function() {
  this.setState({
    showActionMenu: false,
    selectedPost: null
  });
};

/**
 * Render the component
 */
TimelineViewClass.prototype.render = function() {
  var loading = this.state.loading;
  var loadingMore = this.state.loadingMore;
  var error = this.state.error;
  var posts = this.state.posts;
  var dataSaverMode = this.props.dataSaverMode || false;
  
  // Show loading indicator on initial load
  if (loading && posts.length === 0) {
    return h('main', { 
      className: 'timeline-view timeline-view--loading',
      id: 'main-content',
      role: 'main',
      'aria-label': 'Timeline'
    },
      h(LoadingIndicator, { message: 'Loading timeline...' })
    );
  }
  
  // Show error message if load failed and no cached posts
  if (error && posts.length === 0) {
    return h('main', { 
      className: 'timeline-view timeline-view--error',
      id: 'main-content',
      role: 'main',
      'aria-label': 'Timeline'
    },
      h(ErrorMessage, {
        message: error,
        onRetry: this.handleRetry
      })
    );
  }
  
  return h('main', { 
    className: 'timeline-view',
    id: 'main-content',
    role: 'main',
    'aria-label': 'Timeline'
  },
    // Error banner if there's an error but we have cached posts
    error && posts.length > 0 && h('div', { className: 'timeline-view__error-banner' },
      h(ErrorMessage, {
        message: error,
        onRetry: this.handleRetry,
        inline: true
      })
    ),
    
    // Post list
    h(PostList, {
      posts: posts,
      dataSaverMode: dataSaverMode,
      onSelectPost: this.handleSelectPost,
      navigationManager: this.props.navigationManager,
      emptyMessage: 'No posts in your timeline'
    }),
    
    // Loading more indicator
    loadingMore && h('div', { className: 'timeline-view__loading-more' },
      h(LoadingIndicator, { message: 'Loading more...' })
    ),
    
    // Load more trigger (when scrolled near bottom)
    !loadingMore && this.state.hasMore && h('div', {
      className: 'timeline-view__load-more',
      ref: function(el) {
        if (el && !this._observerSetup) {
          this._observerSetup = true;
          // Simple scroll detection for load more
          var self = this;
          var checkScroll = function() {
            if (el.getBoundingClientRect().top < window.innerHeight + 200) {
              self.loadMore();
            }
          };
          window.addEventListener('scroll', checkScroll);
        }
      }.bind(this)
    }),
    
    // Action menu overlay
    this.state.showActionMenu && h(PostActionMenu, {
      post: this.state.selectedPost,
      onAction: this.props.onPostAction,
      onClose: this.closeActionMenu,
      dataSaverMode: dataSaverMode
    })
  );
};

/**
 * Trim posts array if it exceeds memory limit
 * Requirements: 7.5 - Limit in-memory timeline size
 * @param {Array} posts - Array of posts
 * @returns {Array} Trimmed array
 */
TimelineViewClass.prototype.trimPostsIfNeeded = function(posts) {
  if (posts.length <= this.MAX_POSTS_IN_MEMORY) {
    return posts;
  }
  
  console.log('Trimming timeline from ' + posts.length + ' to ' + this.MAX_POSTS_IN_MEMORY + ' posts');
  
  // Keep the most recent posts
  return posts.slice(0, this.MAX_POSTS_IN_MEMORY);
};

export default TimelineView;
