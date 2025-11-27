/**
 * NotificationItem Component
 * Displays a single notification with type, actor info, and timestamp
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 4.7
 */

import { h, Component } from 'preact';
import DateFormatter from '../utils/date-formatter.js';
import TextProcessor from '../utils/text-processor.js';

/**
 * @class NotificationItem
 * @description Component to display a single BlueSky notification
 */
function NotificationItem() {
  Component.call(this);
}

// Inherit from Component
NotificationItem.prototype = Object.create(Component.prototype);
NotificationItem.prototype.constructor = NotificationItem;

/**
 * Get notification icon/symbol based on type
 * @param {string} reason - Notification type
 * @returns {string} Icon character
 */
NotificationItem.prototype.getNotificationIcon = function(reason) {
  var icons = {
    'like': '♥',
    'repost': '↻',
    'follow': '+',
    'reply': '↩',
    'mention': '@',
    'quote': '"'
  };
  
  return icons[reason] || '•';
};

/**
 * Get notification text based on type
 * @param {string} reason - Notification type
 * @param {string} actorName - Actor display name
 * @returns {string} Notification text
 */
NotificationItem.prototype.getNotificationText = function(reason, actorName) {
  var texts = {
    'like': actorName + ' liked your post',
    'repost': actorName + ' reposted your post',
    'follow': actorName + ' followed you',
    'reply': actorName + ' replied to your post',
    'mention': actorName + ' mentioned you',
    'quote': actorName + ' quoted your post'
  };
  
  return texts[reason] || actorName + ' interacted with you';
};

/**
 * Render notification item
 */
NotificationItem.prototype.render = function(props) {
  var notification = props.notification;
  var onSelect = props.onSelect;
  var isFocused = props.isFocused;
  
  if (!notification) {
    return null;
  }
  
  var reason = notification.reason || 'unknown';
  var author = notification.author || {};
  var record = notification.record || {};
  var isRead = notification.isRead || false;
  
  var actorName = author.displayName || author.handle || 'Someone';
  var actorHandle = author.handle || '';
  var timestamp = notification.indexedAt || notification.createdAt || '';
  
  var icon = this.getNotificationIcon(reason);
  var notificationText = this.getNotificationText(reason, actorName);
  
  // Format timestamp
  var formattedTime = '';
  if (timestamp) {
    try {
      formattedTime = DateFormatter.formatRelative(timestamp);
    } catch (e) {
      formattedTime = timestamp;
    }
  }
  
  // Get post content if applicable (for reply, mention, quote)
  var postContent = null;
  if (record && record.text && (reason === 'reply' || reason === 'mention' || reason === 'quote')) {
    var truncatedText = TextProcessor.truncate(record.text, 100);
    postContent = h('div', { class: 'notification-item__content' },
      h('p', { class: 'notification-item__text' }, truncatedText)
    );
  }
  
  // Handle click/selection
  var handleClick = function() {
    if (onSelect) {
      onSelect(notification);
    }
  };
  
  var handleKeyDown = function(e) {
    if (e.key === 'Enter' && onSelect) {
      onSelect(notification);
    }
  };
  
  var className = 'notification-item';
  if (isFocused) {
    className += ' notification-item--focused';
  }
  if (!isRead) {
    className += ' notification-item--unread';
  }
  
  return h('article', {
    class: className,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: isFocused ? 0 : -1,
    'data-notification-uri': notification.uri,
    'data-focusable': 'true',
    role: 'article',
    'aria-label': notificationText + (isRead ? '' : ', unread') + ', ' + formattedTime
  },
    h('header', { class: 'notification-item__header' },
      h('span', { 
        class: 'notification-item__icon',
        'aria-hidden': 'true'
      }, icon),
      h('div', { class: 'notification-item__info' },
        h('div', { class: 'notification-item__actor' },
          h('span', { class: 'notification-item__actor-name' }, actorName),
          actorHandle && h('span', { class: 'notification-item__actor-handle' }, '@' + actorHandle)
        ),
        h('div', { class: 'notification-item__message' }, notificationText)
      ),
      h('span', { class: 'notification-item__time' }, formattedTime)
    ),
    postContent
  );
};

export default NotificationItem;
