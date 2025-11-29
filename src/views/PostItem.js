/**
 * PostItem Component
 * Displays a single post with author info, content, and engagement metrics
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 4.3, 4.6, 10.3, 4.4, 9.3
 */

import { h, Component } from 'preact';
import DateFormatter from '../utils/date-formatter.js';
import TextProcessor from '../utils/text-processor.js';
import Modal from '../components/Modal.js';

/**
 * @class PostItem
 * @description Component to display a single BlueSky post with interaction support
 */
function PostItem() {
  Component.call(this);
  
  this.state = {
    optimisticLike: null, // null, 'liked', or 'unliked'
    optimisticLikeCount: 0,
    optimisticRepost: null, // null, 'reposted', or 'unreposted'
    optimisticRepostCount: 0,
    isProcessing: false,
    showRepostConfirm: false,
    imagesLoaded: false // Track if user manually loaded images
  };
  
  this.handleLike = this.handleLike.bind(this);
  this.handleUnlike = this.handleUnlike.bind(this);
  this.handleRepost = this.handleRepost.bind(this);
  this.handleUnrepost = this.handleUnrepost.bind(this);
  this.confirmRepost = this.confirmRepost.bind(this);
  this.cancelRepost = this.cancelRepost.bind(this);
  this.loadImages = this.loadImages.bind(this);
}

// Inherit from Component
PostItem.prototype = Object.create(Component.prototype);
PostItem.prototype.constructor = PostItem;

/**
 * Handle like action
 */
PostItem.prototype.handleLike = function() {
  var self = this;
  var post = this.props.post;
  var onLike = this.props.onLike;
  
  if (this.state.isProcessing || !onLike) {
    return;
  }
  
  // Optimistic update
  this.setState({
    optimisticLike: 'liked',
    optimisticLikeCount: (post.likeCount || 0) + 1,
    isProcessing: true
  });
  
  // Call API
  var promise = onLike(post);
  
  if (promise && promise.then) {
    promise
      .then(function() {
        // Success - keep optimistic state
        self.setState({
          isProcessing: false
        });
      })
      .catch(function(error) {
        // Error - revert optimistic update
        console.error('Like failed:', error);
        self.setState({
          optimisticLike: null,
          optimisticLikeCount: 0,
          isProcessing: false
        });
      });
  } else {
    // No promise returned, just clear processing
    this.setState({ isProcessing: false });
  }
};

/**
 * Handle unlike action
 */
PostItem.prototype.handleUnlike = function() {
  var self = this;
  var post = this.props.post;
  var onUnlike = this.props.onUnlike;
  
  if (this.state.isProcessing || !onUnlike) {
    return;
  }
  
  // Optimistic update
  this.setState({
    optimisticLike: 'unliked',
    optimisticLikeCount: Math.max(0, (post.likeCount || 0) - 1),
    isProcessing: true
  });
  
  // Call API
  var promise = onUnlike(post);
  
  if (promise && promise.then) {
    promise
      .then(function() {
        // Success - keep optimistic state
        self.setState({
          isProcessing: false
        });
      })
      .catch(function(error) {
        // Error - revert optimistic update
        console.error('Unlike failed:', error);
        self.setState({
          optimisticLike: null,
          optimisticLikeCount: 0,
          isProcessing: false
        });
      });
  } else {
    // No promise returned, just clear processing
    this.setState({ isProcessing: false });
  }
};

/**
 * Handle repost action (shows confirmation modal)
 */
PostItem.prototype.handleRepost = function() {
  if (this.state.isProcessing) {
    return;
  }
  
  // Show confirmation modal
  this.setState({ showRepostConfirm: true });
};

/**
 * Confirm repost action
 */
PostItem.prototype.confirmRepost = function() {
  var self = this;
  var post = this.props.post;
  var onRepost = this.props.onRepost;
  
  if (!onRepost) {
    this.setState({ showRepostConfirm: false });
    return;
  }
  
  // Hide modal and set processing
  this.setState({
    showRepostConfirm: false,
    optimisticRepost: 'reposted',
    optimisticRepostCount: (post.repostCount || 0) + 1,
    isProcessing: true
  });
  
  // Call API
  var promise = onRepost(post);
  
  if (promise && promise.then) {
    promise
      .then(function() {
        // Success - keep optimistic state
        self.setState({
          isProcessing: false
        });
      })
      .catch(function(error) {
        // Error - revert optimistic update
        console.error('Repost failed:', error);
        self.setState({
          optimisticRepost: null,
          optimisticRepostCount: 0,
          isProcessing: false
        });
      });
  } else {
    // No promise returned, just clear processing
    this.setState({ isProcessing: false });
  }
};

/**
 * Cancel repost action
 */
PostItem.prototype.cancelRepost = function() {
  this.setState({ showRepostConfirm: false });
};

/**
 * Load images manually (for data saver mode)
 * Requirements: 2.3, 2.5, 2.6
 */
PostItem.prototype.loadImages = function() {
  this.setState({ imagesLoaded: true });
};

/**
 * Handle unrepost action
 */
PostItem.prototype.handleUnrepost = function() {
  var self = this;
  var post = this.props.post;
  var onUnrepost = this.props.onUnrepost;
  
  if (this.state.isProcessing || !onUnrepost) {
    return;
  }
  
  // Optimistic update
  this.setState({
    optimisticRepost: 'unreposted',
    optimisticRepostCount: Math.max(0, (post.repostCount || 0) - 1),
    isProcessing: true
  });
  
  // Call API
  var promise = onUnrepost(post);
  
  if (promise && promise.then) {
    promise
      .then(function() {
        // Success - keep optimistic state
        self.setState({
          isProcessing: false
        });
      })
      .catch(function(error) {
        // Error - revert optimistic update
        console.error('Unrepost failed:', error);
        self.setState({
          optimisticRepost: null,
          optimisticRepostCount: 0,
          isProcessing: false
        });
      });
  } else {
    // No promise returned, just clear processing
    this.setState({ isProcessing: false });
  }
};

/**
 * Render component
 */
PostItem.prototype.render = function() {
  var post = this.props.post;
  var onSelect = this.props.onSelect;
  var focused = this.props.focused;
  var dataSaverMode = this.props.dataSaverMode || false;
  
  // Determine if images should be shown
  // Show images if: not in data saver mode OR user manually loaded them
  var shouldShowImages = !dataSaverMode || this.state.imagesLoaded;
  
  if (!post) {
    return null;
  }
  
  // Initialize utilities
  var dateFormatter = new DateFormatter();
  var textProcessor = new TextProcessor();
  
  // Extract post data
  var author = post.author || {};
  var record = post.record || {};
  var text = record.text || '';
  var createdAt = record.createdAt;
  
  // Engagement counts with optimistic updates
  var viewer = post.viewer || {};
  var isLiked = this.state.optimisticLike === 'liked' ? true : 
                this.state.optimisticLike === 'unliked' ? false : 
                !!viewer.like;
  var likeCount = this.state.optimisticLike !== null ? 
                  this.state.optimisticLikeCount : 
                  (post.likeCount || 0);
  var isReposted = this.state.optimisticRepost === 'reposted' ? true :
                   this.state.optimisticRepost === 'unreposted' ? false :
                   !!viewer.repost;
  var repostCount = this.state.optimisticRepost !== null ?
                    this.state.optimisticRepostCount :
                    (post.repostCount || 0);
  var replyCount = post.replyCount || 0;
  
  // Format timestamp
  var timestamp = dateFormatter.formatRelative(createdAt);
  
  // Process text for display (linkify URLs)
  var processedText = textProcessor.linkify(textProcessor._escapeHtml(text), 'post-link');
  
  // Handle click/selection
  var handleClick = function() {
    if (onSelect) {
      onSelect(post);
    }
  };
  
  var handleKeyDown = function(e) {
    if (e.key === 'Enter' && onSelect) {
      e.preventDefault();
      onSelect(post);
    }
  };
  
  // Build class names
  var className = 'post-item';
  if (focused) {
    className += ' post-item--focused';
  }
  if (this.state.isProcessing) {
    className += ' post-item--processing';
  }
  
  return h('article', {
    className: className,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: focused ? 0 : -1,
    'aria-label': 'Post by ' + (author.displayName || author.handle) + ': ' + (text.length > 100 ? text.substring(0, 100) + '...' : text),
    'data-focusable': 'true'
  },
    // Author info
    h('header', { className: 'post-item__header' },
      // Avatar (conditional based on data saver mode and manual load)
      shouldShowImages && author.avatar && h('img', {
        className: 'post-item__avatar',
        src: author.avatar,
        alt: 'Avatar of ' + (author.displayName || author.handle),
        width: 32,
        height: 32,
        role: 'img'
      }),
      !shouldShowImages && h('div', {
        className: 'post-item__avatar post-item__avatar--placeholder',
        'aria-label': 'Avatar placeholder',
        role: 'img'
      }),
      
      // Author details
      h('div', { className: 'post-item__author' },
        h('div', { className: 'post-item__author-name' },
          author.displayName || author.handle
        ),
        h('div', { className: 'post-item__author-handle' },
          '@' + author.handle
        )
      ),
      
      // Timestamp
      h('div', { className: 'post-item__timestamp' },
        timestamp
      )
    ),
    
    // Post content
    h('div', {
      className: 'post-item__content',
      dangerouslySetInnerHTML: { __html: processedText }
    }),
    
    // Engagement metrics
    h('footer', { 
      className: 'post-item__engagement',
      'aria-label': 'Post engagement metrics'
    },
      // Reply count
      h('span', {
        className: 'post-item__metric',
        'aria-label': replyCount === 0 ? 'No replies' : replyCount === 1 ? '1 reply' : replyCount + ' replies',
        role: 'status'
      },
        '💬 ' + (replyCount || 0)
      ),
      
      // Repost count
      h('span', {
        className: 'post-item__metric' + (isReposted ? ' post-item__metric--active' : ''),
        'aria-label': (repostCount === 0 ? 'No reposts' : repostCount === 1 ? '1 repost' : repostCount + ' reposts') + (isReposted ? ', you reposted this' : ''),
        role: 'status'
      },
        '🔁 ' + (repostCount || 0)
      ),
      
      // Like count
      h('span', {
        className: 'post-item__metric' + (isLiked ? ' post-item__metric--active' : ''),
        'aria-label': (likeCount === 0 ? 'No likes' : likeCount === 1 ? '1 like' : likeCount + ' likes') + (isLiked ? ', you liked this' : ''),
        role: 'status'
      },
        '❤️ ' + (likeCount || 0)
      )
    ),
    
    // Repost confirmation modal
    this.state.showRepostConfirm && h(Modal, {
      isOpen: true,
      onClose: this.cancelRepost,
      title: 'Confirm Repost'
    },
      h('p', { style: { marginBottom: '16px', fontSize: '14px' } },
        'Repost this to your followers?'
      ),
      h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
        h('button', {
          onClick: this.cancelRepost,
          style: {
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }
        }, 'Cancel'),
        h('button', {
          onClick: this.confirmRepost,
          style: {
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }
        }, 'Repost')
      )
    )
  );
};

export default PostItem;
