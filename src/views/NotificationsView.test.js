/**
 * Tests for NotificationsView Component
 * Compatible with Gecko 48
 */

import { h, render } from 'preact';
import NotificationsView from './NotificationsView.js';

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
 * Create mock ATP client
 */
function createMockClient(notifications, error) {
  return {
    getNotifications: function(options) {
      if (error) {
        return Promise.reject(new Error(error));
      }
      
      return Promise.resolve({
        notifications: notifications || [],
        cursor: notifications && notifications.length > 0 ? 'next-cursor' : null,
        seenAt: '2025-11-23T12:00:00.000Z'
      });
    },
    updateSeenNotifications: function() {
      return Promise.resolve({});
    }
  };
}

/**
 * Test: Renders loading state initially
 */
function testRenderLoadingState() {
  var container = document.createElement('div');
  
  var mockClient = createMockClient([]);
  
  render(h(NotificationsView, { atpClient: mockClient }), container);
  
  var loadingIndicator = container.querySelector('.loading-indicator');
  assert(loadingIndicator !== null, 'Shows loading indicator initially');
  
  var title = container.querySelector('.notifications-view__title');
  assert(title && title.textContent === 'Notifications', 'Shows title');
}

/**
 * Test: Loads and displays notifications
 */
function testLoadNotifications() {
  var container = document.createElement('div');
  
  var mockNotifications = [
    {
      uri: 'at://notif1',
      reason: 'like',
      author: {
        handle: 'user1.bsky.social',
        displayName: 'User One'
      },
      indexedAt: '2025-11-23T12:00:00.000Z'
    },
    {
      uri: 'at://notif2',
      reason: 'follow',
      author: {
        handle: 'user2.bsky.social',
        displayName: 'User Two'
      },
      indexedAt: '2025-11-23T11:00:00.000Z'
    }
  ];
  
  var mockClient = createMockClient(mockNotifications);
  
  render(h(NotificationsView, { atpClient: mockClient }), container);
  
  // Wait for async load
  return new Promise(function(resolve) {
    setTimeout(function() {
      var notificationItems = container.querySelectorAll('.notification-item');
      assert(notificationItems.length === 2, 'Renders notification items');
      
      var list = container.querySelector('.notifications-view__list');
      assert(list !== null, 'Renders notifications list');
      
      resolve();
    }, 100);
  });
}

/**
 * Test: Displays error state
 */
function testErrorState() {
  var container = document.createElement('div');
  
  var mockClient = createMockClient(null, 'Network error');
  
  render(h(NotificationsView, { atpClient: mockClient }), container);
  
  // Wait for async load
  return new Promise(function(resolve) {
    setTimeout(function() {
      var errorMessage = container.querySelector('.error-message');
      assert(errorMessage !== null, 'Shows error message on failure');
      
      var retryButton = container.querySelector('.error-message__retry');
      assert(retryButton !== null, 'Shows retry button');
      
      resolve();
    }, 100);
  });
}

/**
 * Test: Displays empty state
 */
function testEmptyState() {
  var container = document.createElement('div');
  
  var mockClient = createMockClient([]);
  
  render(h(NotificationsView, { atpClient: mockClient }), container);
  
  // Wait for async load
  return new Promise(function(resolve) {
    setTimeout(function() {
      var emptyState = container.querySelector('.notifications-view__empty');
      assert(emptyState !== null, 'Shows empty state when no notifications');
      
      var emptyText = emptyState.textContent;
      assert(emptyText.indexOf('No notifications') !== -1, 'Shows empty message');
      
      resolve();
    }, 100);
  });
}

/**
 * Test: Handles pagination
 */
function testPagination() {
  var container = document.createElement('div');
  var loadMoreCalled = false;
  
  var mockNotifications = [
    {
      uri: 'at://notif1',
      reason: 'like',
      author: { handle: 'user1.bsky.social', displayName: 'User One' },
      indexedAt: '2025-11-23T12:00:00.000Z'
    }
  ];
  
  var mockClient = {
    getNotifications: function(options) {
      if (options && options.cursor) {
        loadMoreCalled = true;
        return Promise.resolve({
          notifications: [
            {
              uri: 'at://notif2',
              reason: 'follow',
              author: { handle: 'user2.bsky.social', displayName: 'User Two' },
              indexedAt: '2025-11-23T11:00:00.000Z'
            }
          ],
          cursor: null
        });
      }
      
      return Promise.resolve({
        notifications: mockNotifications,
        cursor: 'next-cursor'
      });
    },
    updateSeenNotifications: function() {
      return Promise.resolve({});
    }
  };
  
  var component = render(h(NotificationsView, { atpClient: mockClient }), container);
  
  // Wait for initial load
  return new Promise(function(resolve) {
    setTimeout(function() {
      // Trigger load more
      component.loadMore();
      
      setTimeout(function() {
        assert(loadMoreCalled, 'Calls API with cursor for pagination');
        resolve();
      }, 100);
    }, 100);
  });
}

/**
 * Test: Marks notifications as read
 */
function testMarkAsRead() {
  var container = document.createElement('div');
  var markAsReadCalled = false;
  
  var mockClient = {
    getNotifications: function() {
      return Promise.resolve({
        notifications: [],
        cursor: null
      });
    },
    updateSeenNotifications: function() {
      markAsReadCalled = true;
      return Promise.resolve({});
    }
  };
  
  render(h(NotificationsView, { atpClient: mockClient }), container);
  
  // Wait for component mount
  return new Promise(function(resolve) {
    setTimeout(function() {
      assert(markAsReadCalled, 'Calls updateSeenNotifications on mount');
      resolve();
    }, 100);
  });
}

/**
 * Test: Handles notification selection
 */
function testNotificationSelection() {
  var container = document.createElement('div');
  var navigatedTo = null;
  
  var mockNotifications = [
    {
      uri: 'at://notif1',
      reason: 'follow',
      author: {
        handle: 'user1.bsky.social',
        displayName: 'User One'
      },
      indexedAt: '2025-11-23T12:00:00.000Z'
    }
  ];
  
  var mockClient = createMockClient(mockNotifications);
  
  var onNavigate = function(view, params) {
    navigatedTo = { view: view, params: params };
  };
  
  var component = render(h(NotificationsView, {
    atpClient: mockClient,
    onNavigate: onNavigate
  }), container);
  
  // Wait for load
  return new Promise(function(resolve) {
    setTimeout(function() {
      // Simulate selection
      component.handleSelectNotification(mockNotifications[0]);
      
      assert(navigatedTo !== null, 'Calls onNavigate on selection');
      assert(navigatedTo.view === 'profile', 'Navigates to profile for follow notification');
      assert(navigatedTo.params.handle === 'user1.bsky.social', 'Passes correct handle');
      
      resolve();
    }, 100);
  });
}

/**
 * Test: Handles refresh
 */
function testRefresh() {
  var container = document.createElement('div');
  var loadCount = 0;
  
  var mockClient = {
    getNotifications: function() {
      loadCount++;
      return Promise.resolve({
        notifications: [],
        cursor: null
      });
    },
    updateSeenNotifications: function() {
      return Promise.resolve({});
    }
  };
  
  var component = render(h(NotificationsView, { atpClient: mockClient }), container);
  
  // Wait for initial load
  return new Promise(function(resolve) {
    setTimeout(function() {
      var initialLoadCount = loadCount;
      
      // Trigger refresh
      component.refresh();
      
      setTimeout(function() {
        assert(loadCount > initialLoadCount, 'Reloads notifications on refresh');
        resolve();
      }, 100);
    }, 100);
  });
}

/**
 * Test: Navigation for different notification types
 */
function testNavigationByType() {
  var container = document.createElement('div');
  var navigations = [];
  
  var mockClient = createMockClient([]);
  
  var onNavigate = function(view, params) {
    navigations.push({ view: view, params: params });
  };
  
  var component = render(h(NotificationsView, {
    atpClient: mockClient,
    onNavigate: onNavigate
  }), container);
  
  // Test follow notification
  component.handleSelectNotification({
    reason: 'follow',
    author: { handle: 'user.bsky.social' }
  });
  
  assert(navigations.length === 1, 'Handles follow notification');
  assert(navigations[0].view === 'profile', 'Navigates to profile for follow');
  
  // Test like notification
  component.handleSelectNotification({
    reason: 'like',
    reasonSubject: 'at://post123'
  });
  
  assert(navigations.length === 2, 'Handles like notification');
  assert(navigations[1].view === 'post', 'Navigates to post for like');
  
  // Test reply notification
  component.handleSelectNotification({
    reason: 'reply',
    uri: 'at://reply123'
  });
  
  assert(navigations.length === 3, 'Handles reply notification');
  assert(navigations[2].view === 'post', 'Navigates to post for reply');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running NotificationsView Component tests...\n');
  
  return testRenderLoadingState()
    .then(function() { return testLoadNotifications(); })
    .then(function() { return testErrorState(); })
    .then(function() { return testEmptyState(); })
    .then(function() { return testPagination(); })
    .then(function() { return testMarkAsRead(); })
    .then(function() { return testNotificationSelection(); })
    .then(function() { return testRefresh(); })
    .then(function() { return testNavigationByType(); })
    .then(function() {
      console.log('\n--- Test Results ---');
      console.log('Passed: ' + testResults.passed);
      console.log('Failed: ' + testResults.failed);
      console.log('Total: ' + (testResults.passed + testResults.failed));
      
      return testResults;
    })
    .catch(function(error) {
      console.error('Test error:', error);
      return testResults;
    });
}

// Export for use in test runner
export { runTests, testResults };

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  runTests();
}
