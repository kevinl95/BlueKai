/**
 * PostList Component with Optional Virtual Scrolling
 * Renders a list of posts efficiently
 * Virtual scrolling disabled by default for variable-height content (posts with images)
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 3.1, 3.4, 7.2, 7.3
 */

import { h, Component } from 'preact';
import PostItem from './PostItem.js';
import * as performance from '../utils/performance.js';

/**
 * @class PostList
 * @description List component that renders PostItem components with virtual scrolling
 */
function PostList(props) {
  return h(PostListClass, props);
}

function PostListClass(props) {
  Component.call(this, props);
  
  this.state = {
    scrollTop: 0,
    containerHeight: 0,
    focusedIndex: 0
  };
  
  this.containerRef = null;
  this.itemHeight = props.itemHeight || 120; // Estimated height per post
  this.bufferSize = props.bufferSize || 3; // Number of items to render above/below viewport
  this.lastScrollTime = 0; // Track scroll activity
  this.keyboardNavigationEnabled = props.keyboardNavigationEnabled !== false; // Default enabled
  
  // Detect KaiOS environment for D-pad cursor navigation
  var userAgent = navigator.userAgent;
  this.isKaiOS = userAgent.includes('KAIOS') || userAgent.includes('KaiOS');
  
  console.log('PostList KaiOS detection:', this.isKaiOS, 'UserAgent:', userAgent.substring(0, 50));
  
  // Bind methods
  this.handleScroll = this.handleScroll.bind(this);
  this.handleKeyDown = this.handleKeyDown.bind(this);
  this.setContainerRef = this.setContainerRef.bind(this);
  this.updateDimensions = this.updateDimensions.bind(this);
  this.checkScrollActivity = this.checkScrollActivity.bind(this);
  
  // Performance optimization: RAF throttle scroll handler
  this.handleScrollThrottled = performance.rafThrottle(this.handleScroll);
}

// Inherit from Component
PostListClass.prototype = Object.create(Component.prototype);
PostListClass.prototype.constructor = PostListClass;

/**
 * Component lifecycle - mount
 */
PostListClass.prototype.componentDidMount = function() {
  this.updateDimensions();
  
  if (this.containerRef) {
    // Use throttled scroll handler for better performance
    this.containerRef.addEventListener('scroll', this.handleScrollThrottled);
  }
  
  // Listen for window resize
  window.addEventListener('resize', this.updateDimensions);
  
  // Set up keyboard navigation only for KaiOS devices
  if (this.isKaiOS && this.props.navigationManager) {
    this.props.navigationManager.updateFocusableElements([this.containerRef]);
  }
};

/**
 * Component lifecycle - unmount
 */
PostListClass.prototype.componentWillUnmount = function() {
  if (this.containerRef) {
    this.containerRef.removeEventListener('scroll', this.handleScrollThrottled);
  }
  
  window.removeEventListener('resize', this.updateDimensions);
  
  // Clear scroll timeout
  if (this.scrollTimeout) {
    clearTimeout(this.scrollTimeout);
  }
};

/**
 * Component lifecycle - update
 */
PostListClass.prototype.componentDidUpdate = function(prevProps) {
  // If posts changed, update navigation only for KaiOS
  if (this.isKaiOS && this.props.posts !== prevProps.posts && this.props.navigationManager) {
    this.props.navigationManager.updateFocusableElements([this.containerRef]);
  }
};

/**
 * Update container dimensions
 */
PostListClass.prototype.updateDimensions = function() {
  if (this.containerRef) {
    this.setState({
      containerHeight: this.containerRef.clientHeight
    });
  }
};

/**
 * Handle scroll events
 */
PostListClass.prototype.handleScroll = function() {
  if (this.containerRef) {
    this.setState({
      scrollTop: this.containerRef.scrollTop
    });
    
    // Track scroll activity to disable keyboard nav during scrolling
    this.lastScrollTime = Date.now();
    
    // Re-enable keyboard nav after scrolling stops
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(this.checkScrollActivity, 150);
  }
};

/**
 * Check if scrolling has stopped and re-enable keyboard navigation
 */
PostListClass.prototype.checkScrollActivity = function() {
  var timeSinceScroll = Date.now() - this.lastScrollTime;
  if (timeSinceScroll >= 150) {
    // Scrolling has stopped, keyboard nav is now safe
    this.keyboardNavigationEnabled = this.props.keyboardNavigationEnabled !== false;
  }
};

/**
 * Handle keyboard navigation
 */
PostListClass.prototype.handleKeyDown = function(event) {
  // Only handle D-pad navigation on KaiOS devices
  if (!this.isKaiOS) {
    return;
  }
  
  var posts = this.props.posts || [];
  if (posts.length === 0) {
    return;
  }
  
  // On KaiOS, users navigate with D-pad cursor, not scrolling
  // Only enable keyboard navigation if explicitly enabled
  if (!this.keyboardNavigationEnabled) {
    return;
  }
  
  var key = event.key;
  var focusedIndex = this.state.focusedIndex;
  var newIndex = focusedIndex;
  
  switch (key) {
    case 'ArrowUp':
      newIndex = Math.max(0, focusedIndex - 1);
      event.preventDefault();
      break;
    
    case 'ArrowDown':
      newIndex = Math.min(posts.length - 1, focusedIndex + 1);
      event.preventDefault();
      break;
    
    case 'Enter':
      if (this.props.onSelectPost) {
        this.props.onSelectPost(posts[focusedIndex]);
      }
      event.preventDefault();
      break;
    
    default:
      return;
  }
  
  if (newIndex !== focusedIndex) {
    this.setState({ focusedIndex: newIndex });
    
    // Only auto-scroll on KaiOS devices with D-pad navigation
    if (this.isKaiOS) {
      // Only scroll to item if it was changed by keyboard navigation
      // and use gentle scrolling
      this.scrollToIndexGently(newIndex);
    }
  }
};

/**
 * Scroll to make an item visible (gentle version that doesn't interrupt user scrolling)
 */
PostListClass.prototype.scrollToIndexGently = function(index) {
  // Only auto-scroll on KaiOS devices
  if (!this.isKaiOS || !this.containerRef) {
    return;
  }
  
  // Try to find the actual element and scroll to it gently
  var postElements = this.containerRef.querySelectorAll('[data-focusable="true"]');
  if (postElements && postElements[index]) {
    // Use 'nearest' instead of 'center' to avoid jarring movements
    postElements[index].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest',  // Only scroll if not visible
      inline: 'nearest'
    });
  }
};

/**
 * Scroll to make an item visible (legacy function for compatibility)
 */
PostListClass.prototype.scrollToIndex = function(index) {
  // Only auto-scroll on KaiOS devices  
  if (!this.isKaiOS || !this.containerRef) {
    return;
  }
  
  // Try to find the actual element and scroll to it (works with variable heights)
  var postElements = this.containerRef.querySelectorAll('[data-focusable="true"]');
  if (postElements && postElements[index]) {
    // Use 'center' to keep focused item visible and centered
    // This ensures scrolling works at the bottom of the list
    postElements[index].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    return;
  }
  
  // Fallback to estimated height calculation (for virtual scrolling)
  var itemTop = index * this.itemHeight;
  var itemBottom = itemTop + this.itemHeight;
  var scrollTop = this.state.scrollTop;
  var containerHeight = this.state.containerHeight;
  
  // Scroll down if item is below viewport
  if (itemBottom > scrollTop + containerHeight) {
    this.containerRef.scrollTop = itemBottom - containerHeight;
  }
  // Scroll up if item is above viewport
  else if (itemTop < scrollTop) {
    this.containerRef.scrollTop = itemTop;
  }
};

/**
 * Set container ref
 */
PostListClass.prototype.setContainerRef = function(ref) {
  this.containerRef = ref;
};

/**
 * Calculate visible range for virtual scrolling
 */
PostListClass.prototype.getVisibleRange = function() {
  var scrollTop = this.state.scrollTop;
  var containerHeight = this.state.containerHeight;
  var posts = this.props.posts || [];
  
  if (posts.length === 0) {
    return { start: 0, end: 0 };
  }
  
  // Calculate first and last visible indices
  var firstVisible = Math.floor(scrollTop / this.itemHeight);
  var lastVisible = Math.ceil((scrollTop + containerHeight) / this.itemHeight);
  
  // Add buffer
  var start = Math.max(0, firstVisible - this.bufferSize);
  var end = Math.min(posts.length, lastVisible + this.bufferSize);
  
  return { start: start, end: end };
};

/**
 * Render the component
 */
PostListClass.prototype.render = function() {
  var posts = this.props.posts || [];
  var onSelectPost = this.props.onSelectPost;
  var dataSaverMode = this.props.dataSaverMode || false;
  var emptyMessage = this.props.emptyMessage || 'No posts to display';
  var useVirtualScrolling = this.props.useVirtualScrolling !== false; // Default true, but can be disabled
  
  // Handle empty state
  if (posts.length === 0) {
    return h('div', {
      className: 'post-list post-list--empty',
      role: 'list',
      'aria-label': 'Post list'
    },
      h('div', { className: 'post-list__empty-message' },
        emptyMessage
      )
    );
  }
  
  // For variable-height content (posts with images), disable virtual scrolling
  // Virtual scrolling requires fixed heights, which we can't guarantee with media
  if (!useVirtualScrolling || posts.length < 50) {
    // Render all posts directly (better for variable heights)
    var allPosts = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      
      // Preload images for first few visible posts to prevent layout shifts
      var shouldPreloadImages = i < 5; // Preload first 5 posts
      
      allPosts.push(
        h(PostItem, {
          key: post.uri || i,
          post: post,
          focused: false, // Disable focus-based navigation, use natural scrolling
          dataSaverMode: dataSaverMode,
          shouldPreloadImages: shouldPreloadImages,
          onSelect: onSelectPost
        })
      );
    }
    
    return h('div', {
      ref: this.setContainerRef,
      className: 'post-list',
      role: 'list',
      'aria-label': 'Post list'
    },
      allPosts
    );
  }
  
  // Virtual scrolling for large lists (legacy code, kept for backwards compatibility)
  var range = this.getVisibleRange();
  var totalHeight = posts.length * this.itemHeight;
  var offsetTop = range.start * this.itemHeight;
  
  // Render only visible items
  var visiblePosts = [];
  for (var i = range.start; i < range.end; i++) {
    var post = posts[i];
    var isFocused = i === this.state.focusedIndex;
    
    visiblePosts.push(
      h(PostItem, {
        key: post.uri || i,
        post: post,
        focused: isFocused,
        dataSaverMode: dataSaverMode,
        onSelect: onSelectPost
      })
    );
  }
  
  return h('div', {
    ref: this.setContainerRef,
    className: 'post-list',
    onKeyDown: this.isKaiOS ? this.handleKeyDown : undefined,
    tabIndex: this.isKaiOS ? 0 : undefined,
    role: 'list',
    'aria-label': 'Post list'
  },
    // Spacer for total height (enables scrolling)
    h('div', {
      className: 'post-list__spacer',
      style: { height: totalHeight + 'px' }
    },
      // Container for visible items
      h('div', {
        className: 'post-list__items',
        style: { transform: 'translateY(' + offsetTop + 'px)' }
      },
        visiblePosts
      )
    )
  );
};

export default PostList;
