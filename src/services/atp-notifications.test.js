/**
 * Tests for ATP Client Notification Methods
 * Compatible with Gecko 48
 */

import ATPClient from './atp-client.js';

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
 * Test: Get notifications
 */
function testGetNotifications() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedUrl = null;
  client.httpClient.get = function(url) {
    capturedUrl = url;
    return Promise.resolve({ 
      data: { 
        notifications: [
          { uri: 'at://notif1', reason: 'like' },
          { uri: 'at://notif2', reason: 'follow' }
        ],
        cursor: 'next-cursor',
        seenAt: '2025-11-23T12:00:00.000Z'
      } 
    });
  };
  
  return client.getNotifications({ limit: 25, cursor: 'page2' })
    .then(function(result) {
      assert(capturedUrl.indexOf('limit=25') !== -1, 'Includes limit parameter');
      assert(capturedUrl.indexOf('cursor=page2') !== -1, 'Includes cursor parameter');
      assert(result.notifications.length === 2, 'Returns notifications array');
      assert(result.cursor === 'next-cursor', 'Returns cursor');
      assert(result.seenAt !== undefined, 'Returns seenAt timestamp');
    });
}

/**
 * Test: Get notifications default parameters
 */
function testGetNotificationsDefaults() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedUrl = null;
  client.httpClient.get = function(url) {
    capturedUrl = url;
    return Promise.resolve({ 
      data: { 
        notifications: [],
        cursor: null
      } 
    });
  };
  
  return client.getNotifications()
    .then(function(result) {
      assert(capturedUrl.indexOf('limit=50') !== -1, 'Uses default limit of 50');
      assert(result.notifications !== undefined, 'Returns notifications array');
    });
}

/**
 * Test: Get notification count
 */
function testGetNotificationCount() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedUrl = null;
  client.httpClient.get = function(url) {
    capturedUrl = url;
    return Promise.resolve({ 
      data: { 
        count: 5
      } 
    });
  };
  
  return client.getNotificationCount()
    .then(function(result) {
      assert(capturedUrl.indexOf('getUnreadCount') !== -1, 'Calls correct endpoint');
      assert(result.count === 5, 'Returns count');
    });
}

/**
 * Test: Get notification count with seenAt
 */
function testGetNotificationCountWithSeenAt() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedUrl = null;
  client.httpClient.get = function(url) {
    capturedUrl = url;
    return Promise.resolve({ 
      data: { 
        count: 3
      } 
    });
  };
  
  return client.getNotificationCount({ seenAt: '2025-11-23T10:00:00.000Z' })
    .then(function(result) {
      assert(capturedUrl.indexOf('seenAt=2025-11-23') !== -1, 'Includes seenAt parameter');
      assert(result.count === 3, 'Returns count');
    });
}

/**
 * Test: Update seen notifications
 */
function testUpdateSeenNotifications() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: {} });
  };
  
  var timestamp = '2025-11-23T12:30:00.000Z';
  
  return client.updateSeenNotifications(timestamp)
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.url.indexOf('updateSeen') !== -1, 'Calls correct endpoint');
      assert(capturedRequest.data.seenAt === timestamp, 'Includes seenAt timestamp');
    });
}

/**
 * Test: Update seen notifications with default timestamp
 */
function testUpdateSeenNotificationsDefault() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: {} });
  };
  
  var beforeCall = new Date().toISOString();
  
  return client.updateSeenNotifications()
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.seenAt !== undefined, 'Includes seenAt timestamp');
      
      // Check that timestamp is recent (within 1 second)
      var seenAt = new Date(capturedRequest.data.seenAt);
      var before = new Date(beforeCall);
      var diff = Math.abs(seenAt - before);
      
      assert(diff < 1000, 'Uses current timestamp when not provided');
    });
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running ATP Client Notification tests...\n');
  
  // Async tests
  return testGetNotifications()
    .then(function() { return testGetNotificationsDefaults(); })
    .then(function() { return testGetNotificationCount(); })
    .then(function() { return testGetNotificationCountWithSeenAt(); })
    .then(function() { return testUpdateSeenNotifications(); })
    .then(function() { return testUpdateSeenNotificationsDefault(); })
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
