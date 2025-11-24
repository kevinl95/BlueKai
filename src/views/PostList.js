/**
 * PostList Component with Virtual Scrolling
 * Renders a list of posts efficiently using virtual scrolling
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 3.1, 3.4, 7.2
 */

import { h, Component } from 'preact';
import PostItem from './PostItem.js';

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
  
  // Bind methods
  this.handleScroll = this.handleScroll.bind(this);
  this.handleKeyDown = this.handleKeyDown.bind(this);
  this.setContainerRef = this.setContainerRef.bind(this);
  this.updateDimensions = this.updateDimensions.bind(this);
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
    this.containerRef.addEventListener('scroll', this.handleScroll);
  }
  
  // Listen for window resize
  window.addEventListener('resize', this.updateDimensions);
  
  // Set up keyboard navigation
  if (this.props.navigationManager) {
    this.props.navigationManager.updateFocusableElements([this.containerRef]);
  }
};

/**
 * Component lifecycle - unmount
 */
PostListClass.prototype.componentWillUnmount = function() {
  if (this.containerRef) {
    this.containerRef.removeEventListener('scroll', this.handleScroll);
  }
  
  window.removeEventListener('resize', this.updateDimensions);
};

/**
 * Component lifecycle - update
 */
PostListClass.prototype.componentDidUpdate = function(prevProps) {
  // If posts changed, update navigation
  if (this.props.posts !== prevProps.posts && this.props.navigationManager) {
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
  }
};

/**
 * Handle keyboard navigation
 */
PostListClass.prototype.handleKeyDown = function(event) {
  var posts = this.props.posts || [];
  if (posts.length === 0) {
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
    this.scrollToIndex(newIndex);
  }
};

/**
 * Scroll to make an item visible
 */
PostListClass.prototype.scrollToIndex = function(index) {
  if (!this.containerRef) {
    return;
  }
  
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
  
  // Calculate visible range
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
    onKeyDown: this.handleKeyDown,
    tabIndex: 0,
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
