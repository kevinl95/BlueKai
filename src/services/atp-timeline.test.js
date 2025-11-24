/**
 * Tests for ATP Client Timeline and Post Methods
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
 * Test: Build query string
 */
function testBuildQueryString() {
  var client = new ATPClient();
  
  var qs1 = client.buildQueryString({ limit: 50, cursor: 'abc123' });
  assert(qs1 === '?limit=50&cursor=abc123', 'Builds query string with multiple params');
  
  var qs2 = client.buildQueryString({ limit: 50, cursor: null });
  assert(qs2 === '?limit=50', 'Skips null values');
  
  var qs3 = client.buildQueryString({});
  assert(qs3 === '', 'Returns empty string for no params');
  
  var qs4 = client.buildQueryString({ text: 'hello world' });
  assert(qs4.indexOf('hello%20world') !== -1, 'URL encodes values');
}

/**
 * Test: Create post validation
 */
function testCreatePostValidation() {
  var client = new ATPClient();
  
  // Set mock session
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  return client.createPost({})
    .then(function() {
      assert(false, 'Should reject post without text');
    })
    .catch(function(error) {
      assert(error.message === 'Post text is required', 'Validates post text is required');
    });
}

/**
 * Test: Create post structure
 */
function testCreatePostStructure() {
  var client = new ATPClient();
  
  // Set mock session
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  // Mock the HTTP client to capture the request
  var capturedRequest = null;
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: { uri: 'at://test', cid: 'test' } });
  };
  
  return client.createPost({
    text: 'Hello world',
    reply: {
      parent: { uri: 'at://parent', cid: 'parent-cid' },
      root: { uri: 'at://root', cid: 'root-cid' }
    }
  })
  .then(function() {
    assert(capturedRequest !== null, 'HTTP request made');
    assert(capturedRequest.data.repo === 'did:plc:test', 'Uses session DID');
    assert(capturedRequest.data.collection === 'app.bsky.feed.post', 'Uses correct collection');
    assert(capturedRequest.data.record.text === 'Hello world', 'Includes post text');
    assert(capturedRequest.data.record.reply !== undefined, 'Includes reply reference');
    assert(capturedRequest.data.record.$type === 'app.bsky.feed.post', 'Includes record type');
  });
}

/**
 * Test: Like post structure
 */
function testLikePostStructure() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: { uri: 'at://like', cid: 'like-cid' } });
  };
  
  return client.likePost('at://post/123', 'post-cid-123')
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.collection === 'app.bsky.feed.like', 'Uses like collection');
      assert(capturedRequest.data.record.subject.uri === 'at://post/123', 'Includes post URI');
      assert(capturedRequest.data.record.subject.cid === 'post-cid-123', 'Includes post CID');
      assert(capturedRequest.data.record.$type === 'app.bsky.feed.like', 'Includes record type');
    });
}

/**
 * Test: Unlike post
 */
function testUnlikePost() {
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
  
  return client.unlikePost('at://did:plc:test/app.bsky.feed.like/abc123')
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.collection === 'app.bsky.feed.like', 'Uses like collection');
      assert(capturedRequest.data.rkey === 'abc123', 'Extracts rkey from URI');
    });
}

/**
 * Test: Repost structure
 */
function testRepostStructure() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedRequest = null;
  client.httpClient.post = function(url, data) {
    capturedRequest = { url: url, data: data };
    return Promise.resolve({ data: { uri: 'at://repost', cid: 'repost-cid' } });
  };
  
  return client.repost('at://post/456', 'post-cid-456')
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.collection === 'app.bsky.feed.repost', 'Uses repost collection');
      assert(capturedRequest.data.record.subject.uri === 'at://post/456', 'Includes post URI');
      assert(capturedRequest.data.record.subject.cid === 'post-cid-456', 'Includes post CID');
      assert(capturedRequest.data.record.$type === 'app.bsky.feed.repost', 'Includes record type');
    });
}

/**
 * Test: Unrepost
 */
function testUnrepost() {
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
  
  return client.unrepost('at://did:plc:test/app.bsky.feed.repost/xyz789')
    .then(function() {
      assert(capturedRequest !== null, 'HTTP request made');
      assert(capturedRequest.data.collection === 'app.bsky.feed.repost', 'Uses repost collection');
      assert(capturedRequest.data.rkey === 'xyz789', 'Extracts rkey from URI');
    });
}

/**
 * Test: Get timeline parameters
 */
function testGetTimelineParameters() {
  var client = new ATPClient();
  
  client.session = {
    did: 'did:plc:test',
    accessJwt: 'test-token'
  };
  
  var capturedUrl = null;
  client.httpClient.get = function(url) {
    capturedUrl = url;
    return Promise.resolve({ data: { feed: [], cursor: null } });
  };
  
  return client.getTimeline({ limit: 25, cursor: 'next-page' })
    .then(function(result) {
      assert(capturedUrl.indexOf('limit=25') !== -1, 'Includes limit parameter');
      assert(capturedUrl.indexOf('cursor=next-page') !== -1, 'Includes cursor parameter');
      assert(result.feed !== undefined, 'Returns feed array');
      assert(result.cursor !== undefined, 'Returns cursor');
    });
}

/**
 * Test: Get post
 */
function testGetPost() {
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
        thread: { 
          post: { uri: 'at://test', text: 'Test post' } 
        } 
      } 
    });
  };
  
  return client.getPost('at://test/post/123')
    .then(function(result) {
      assert(capturedUrl.indexOf('uri=at') !== -1, 'Includes URI parameter');
      assert(result.post !== undefined, 'Returns thread data');
    });
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running ATP Client Timeline and Post tests...\n');
  
  testBuildQueryString();
  
  // Async tests
  return testCreatePostValidation()
    .then(function() { return testCreatePostStructure(); })
    .then(function() { return testLikePostStructure(); })
    .then(function() { return testUnlikePost(); })
    .then(function() { return testRepostStructure(); })
    .then(function() { return testUnrepost(); })
    .then(function() { return testGetTimelineParameters(); })
    .then(function() { return testGetPost(); })
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
