/**
 * Integration test for offline support
 * Tests that all offline components work together
 */

console.log('Testing Offline Support Integration...\n');

// Test 1: Network status utility exists and works
console.log('Test 1: Network Status Utility');
try {
  var networkStatus = require('./src/utils/network-status.js');
  console.log('  ✓ Network status module loaded');
  
  var status = networkStatus.getStatus();
  console.log('  ✓ getStatus() returns:', status);
  
  var unsubscribe = networkStatus.subscribe(function(isOnline) {
    console.log('  ✓ Subscription callback works');
  });
  console.log('  ✓ subscribe() returns unsubscribe function');
  
  networkStatus.handleOffline();
  console.log('  ✓ handleOffline() executed');
  
  networkStatus.handleOnline();
  console.log('  ✓ handleOnline() executed');
  
  unsubscribe();
  console.log('  ✓ unsubscribe() executed');
  
  console.log('✓ Network Status Utility: PASS\n');
} catch (error) {
  console.error('✗ Network Status Utility: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

// Test 2: State actions include network actions
console.log('Test 2: State Actions');
try {
  var actions = require('./src/state/actions.js');
  
  if (!actions.ActionTypes.NETWORK_STATUS_CHANGE) {
    throw new Error('NETWORK_STATUS_CHANGE action type missing');
  }
  console.log('  ✓ NETWORK_STATUS_CHANGE action type exists');
  
  if (!actions.networkStatusChange) {
    throw new Error('networkStatusChange action creator missing');
  }
  console.log('  ✓ networkStatusChange action creator exists');
  
  var action = actions.networkStatusChange(false);
  if (action.type !== actions.ActionTypes.NETWORK_STATUS_CHANGE) {
    throw new Error('Action type mismatch');
  }
  console.log('  ✓ networkStatusChange creates correct action');
  
  console.log('✓ State Actions: PASS\n');
} catch (error) {
  console.error('✗ State Actions: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

// Test 3: Reducer handles network actions
console.log('Test 3: State Reducer');
try {
  var reducer = require('./src/state/reducer.js').reducer;
  var ActionTypes = require('./src/state/actions.js').ActionTypes;
  var initialState = require('./src/state/app-state.js').initialState;
  
  var state = reducer(initialState, {
    type: ActionTypes.NETWORK_STATUS_CHANGE,
    payload: {
      isOnline: false,
      lastOnlineAt: null
    }
  });
  
  if (state.network.isOnline !== false) {
    throw new Error('Network status not updated in state');
  }
  console.log('  ✓ Reducer handles NETWORK_STATUS_CHANGE');
  
  console.log('✓ State Reducer: PASS\n');
} catch (error) {
  console.error('✗ State Reducer: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

// Test 4: HTTP client imports network status
console.log('Test 4: HTTP Client Integration');
try {
  // Just verify the file can be loaded (it uses ES6 imports)
  var fs = require('fs');
  var httpClientCode = fs.readFileSync('./src/services/http-client.js', 'utf8');
  
  if (httpClientCode.indexOf('network-status') === -1) {
    throw new Error('HTTP client does not import network-status');
  }
  console.log('  ✓ HTTP client imports network-status');
  
  if (httpClientCode.indexOf('networkStatus.getStatus()') === -1) {
    throw new Error('HTTP client does not check network status');
  }
  console.log('  ✓ HTTP client checks network status before requests');
  
  console.log('✓ HTTP Client Integration: PASS\n');
} catch (error) {
  console.error('✗ HTTP Client Integration: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

// Test 5: Error messages include offline messages
console.log('Test 5: Error Messages');
try {
  var fs = require('fs');
  var errorMessageCode = fs.readFileSync('./src/components/ErrorMessage.js', 'utf8');
  
  if (errorMessageCode.indexOf('No network connection') === -1) {
    throw new Error('Error message mapping missing offline message');
  }
  console.log('  ✓ Error messages include offline-specific text');
  
  console.log('✓ Error Messages: PASS\n');
} catch (error) {
  console.error('✗ Error Messages: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

// Test 6: OfflineIndicator component exists
console.log('Test 6: OfflineIndicator Component');
try {
  var fs = require('fs');
  var offlineIndicatorCode = fs.readFileSync('./src/components/OfflineIndicator.js', 'utf8');
  
  if (offlineIndicatorCode.indexOf('offline-indicator') === -1) {
    throw new Error('OfflineIndicator component missing className');
  }
  console.log('  ✓ OfflineIndicator component exists');
  
  var offlineIndicatorCSS = fs.readFileSync('./src/components/OfflineIndicator.css', 'utf8');
  if (offlineIndicatorCSS.indexOf('.offline-indicator') === -1) {
    throw new Error('OfflineIndicator CSS missing');
  }
  console.log('  ✓ OfflineIndicator CSS exists');
  
  console.log('✓ OfflineIndicator Component: PASS\n');
} catch (error) {
  console.error('✗ OfflineIndicator Component: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

// Test 7: App component integrates offline support
console.log('Test 7: App Component Integration');
try {
  var fs = require('fs');
  var appCode = fs.readFileSync('./src/components/App.js', 'utf8');
  
  if (appCode.indexOf('OfflineIndicator') === -1) {
    throw new Error('App does not import OfflineIndicator');
  }
  console.log('  ✓ App imports OfflineIndicator');
  
  if (appCode.indexOf('network-status') === -1) {
    throw new Error('App does not import network-status');
  }
  console.log('  ✓ App imports network-status');
  
  if (appCode.indexOf('networkStatus.subscribe') === -1) {
    throw new Error('App does not subscribe to network status');
  }
  console.log('  ✓ App subscribes to network status changes');
  
  console.log('✓ App Component Integration: PASS\n');
} catch (error) {
  console.error('✗ App Component Integration: FAIL');
  console.error('  Error:', error.message);
  process.exit(1);
}

console.log('='.repeat(60));
console.log('✓ All offline support integration tests passed!');
console.log('='.repeat(60));
