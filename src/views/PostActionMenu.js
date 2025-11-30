/**
 * PostActionMenu Component
 * Action menu for post interactions (like, repost, reply)
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 3.1, 3.2, 4.4
 */

import { h, Component } from 'preact';

/**
 * @class PostActionMenu
 * @description Menu component for post actions with D-pad navigation
 */
function PostActionMenu() {
  Component.call(this);
  
  this.state = {
    selectedIndex: 0,
    loading: false,
    feedback: null
  };
  
  this.handleKeyDown = this.handleKeyDown.bind(this);
  this.handleAction = this.handleAction.bind(this);
}

// Inherit from Component
PostActionMenu.prototype = Object.create(Component.prototype);
PostActionMenu.prototype.constructor = PostActionMenu;

/**
 * Component mounted
 */
PostActionMenu.prototype.componentDidMount = function() {
  // Add keyboard listener
  document.addEventListener('keydown', this.handleKeyDown);
};

/**
 * Component will unmount
 */
PostActionMenu.prototype.componentWillUnmount = function() {
  // Remove keyboard listener
  document.removeEventListener('keydown', this.handleKeyDown);
};

/**
 * Handle keyboard navigation
 */
PostActionMenu.prototype.handleKeyDown = function(e) {
  var key = e.key;
  
  // Ignore if loading
  if (this.state.loading) {
    return;
  }
  
  // D-pad navigation
  if (key === 'ArrowUp') {
    e.preventDefault();
    this.moveFocus(-1);
  } else if (key === 'ArrowDown') {
    e.preventDefault();
    this.moveFocus(1);
  } else if (key === 'Enter') {
    e.preventDefault();
    this.handleAction();
  } else if (key === 'Backspace' || key === 'Escape') {
    e.preventDefault();
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
};

/**
 * Move focus up or down
 */
PostActionMenu.prototype.moveFocus = function(direction) {
  var actions = this.getActions();
  var newIndex = this.state.selectedIndex + direction;
  
  // Circular navigation
  if (newIndex < 0) {
    newIndex = actions.length - 1;
  } else if (newIndex >= actions.length) {
    newIndex = 0;
  }
  
  this.setState({ selectedIndex: newIndex });
};

/**
 * Get available actions based on post state
 * Requirements: 2.3, 2.5, 2.6
 */
PostActionMenu.prototype.getActions = function() {
  var post = this.props.post;
  var viewer = post.viewer || {};
  var dataSaverMode = this.props.dataSaverMode || false;
  var imagesLoaded = this.props.imagesLoaded || false;
  
  var actions = [];
  
  // Load images (only show in data saver mode if not already loaded)
  if (dataSaverMode && !imagesLoaded) {
    actions.push({
      id: 'load-images',
      label: 'Load Images',
      icon: '🖼️'
    });
  }
  
  // Like/Unlike
  if (viewer.like) {
    actions.push({
      id: 'unlike',
      label: 'Unlike',
      icon: '💔'
    });
  } else {
    actions.push({
      id: 'like',
      label: 'Like',
      icon: '❤️'
    });
  }
  
  // Repost/Unrepost
  if (viewer.repost) {
    actions.push({
      id: 'unrepost',
      label: 'Undo Repost',
      icon: '↩️'
    });
  } else {
    actions.push({
      id: 'repost',
      label: 'Repost',
      icon: '🔁'
    });
  }
  
  // Reply
  actions.push({
    id: 'reply',
    label: 'Reply',
    icon: '💬'
  });
  
  return actions;
};

/**
 * Handle action execution
 */
PostActionMenu.prototype.handleAction = function() {
  var self = this;
  var actions = this.getActions();
  var selectedAction = actions[this.state.selectedIndex];
  
  if (!selectedAction) {
    console.log('PostActionMenu: No action selected');
    return;
  }
  
  console.log('PostActionMenu: Executing action:', selectedAction.id);
  
  // Set loading state
  this.setState({ loading: true, feedback: null });
  
  // Execute action via callback
  if (this.props.onAction) {
    var promise = this.props.onAction(selectedAction.id);
    
    if (promise && promise.then) {
      promise
        .then(function(result) {
          console.log('PostActionMenu: Action successful:', selectedAction.id, result);
          // Show success feedback
          self.setState({
            loading: false,
            feedback: {
              type: 'success',
              message: selectedAction.label + ' successful'
            }
          });
          
          // Close menu after short delay
          setTimeout(function() {
            if (self.props.onClose) {
              self.props.onClose();
            }
          }, 500);
        })
        .catch(function(error) {
          console.error('PostActionMenu: Action failed:', selectedAction.id, error);
          // Show error feedback
          self.setState({
            loading: false,
            feedback: {
              type: 'error',
              message: error.message || 'Action failed'
            }
          });
        });
    } else {
      // No promise returned, just close
      console.log('PostActionMenu: No promise returned, closing');
      this.setState({ loading: false });
      if (self.props.onClose) {
        self.props.onClose();
      }
    }
  } else {
    console.log('PostActionMenu: No onAction callback provided');
  }
};

/**
 * Render component
 */
PostActionMenu.prototype.render = function() {
  var self = this;
  var actions = this.getActions();
  var selectedIndex = this.state.selectedIndex;
  var loading = this.state.loading;
  var feedback = this.state.feedback;
  
  return h('div', {
    className: 'post-action-menu',
    role: 'menu',
    'aria-label': 'Post actions'
  },
    // Menu header
    h('div', { className: 'post-action-menu__header' },
      'Post Actions'
    ),
    
    // Action list
    h('div', { className: 'post-action-menu__list' },
      actions.map(function(action, index) {
        var isSelected = index === selectedIndex;
        var className = 'post-action-menu__item';
        if (isSelected) {
          className += ' post-action-menu__item--selected';
        }
        if (loading) {
          className += ' post-action-menu__item--disabled';
        }
        
        return h('div', {
          key: action.id,
          className: className,
          role: 'menuitem',
          'aria-selected': isSelected,
          tabIndex: isSelected ? 0 : -1,
          onClick: !loading ? function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('PostActionMenu: Item clicked:', action.id);
            // Set the selected index and execute action
            self.setState({ selectedIndex: index }, function() {
              self.handleAction();
            });
          } : null
        },
          h('span', { className: 'post-action-menu__icon' }, action.icon),
          ' ',
          h('span', { className: 'post-action-menu__label' }, action.label)
        );
      })
    ),
    
    // Loading indicator
    loading && h('div', { className: 'post-action-menu__loading' },
      'Processing...'
    ),
    
    // Feedback message
    feedback && h('div', {
      className: 'post-action-menu__feedback post-action-menu__feedback--' + feedback.type
    },
      feedback.message
    ),
    
    // Instructions
    !loading && !feedback && h('div', { className: 'post-action-menu__instructions' },
      '↑↓ Navigate • Enter Select • Back Close'
    )
  );
};

export default PostActionMenu;
