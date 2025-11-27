/**
 * Tests for Network Status Utility
 */

var networkStatus = require('./network-status');

function testNetworkStatus() {
  console.log('Testing Network Status Utility...');
  
  var tests = {
    passed: 0,
    failed: 0
  };

  function assert(condition, message) {
    if (condition) {
      tests.passed++;
      console.log('✓ ' + message);
    } else {
      tests.failed++;
      console.error('✗ ' + message);
    }
  }

  // Test 1: Check initial status
  var initialStatus = networkStatus.getStatus();
  assert(
    typeof initialStatus === 'boolean',
    'getStatus returns boolean'
  );

  // Test 2: Subscribe to status changes
  var callbackCalled = false;
  var receivedStatus = null;
  
  var unsubscribe = networkStatus.subscribe(function(isOnline) {
    callbackCalled = true;
    receivedStatus = isOnline;
  });

  assert(
    typeof unsubscribe === 'function',
    'subscribe returns unsubscribe function'
  );

  // Test 3: Simulate offline event
  networkStatus.handleOffline();
  assert(
    callbackCalled === true,
    'callback called on offline event'
  );
  assert(
    receivedStatus === false,
    'callback receives false for offline'
  );
  assert(
    networkStatus.getStatus() === false,
    'status updated to offline'
  );

  // Test 4: Simulate online event
  callbackCalled = false;
  networkStatus.handleOnline();
  assert(
    callbackCalled === true,
    'callback called on online event'
  );
  assert(
    receivedStatus === true,
    'callback receives true for online'
  );
  assert(
    networkStatus.getStatus() === true,
    'status updated to online'
  );

  // Test 5: Unsubscribe
  callbackCalled = false;
  unsubscribe();
  networkStatus.handleOffline();
  assert(
    callbackCalled === false,
    'callback not called after unsubscribe'
  );

  // Test 6: Multiple subscribers
  var callback1Called = false;
  var callback2Called = false;
  
  var unsub1 = networkStatus.subscribe(function() {
    callback1Called = true;
  });
  
  var unsub2 = networkStatus.subscribe(function() {
    callback2Called = true;
  });

  networkStatus.handleOnline();
  assert(
    callback1Called && callback2Called,
    'multiple subscribers all notified'
  );

  // Cleanup
  unsub1();
  unsub2();

  // Reset to online for other tests
  networkStatus.handleOnline();

  console.log('\nNetwork Status Tests: ' + tests.passed + ' passed, ' + tests.failed + ' failed');
  return tests.failed === 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = testNetworkStatus;
}

if (typeof window !== 'undefined') {
  window.testNetworkStatus = testNetworkStatus;
}
