/**
 * Tests for ATP Client Authentication
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
 * Create mock JWT token
 */
function createMockJWT(expiresIn) {
  var header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  var exp = Math.floor((Date.now() + expiresIn) / 1000);
  var payload = btoa(JSON.stringify({ exp: exp, sub: 'did:plc:test' }));
  var signature = 'mock-signature';
  
  return header + '.' + payload + '.' + signature;
}

/**
 * Test: ATPClient constructor
 */
function testConstructor() {
  var client = new ATPClient({
    baseURL: 'https://test.bsky.social',
    timeout: 5000
  });
  
  assert(client.config.baseURL === 'https://test.bsky.social', 'Constructor sets baseURL');
  assert(client.config.timeout === 5000, 'Constructor sets timeout');
  assert(client.session === null, 'Initial session is null');
}

/**
 * Test: Calculate token expiry
 */
function testCalculateTokenExpiry() {
  var client = new ATPClient();
  
  // Create JWT that expires in 1 hour
  var jwt = createMockJWT(60 * 60 * 1000);
  var expiry = client.calculateTokenExpiry(jwt);
  
  var expectedExpiry = Date.now() + (60 * 60 * 1000);
  var diff = Math.abs(expiry - expectedExpiry);
  
  assert(diff < 5000, 'Token expiry calculated correctly (within 5s)');
}

/**
 * Test: Should refresh token
 */
function testShouldRefreshToken() {
  var client = new ATPClient();
  
  // No session
  assert(!client.shouldRefreshToken(), 'Returns false when no session');
  
  // Session expiring soon
  client.session = {
    accessJwt: 'test',
    expiresAt: Date.now() + (2 * 60 * 1000) // 2 minutes
  };
  assert(client.shouldRefreshToken(), 'Returns true when token expires soon');
  
  // Session with plenty of time
  client.session.expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes
  assert(!client.shouldRefreshToken(), 'Returns false when token has time');
}

/**
 * Test: Is authenticated
 */
function testIsAuthenticated() {
  var client = new ATPClient();
  
  assert(!client.isAuthenticated(), 'Not authenticated initially');
  
  client.session = {
    accessJwt: 'test-token',
    handle: 'test.bsky.social'
  };
  
  assert(client.isAuthenticated(), 'Authenticated with session');
}

/**
 * Test: Get session
 */
function testGetSession() {
  var client = new ATPClient();
  
  assert(client.getSession() === null, 'Returns null when no session');
  
  var mockSession = {
    accessJwt: 'test-token',
    handle: 'test.bsky.social'
  };
  
  client.session = mockSession;
  assert(client.getSession() === mockSession, 'Returns current session');
}

/**
 * Test: Logout
 */
function testLogout() {
  var client = new ATPClient();
  
  client.session = {
    accessJwt: 'test-token',
    handle: 'test.bsky.social'
  };
  
  return client.logout()
    .then(function() {
      assert(client.session === null, 'Session cleared after logout');
      assert(!client.isAuthenticated(), 'Not authenticated after logout');
    });
}

/**
 * Test: Add auth header to config
 */
function testAddAuthHeaderToConfig() {
  var client = new ATPClient();
  
  client.session = {
    accessJwt: 'test-token-123'
  };
  
  var config = { url: '/test' };
  var modifiedConfig = client.addAuthHeaderToConfig(config);
  
  assert(modifiedConfig.headers !== undefined, 'Headers object created');
  assert(
    modifiedConfig.headers['Authorization'] === 'Bearer test-token-123',
    'Authorization header added correctly'
  );
}

/**
 * Test: Session storage and restoration
 */
function testSessionStorage() {
  // Clear any existing session
  localStorage.removeItem('bluekai_session');
  
  var client1 = new ATPClient();
  
  // Manually set session
  client1.session = {
    accessJwt: 'test-token',
    refreshJwt: 'refresh-token',
    handle: 'test.bsky.social',
    did: 'did:plc:test',
    expiresAt: Date.now() + (60 * 60 * 1000)
  };
  
  // Store it
  client1.storage.set('session', client1.session);
  
  // Create new client instance
  var client2 = new ATPClient();
  
  assert(client2.session !== null, 'Session restored from storage');
  assert(client2.session.handle === 'test.bsky.social', 'Session data restored correctly');
  
  // Cleanup
  localStorage.removeItem('bluekai_session');
}

/**
 * Test: Expired session not restored
 */
function testExpiredSessionNotRestored() {
  // Clear any existing session
  localStorage.removeItem('bluekai_session');
  
  var client1 = new ATPClient();
  
  // Set expired session
  client1.session = {
    accessJwt: 'test-token',
    refreshJwt: 'refresh-token',
    handle: 'test.bsky.social',
    did: 'did:plc:test',
    expiresAt: Date.now() - 1000 // Expired 1 second ago
  };
  
  client1.storage.set('session', client1.session);
  
  // Create new client instance
  var client2 = new ATPClient();
  
  assert(client2.session === null, 'Expired session not restored');
  
  // Cleanup
  localStorage.removeItem('bluekai_session');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running ATP Client Authentication tests...\n');
  
  testConstructor();
  testCalculateTokenExpiry();
  testShouldRefreshToken();
  testIsAuthenticated();
  testGetSession();
  testAddAuthHeaderToConfig();
  testSessionStorage();
  testExpiredSessionNotRestored();
  
  // Async tests
  return testLogout()
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
