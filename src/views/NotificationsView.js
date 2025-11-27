/**
 * NotificationsView Component
 * Displays the user's notifications with pagination
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 4.7
 */

import { h, Component } from 'preact';
import NotificationItem from './NotificationItem.js';
import LoadingIndicator from '../components/LoadingIndicator.js';
import ErrorMessage from '../components/ErrorMessage.js';
import ATPClient from '../services/atp-client.js';
import NavigationManager from '../navigation/navigation-manager.js';

/**
 * @class NotificationsView
 * @description View that fetches and displays notifications
 */
function NotificationsView(props) {
  return h(NotificationsViewClass, props);
}

function NotificationsViewClass(props) {
  Component.call(this, props);
  
  this.state = {
    notifications: [],
    cursor: null,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: true,
    focusedIndex: 0
  };
  
  // Initialize services
  this.atpClient = props.atpClient || new ATPClient();
  this.navigationManager = null;
  
  // Bind methods
  this.loadNotifications = this.loadNotifications.bind(this);
  this.loadMore = this.loadMore.bind(this);
  this.refresh = this.refresh.bind(this);
  this.handleSelectNotification = this.handleSelectNotification.bind(this);
  this.handleRetry = this.handleRetry.bind(this);
  this.markAsRead = this.markAsRead.bind(this);
  this.handleNavigation = this.handleNavigation.bind(this);
}

// Inherit from Component
NotificationsViewClass.prototype = Object.create(Component.prototype);
NotificationsViewClass.prototype.constructor = NotificationsViewClass;

/**
 * Component lifecycle - mount
 */
NotificationsViewClass.prototype.componentDidMount = function() {
  // Load notifications
  this.loadNotifications();
  
  // Mark notifications as read
  this.markAsRead();
  
  // Set up navigation
  this.setupNavigation();
  
  // Set up softkey actions
  if (this.props.onSoftkeyUpdate) {
    this.props.onSoftkeyUpdate({
      left: { label: 'Refresh', action: this.refresh },
      center: { label: 'Select', action: null },
      right: { label: 'Back', action: this.props.onBack }
    });
  }
};

/**
 * Component lifecycle - unmount
 */
NotificationsViewClass.prototype.componentWillUnmount = function() {
  if (this.navigationManager) {
    this.navigationManager.destroy();
  }
};

/**
 * Set up navigation manager
 */
NotificationsViewClass.prototype.setupNavigation = function() {
  var self = this;
  
  this.navigationManager = new NavigationManager({
    onNavigate: this.handleNavigation,
    onSelect: function() {
      var notification = self.state.notifications[self.state.focusedIndex];
      if (notification) {
        self.handleSelectNotification(notification);
      }
    },
    onBack: this.props.onBack
  });
  
  this.navigationManager.enable();
};

/**
 * Handle navigation events
 */
NotificationsViewClass.prototype.handleNavigation = function(direction) {
  var self = this;
  var notifications = this.state.notifications;
  var currentIndex = this.state.focusedIndex;
  var newIndex = currentIndex;
  
  if (direction === 'down') {
    newIndex = Math.min(currentIndex + 1, notifications.length - 1);
    
    // Load more if near end
    if (newIndex >= notifications.length - 3 && this.state.hasMore && !this.state.loadingMore) {
      this.loadMore();
    }
  } else if (direction === 'up') {
    newIndex = Math.max(currentIndex - 1, 0);
  }
  
  if (newIndex !== currentIndex) {
    this.setState({ focusedIndex: newIndex });
  }
};

/**
 * Load notifications from API
 * Requirements: 4.7 - Fetch and display notifications
 */
NotificationsViewClass.prototype.loadNotifications = function() {
  var self = this;
  
  this.setState({ loading: true, error: null });
  
  this.atpClient.getNotifications({ limit: 30 })
    .then(function(result) {
      self.setState({
        notifications: result.notifications || [],
        cursor: result.cursor,
        hasMore: !!result.cursor,
        loading: false,
        error: null
      });
    })
    .catch(function(error) {
      console.error('Failed to load notifications:', error);
      self.setState({
        loading: false,
        error: error.message || 'Failed to load notifications'
      });
    });
};

/**
 * Load more notifications (pagination)
 * Requirements: 4.7 - Implement pagination
 */
NotificationsViewClass.prototype.loadMore = function() {
  var self = this;
  
  if (!this.state.hasMore || this.state.loadingMore) {
    return;
  }
  
  this.setState({ loadingMore: true });
  
  this.atpClient.getNotifications({
    limit: 30,
    cursor: this.state.cursor
  })
    .then(function(result) {
      var newNotifications = self.state.notifications.concat(result.notifications || []);
      
      self.setState({
        notifications: newNotifications,
        cursor: result.cursor,
        hasMore: !!result.cursor,
        loadingMore: false
      });
    })
    .catch(function(error) {
      console.error('Failed to load more notifications:', error);
      self.setState({
        loadingMore: false
      });
    });
};

/**
 * Refresh notifications
 */
NotificationsViewClass.prototype.refresh = function() {
  this.setState({
    notifications: [],
    cursor: null,
    focusedIndex: 0
  });
  
  this.loadNotifications();
  this.markAsRead();
};

/**
 * Mark notifications as read
 * Requirements: 4.7 - Mark notifications as read on view
 */
NotificationsViewClass.prototype.markAsRead = function() {
  var self = this;
  
  // Update seen timestamp on server
  this.atpClient.updateSeenNotifications()
    .then(function() {
      console.log('Notifications marked as read');
    })
    .catch(function(error) {
      console.error('Failed to mark notifications as read:', error);
    });
};

/**
 * Handle notification selection
 * Requirements: 4.7 - Navigate to related content on selection
 */
NotificationsViewClass.prototype.handleSelectNotification = function(notification) {
  if (!notification) {
    return;
  }
  
  var reason = notification.reason;
  var onNavigate = this.props.onNavigate;
  
  if (!onNavigate) {
    return;
  }
  
  // Navigate based on notification type
  if (reason === 'follow') {
    // Navigate to actor's profile
    if (notification.author && notification.author.handle) {
      onNavigate('profile', { handle: notification.author.handle });
    }
  } else if (reason === 'like' || reason === 'repost') {
    // Navigate to the post that was liked/reposted
    if (notification.reasonSubject) {
      onNavigate('post', { uri: notification.reasonSubject });
    }
  } else if (reason === 'reply' || reason === 'mention' || reason === 'quote') {
    // Navigate to the reply/mention/quote post
    if (notification.uri) {
      onNavigate('post', { uri: notification.uri });
    }
  }
};

/**
 * Handle retry after error
 */
NotificationsViewClass.prototype.handleRetry = function() {
  this.loadNotifications();
};

/**
 * Render notifications view
 */
NotificationsViewClass.prototype.render = function() {
  var self = this;
  var state = this.state;
  
  // Loading state
  if (state.loading && state.notifications.length === 0) {
    return h('main', { 
      class: 'notifications-view',
      id: 'main-content',
      role: 'main',
      'aria-label': 'Notifications'
    },
      h('header', { class: 'notifications-view__header' },
        h('h1', { class: 'notifications-view__title' }, 'Notifications')
      ),
      h(LoadingIndicator, { message: 'Loading notifications...' })
    );
  }
  
  // Error state
  if (state.error && state.notifications.length === 0) {
    return h('main', { 
      class: 'notifications-view',
      id: 'main-content',
      role: 'main',
      'aria-label': 'Notifications'
    },
      h('header', { class: 'notifications-view__header' },
        h('h1', { class: 'notifications-view__title' }, 'Notifications')
      ),
      h(ErrorMessage, {
        message: state.error,
        onRetry: this.handleRetry
      })
    );
  }
  
  // Empty state
  if (state.notifications.length === 0) {
    return h('main', { 
      class: 'notifications-view',
      id: 'main-content',
      role: 'main',
      'aria-label': 'Notifications'
    },
      h('header', { class: 'notifications-view__header' },
        h('h1', { class: 'notifications-view__title' }, 'Notifications')
      ),
      h('div', { class: 'notifications-view__empty' },
        h('p', null, 'No notifications yet')
      )
    );
  }
  
  // Render notifications list
  return h('main', { 
    class: 'notifications-view',
    id: 'main-content',
    role: 'main',
    'aria-label': 'Notifications'
  },
    h('header', { class: 'notifications-view__header' },
      h('h1', { class: 'notifications-view__title' }, 'Notifications')
    ),
    h('div', { 
      class: 'notifications-view__list',
      role: 'list',
      'aria-label': 'Notification list'
    },
      state.notifications.map(function(notification, index) {
        return h(NotificationItem, {
          key: notification.uri || index,
          notification: notification,
          isFocused: index === state.focusedIndex,
          onSelect: self.handleSelectNotification
        });
      })
    ),
    state.loadingMore && h('div', { class: 'notifications-view__loading-more' },
      h(LoadingIndicator, { message: 'Loading more...' })
    )
  );
};

export default NotificationsView;
