/**
 * Tests for ATP Client Profile Methods
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
 * Test: Get profile
 */
function testGetProfile() {
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
        did: 'did:plc:test',
        handle: 'test.bsky.social',
        displayName: 'Test User',
        description: 'Test bio'
      } 
    });
  };
  
  return client.getProfile('test.bsky.social')
    .then(function(profile) {
      assert(capturedUrl.indexOf('actor=test.bsky.social') !== -1, 'Includes actor parameter');
      assert(profile.handle === 'test.bsky.social', 'Returns profile data');
      assert(profile.displayName === 'Test User', 'Returns display name');
    });
}

/**
 * Test: Update profile structure
 */
function testUpdateProfileStructure() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  
  // Mock getProfile to return current profile
  client.getProfile = function() {
    return Promise.resolve({
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Old Name',
      description: 'Old bio',
      avatar: 'https://example.com/avatar.jpg'
    });
  };
  
  // Mock HTTP client
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: { uri: 'at://profile', cid: 'profile-cid' } });
  };
  
  return client.updateProfile({
    displayName: 'New Name',
    description: 'New bio'
  })
  .then(function() {
    assert(capturedRequest !== null, 'HTTP request made');
    assert(capturedRequest.data.collection === 'app.bsky.actor.profile', 'Uses profile collection');
    assert(capturedRequest.data.rkey === 'self', 'Uses "self" rkey');
    assert(capturedRequest.data.record.displayName === 'New Name', 'Updates display name');
    assert(capturedRequest.data.record.description === 'New bio', 'Updates description');
    assert(capturedRequest.data.record.avatar === 'https://example.com/avatar.jpg', 'Preserves avatar');
    assert(capturedRequest.data.record.$type === 'app.bsky.actor.profile', 'Includes record type');
  });
}

/**
 * Test: Update profile partial updates
 */
function testUpdateProfilePartial() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  
  // Mock getProfile
  client.getProfile = function() {
    return Promise.resolve({
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Current Name',
      description: 'Current bio'
    });
  };
  
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: {} });
  };
  
  // Update only display name
  return client.updateProfile({ displayName: 'Updated Name' })
    .then(function() {
      assert(capturedRequest.data.record.displayName === 'Updated Name', 'Updates display name');
      assert(capturedRequest.data.record.description === 'Current bio', 'Preserves description');
    });
}

/**
 * Test: Follow user structure
 */
function testFollowStructure() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: { uri: 'at://follow', cid: 'follow-cid' } });
  };
  
  return client.follow('did:plc:other-user')
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.collection === 'app.bsky.graph.follow', 'Uses follow collection');
      assert(capturedRequest.data.record.subject === 'did:plc:other-user', 'Includes subject DID');
      assert(capturedRequest.data.record.$type === 'app.bsky.graph.follow', 'Includes record type');
      assert(capturedRequest.data.record.createdAt !== undefined, 'Includes timestamp');
    });
}

/**
 * Test: Unfollow user
 */
function testUnfollow() {
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
  
  return client.unfollow('at://did:plc:test/app.bsky.graph.follow/follow123')
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.collection === 'app.bsky.graph.follow', 'Uses follow collection');
      assert(capturedRequest.data.rkey === 'follow123', 'Extracts rkey from URI');
    });
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running ATP Client Profile tests...\n');
  
  // Async tests
  return testGetProfile()
    .then(function() { return testUpdateProfileStructure(); })
    .then(function() { return testUpdateProfilePartial(); })
    .then(function() { return testFollowStructure(); })
    .then(function() { return testUnfollow(); })
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
