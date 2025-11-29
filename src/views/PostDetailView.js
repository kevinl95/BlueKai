/**
 * PostDetailView Component
 * Displays a single post with its reply thread
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 4.4
 */

import { h, Component } from 'preact';
import PostItem from './PostItem.js';
import PostActionMenu from './PostActionMenu.js';
import LoadingIndicator from '../components/LoadingIndicator.js';
import ErrorMessage from '../components/ErrorMessage.js';

/**
 * @class PostDetailView
 * @description View component for displaying post details and reply thread
 */
function PostDetailView() {
  Component.call(this);
  
  this.state = {
    thread: null,
    loading: true,
    error: null,
    showActionMenu: false,
    selectedPost: null,
    navigatingToReply: false
  };
  
  this.handleRetry = this.handleRetry.bind(this);
  this.handlePostSelect = this.handlePostSelect.bind(this);
  this.handleCloseActionMenu = this.handleCloseActionMenu.bind(this);
  this.handleAction = this.handleAction.bind(this);
  this.handleLike = this.handleLike.bind(this);
  this.handleUnlike = this.handleUnlike.bind(this);
  this.handleRepost = this.handleRepost.bind(this);
  this.handleUnrepost = this.handleUnrepost.bind(this);
}

// Inherit from Component
PostDetailView.prototype = Object.create(Component.prototype);
PostDetailView.prototype.constructor = PostDetailView;

/**
 * Component mounted
 */
PostDetailView.prototype.componentDidMount = function() {
  this.loadPost();
};

/**
 * Component updated
 */
PostDetailView.prototype.componentDidUpdate = function(prevProps) {
  // Reload if post URI changed
  if (this.props.postUri !== prevProps.postUri) {
    this.loadPost();
  }
};

/**
 * Load post and thread
 */
PostDetailView.prototype.loadPost = function() {
  var self = this;
  var apiClient = this.props.apiClient;
  var postUri = this.props.postUri;
  
  if (!apiClient || !postUri) {
    this.setState({
      loading: false,
      error: 'Missing API client or post URI'
    });
    return;
  }
  
  this.setState({ loading: true, error: null });
  
  apiClient.getPost(postUri)
    .then(function(thread) {
      console.log('Thread data:', thread);
      console.log('Thread replies:', thread.replies);
      self.setState({
        thread: thread,
        loading: false,
        error: null
      });
    })
    .catch(function(error) {
      console.error('Failed to load post:', error);
      self.setState({
        loading: false,
        error: error.message || 'Failed to load post'
      });
    });
};

/**
 * Handle retry after error
 */
PostDetailView.prototype.handleRetry = function() {
  this.loadPost();
};

/**
 * Handle post selection (show action menu)
 */
PostDetailView.prototype.handlePostSelect = function(post) {
  this.setState({
    showActionMenu: true,
    selectedPost: post
  });
};

/**
 * Handle close action menu
 */
PostDetailView.prototype.handleCloseActionMenu = function() {
  this.setState({
    showActionMenu: false,
    selectedPost: null
  });
};

/**
 * Handle action from menu
 */
PostDetailView.prototype.handleAction = function(actionId) {
  var post = this.state.selectedPost;
  
  if (!post) {
    return Promise.reject(new Error('No post selected'));
  }
  
  switch (actionId) {
    case 'like':
      return this.handleLike(post);
    case 'unlike':
      return this.handleUnlike(post);
    case 'repost':
      return this.handleRepost(post);
    case 'unrepost':
      return this.handleUnrepost(post);
    case 'reply':
      return this.handleReply(post);
    default:
      return Promise.reject(new Error('Unknown action: ' + actionId));
  }
};

/**
 * Handle like action
 */
PostDetailView.prototype.handleLike = function(post) {
  var apiClient = this.props.apiClient;
  
  if (!apiClient) {
    return Promise.reject(new Error('API client not available'));
  }
  
  return apiClient.likePost(post.uri, post.cid);
};

/**
 * Handle unlike action
 */
PostDetailView.prototype.handleUnlike = function(post) {
  var apiClient = this.props.apiClient;
  var viewer = post.viewer || {};
  
  if (!apiClient || !viewer.like) {
    return Promise.reject(new Error('Cannot unlike'));
  }
  
  return apiClient.unlikePost(viewer.like);
};

/**
 * Handle repost action
 */
PostDetailView.prototype.handleRepost = function(post) {
  var apiClient = this.props.apiClient;
  
  if (!apiClient) {
    return Promise.reject(new Error('API client not available'));
  }
  
  return apiClient.repost(post.uri, post.cid);
};

/**
 * Handle unrepost action
 */
PostDetailView.prototype.handleUnrepost = function(post) {
  var apiClient = this.props.apiClient;
  var viewer = post.viewer || {};
  
  if (!apiClient || !viewer.repost) {
    return Promise.reject(new Error('Cannot unrepost'));
  }
  
  return apiClient.unrepost(viewer.repost);
};

/**
 * Handle reply action
 */
PostDetailView.prototype.handleReply = function(post) {
  var onNavigateToReply = this.props.onNavigateToReply;
  
  if (onNavigateToReply) {
    this.setState({ navigatingToReply: true });
    onNavigateToReply(post);
  }
  
  return Promise.resolve();
};

/**
 * Render reply thread recursively
 */
PostDetailView.prototype.renderReplies = function(replies, level) {
  var self = this;
  
  if (!replies || replies.length === 0) {
    return null;
  }
  
  // Max 3 levels of nesting
  var maxLevel = 3;
  
  return replies.map(function(reply) {
    if (!reply || !reply.post) {
      return null;
    }
    
    var hasReplies = reply.replies && reply.replies.length > 0;
    var showViewMore = level >= maxLevel && hasReplies;
    
    return h('div', {
      key: reply.post.uri,
      className: 'post-detail__reply',
      style: { marginLeft: (level * 16) + 'px' }
    },
      h(PostItem, {
        post: reply.post,
        onSelect: self.handlePostSelect,
        onLike: self.handleLike,
        onUnlike: self.handleUnlike,
        onRepost: self.handleRepost,
        onUnrepost: self.handleUnrepost,
        dataSaverMode: self.props.dataSaverMode
      }),
      
      // Render nested replies if under max level
      level < maxLevel && hasReplies && self.renderReplies(reply.replies, level + 1),
      
      // Show "View more" for deeper threads
      showViewMore && h('div', {
        className: 'post-detail__view-more',
        onClick: function() {
          if (self.props.onNavigateToPost) {
            self.props.onNavigateToPost(reply.post.uri);
          }
        }
      },
        '→ View ' + reply.replies.length + ' more ' + 
        (reply.replies.length === 1 ? 'reply' : 'replies')
      )
    );
  });
};

/**
 * Render component
 */
PostDetailView.prototype.render = function() {
  var loading = this.state.loading;
  var error = this.state.error;
  var thread = this.state.thread;
  var showActionMenu = this.state.showActionMenu;
  var selectedPost = this.state.selectedPost;
  
  // Loading state
  if (loading) {
    return h('div', { className: 'post-detail' },
      h(LoadingIndicator, { message: 'Loading post...' })
    );
  }
  
  // Error state
  if (error) {
    return h('div', { className: 'post-detail' },
      h(ErrorMessage, {
        message: error,
        onRetry: this.handleRetry
      })
    );
  }
  
  // No thread data
  if (!thread || !thread.post) {
    return h('div', { className: 'post-detail' },
      h(ErrorMessage, {
        message: 'Post not found',
        onRetry: this.handleRetry
      })
    );
  }
  
  var post = thread.post;
  var replies = thread.replies || [];
  
  return h('div', { className: 'post-detail' },
    // Main post
    h('div', { className: 'post-detail__main' },
      h(PostItem, {
        post: post,
        onSelect: this.handlePostSelect,
        onLike: this.handleLike,
        onUnlike: this.handleUnlike,
        onRepost: this.handleRepost,
        onUnrepost: this.handleUnrepost,
        dataSaverMode: this.props.dataSaverMode,
        focused: !showActionMenu
      })
    ),
    
    // Reply thread
    replies.length > 0 && h('div', { className: 'post-detail__replies' },
      h('div', { className: 'post-detail__replies-header' },
        'Replies (' + replies.length + ')'
      ),
      this.renderReplies(replies, 1)
    ),
    
    // Empty state for no replies
    replies.length === 0 && h('div', { className: 'post-detail__no-replies' },
      'No replies yet'
    ),
    
    // Action menu overlay
    showActionMenu && h('div', { className: 'post-detail__action-menu-overlay' },
      h(PostActionMenu, {
        post: selectedPost,
        onAction: this.handleAction,
        onClose: this.handleCloseActionMenu
      })
    )
  );
};

export default PostDetailView;
