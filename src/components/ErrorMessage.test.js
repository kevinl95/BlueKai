/**
 * ErrorMessage Component Tests
 */

// Mock for browser environment
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment - skip component import, test logic only
  var getErrorMessage = function(error) {
    if (!error) return 'An unknown error occurred';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  };
  
  var mapErrorMessage = function(message, error) {
    var errorMap = {
      'NetworkError': 'Cannot connect. Check your connection.',
      'Network request failed': 'Cannot connect. Check your connection.',
      'Unauthorized': 'Login expired. Please sign in again.',
      'Too Many Requests': 'Too many requests. Please wait.',
      'Internal Server Error': 'BlueSky is having issues. Try again later.',
      'QuotaExceededError': 'Storage full. Clearing cache...'
    };
    
    if (errorMap[message]) return errorMap[message];
    
    for (var key in errorMap) {
      if (message.indexOf(key) !== -1) return errorMap[key];
    }
    
    if (error && error.status) {
      if (error.status === 401) return 'Login expired. Please sign in again.';
      if (error.status === 429) return 'Too many requests. Please wait.';
      if (error.status >= 500) return 'BlueSky is having issues. Try again later.';
      if (error.status >= 400) return 'Invalid request. Please try again.';
    }
    
    return message;
  };
}

// Test 1: String error message
function testStringError() {
  console.log('Test 1: String error message');
  var result = getErrorMessage('Custom error message');
  var passed = result === 'Custom error message';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 2: Error object with message
function testErrorObject() {
  console.log('Test 2: Error object with message');
  var error = new Error('Network request failed');
  var result = getErrorMessage(error);
  var passed = result === 'Cannot connect. Check your connection.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 3: Network error mapping
function testNetworkErrorMapping() {
  console.log('Test 3: Network error mapping');
  var result = mapErrorMessage('NetworkError', {});
  var passed = result === 'Cannot connect. Check your connection.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 4: Auth error mapping
function testAuthErrorMapping() {
  console.log('Test 4: Auth error mapping');
  var result = mapErrorMessage('Unauthorized', {});
  var passed = result === 'Login expired. Please sign in again.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 5: Rate limit error mapping
function testRateLimitMapping() {
  console.log('Test 5: Rate limit error mapping');
  var result = mapErrorMessage('Too Many Requests', {});
  var passed = result === 'Too many requests. Please wait.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 6: Server error mapping
function testServerErrorMapping() {
  console.log('Test 6: Server error mapping');
  var result = mapErrorMessage('Internal Server Error', {});
  var passed = result === 'BlueSky is having issues. Try again later.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 7: Storage error mapping
function testStorageErrorMapping() {
  console.log('Test 7: Storage error mapping');
  var result = mapErrorMessage('QuotaExceededError', {});
  var passed = result === 'Storage full. Clearing cache...';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 8: HTTP status code 401
function testStatus401() {
  console.log('Test 8: HTTP status code 401');
  var result = mapErrorMessage('Some error', { status: 401 });
  var passed = result === 'Login expired. Please sign in again.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 9: HTTP status code 429
function testStatus429() {
  console.log('Test 9: HTTP status code 429');
  var result = mapErrorMessage('Some error', { status: 429 });
  var passed = result === 'Too many requests. Please wait.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 10: HTTP status code 500
function testStatus500() {
  console.log('Test 10: HTTP status code 500');
  var result = mapErrorMessage('Some error', { status: 500 });
  var passed = result === 'BlueSky is having issues. Try again later.';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 11: Unknown error
function testUnknownError() {
  console.log('Test 11: Unknown error');
  var result = getErrorMessage(null);
  var passed = result === 'An unknown error occurred';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Test 12: Unmapped error message
function testUnmappedError() {
  console.log('Test 12: Unmapped error message');
  var result = mapErrorMessage('Some random error', {});
  var passed = result === 'Some random error';
  console.log('  Result:', result);
  console.log('  Passed:', passed);
  return passed;
}

// Run all tests
function runErrorMessageTests() {
  console.log('=== ErrorMessage Tests ===');
  var results = [
    testStringError(),
    testErrorObject(),
    testNetworkErrorMapping(),
    testAuthErrorMapping(),
    testRateLimitMapping(),
    testServerErrorMapping(),
    testStorageErrorMapping(),
    testStatus401(),
    testStatus429(),
    testStatus500(),
    testUnknownError(),
    testUnmappedError()
  ];
  
  var passed = results.filter(function(r) { return r; }).length;
  console.log('Tests passed: ' + passed + '/' + results.length);
  return passed === results.length;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runErrorMessageTests: runErrorMessageTests };
}
