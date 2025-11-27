/**
 * Tests for NotificationItem Component
 * Compatible with Gecko 48
 */

import { h, render } from 'preact';
import NotificationItem from './NotificationItem.js';

// Test results
var testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Assert helper
 */
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ name: message, passed: true });
    console.log('✓ ' + message);
  } else {
    testResults.failed++;
    testResults.tests.push({ name: message, passed: false });
    console.error('✗ ' + message);
  }
}

/**
 * Test: Renders like notification
 */
function testRenderLikeNotification() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif1',
    reason: 'like',
    author: {
      did: 'did:plc:test',
      handle: 'user.bsky.social',
      displayName: 'Test User'
    },
    indexedAt: '2025-11-23T12:00:00.000Z',
    isRead: false
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var element = container.querySelector('.notification-item');
  assert(element !== null, 'Renders notification item');
  
  var icon = container.querySelector('.notification-item__icon');
  assert(icon && icon.textContent === '♥', 'Shows like icon');
  
  var actorName = container.querySelector('.notification-item__actor-name');
  assert(actorName && actorName.textContent === 'Test User', 'Shows actor name');
  
  var message = container.querySelector('.notification-item__message');
  assert(message && message.textContent.indexOf('liked your post') !== -1, 'Shows like message');
  
  var unreadClass = element.className.indexOf('notification-item--unread') !== -1;
  assert(unreadClass, 'Has unread class');
}

/**
 * Test: Renders follow notification
 */
function testRenderFollowNotification() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif2',
    reason: 'follow',
    author: {
      did: 'did:plc:test2',
      handle: 'follower.bsky.social',
      displayName: 'New Follower'
    },
    indexedAt: '2025-11-23T11:00:00.000Z',
    isRead: true
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var icon = container.querySelector('.notification-item__icon');
  assert(icon && icon.textContent === '+', 'Shows follow icon');
  
  var message = container.querySelector('.notification-item__message');
  assert(message && message.textContent.indexOf('followed you') !== -1, 'Shows follow message');
  
  var element = container.querySelector('.notification-item');
  var unreadClass = element.className.indexOf('notification-item--unread') !== -1;
  assert(!unreadClass, 'Does not have unread class when read');
}

/**
 * Test: Renders reply notification with content
 */
function testRenderReplyNotification() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif3',
    reason: 'reply',
    author: {
      did: 'did:plc:test3',
      handle: 'replier.bsky.social',
      displayName: 'Reply User'
    },
    record: {
      text: 'This is a reply to your post with some content'
    },
    indexedAt: '2025-11-23T10:00:00.000Z',
    isRead: false
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var icon = container.querySelector('.notification-item__icon');
  assert(icon && icon.textContent === '↩', 'Shows reply icon');
  
  var message = container.querySelector('.notification-item__message');
  assert(message && message.textContent.indexOf('replied to your post') !== -1, 'Shows reply message');
  
  var content = container.querySelector('.notification-item__content');
  assert(content !== null, 'Shows post content for reply');
  
  var text = container.querySelector('.notification-item__text');
  assert(text && text.textContent.indexOf('This is a reply') !== -1, 'Shows reply text');
}

/**
 * Test: Renders repost notification
 */
function testRenderRepostNotification() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif4',
    reason: 'repost',
    author: {
      did: 'did:plc:test4',
      handle: 'reposter.bsky.social',
      displayName: 'Repost User'
    },
    indexedAt: '2025-11-23T09:00:00.000Z',
    isRead: false
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var icon = container.querySelector('.notification-item__icon');
  assert(icon && icon.textContent === '↻', 'Shows repost icon');
  
  var message = container.querySelector('.notification-item__message');
  assert(message && message.textContent.indexOf('reposted your post') !== -1, 'Shows repost message');
}

/**
 * Test: Renders mention notification
 */
function testRenderMentionNotification() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif5',
    reason: 'mention',
    author: {
      did: 'did:plc:test5',
      handle: 'mentioner.bsky.social',
      displayName: 'Mention User'
    },
    record: {
      text: 'Hey @user check this out!'
    },
    indexedAt: '2025-11-23T08:00:00.000Z',
    isRead: false
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var icon = container.querySelector('.notification-item__icon');
  assert(icon && icon.textContent === '@', 'Shows mention icon');
  
  var message = container.querySelector('.notification-item__message');
  assert(message && message.textContent.indexOf('mentioned you') !== -1, 'Shows mention message');
  
  var content = container.querySelector('.notification-item__content');
  assert(content !== null, 'Shows post content for mention');
}

/**
 * Test: Handles focused state
 */
function testFocusedState() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif6',
    reason: 'like',
    author: {
      handle: 'user.bsky.social',
      displayName: 'Test User'
    },
    indexedAt: '2025-11-23T12:00:00.000Z'
  };
  
  render(h(NotificationItem, { notification: notification, isFocused: true }), container);
  
  var element = container.querySelector('.notification-item');
  var focusedClass = element.className.indexOf('notification-item--focused') !== -1;
  assert(focusedClass, 'Has focused class when isFocused is true');
  
  var tabIndex = element.getAttribute('tabindex');
  assert(tabIndex === '0', 'Has tabindex 0 when focused');
}

/**
 * Test: Handles selection callback
 */
function testSelectionCallback() {
  var container = document.createElement('div');
  var selectedNotification = null;
  
  var notification = {
    uri: 'at://notif7',
    reason: 'follow',
    author: {
      handle: 'user.bsky.social',
      displayName: 'Test User'
    },
    indexedAt: '2025-11-23T12:00:00.000Z'
  };
  
  var onSelect = function(notif) {
    selectedNotification = notif;
  };
  
  render(h(NotificationItem, { notification: notification, onSelect: onSelect }), container);
  
  var element = container.querySelector('.notification-item');
  element.click();
  
  assert(selectedNotification !== null, 'Calls onSelect on click');
  assert(selectedNotification.uri === notification.uri, 'Passes notification to callback');
}

/**
 * Test: Handles missing data gracefully
 */
function testMissingData() {
  var container = document.createElement('div');
  
  var notification = {
    uri: 'at://notif8',
    reason: 'like',
    author: {
      handle: 'user.bsky.social'
      // No displayName
    }
    // No timestamp
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var element = container.querySelector('.notification-item');
  assert(element !== null, 'Renders with missing data');
  
  var actorName = container.querySelector('.notification-item__actor-name');
  assert(actorName && actorName.textContent === 'user.bsky.social', 'Falls back to handle when no displayName');
}

/**
 * Test: Truncates long reply text
 */
function testTruncateLongText() {
  var container = document.createElement('div');
  
  var longText = 'This is a very long reply text that should be truncated because it exceeds the maximum length that we want to display in the notification item preview area';
  
  var notification = {
    uri: 'at://notif9',
    reason: 'reply',
    author: {
      handle: 'user.bsky.social',
      displayName: 'Test User'
    },
    record: {
      text: longText
    },
    indexedAt: '2025-11-23T12:00:00.000Z'
  };
  
  render(h(NotificationItem, { notification: notification }), container);
  
  var text = container.querySelector('.notification-item__text');
  assert(text !== null, 'Shows reply text');
  assert(text.textContent.length < longText.length, 'Truncates long text');
  assert(text.textContent.indexOf('...') !== -1, 'Adds ellipsis to truncated text');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running NotificationItem Component tests...\n');
  
  testRenderLikeNotification();
  testRenderFollowNotification();
  testRenderReplyNotification();
  testRenderRepostNotification();
  testRenderMentionNotification();
  testFocusedState();
  testSelectionCallback();
  testMissingData();
  testTruncateLongText();
  
  console.log('\n--- Test Results ---');
  console.log('Passed: ' + testResults.passed);
  console.log('Failed: ' + testResults.failed);
  console.log('Total: ' + (testResults.passed + testResults.failed));
  
  return testResults;
}

// Export for use in test runner
export { runTests, testResults };

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  runTests();
}
