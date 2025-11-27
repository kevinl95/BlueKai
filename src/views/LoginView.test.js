/**
 * LoginView Tests
 * Requirements: 5.1, 5.2, 9.2
 */

import { h } from 'preact';
import { render } from 'preact';
import LoginView from './LoginView.js';

/**
 * Test suite for LoginView component
 */
function runLoginViewTests() {
  var results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };
  
  /**
   * Helper to run a test
   */
  function test(name, fn) {
    results.total++;
    try {
      fn();
      results.passed++;
      results.tests.push({ name: name, status: 'PASS' });
      console.log('✓ ' + name);
    } catch (error) {
      results.failed++;
      results.tests.push({ name: name, status: 'FAIL', error: error.message });
      console.error('✗ ' + name);
      console.error('  Error: ' + error.message);
    }
  }
  
  /**
   * Helper to assert equality
   */
  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || 'Expected ' + expected + ' but got ' + actual);
    }
  }
  
  /**
   * Helper to assert truthy
   */
  function assertTrue(value, message) {
    if (!value) {
      throw new Error(message || 'Expected truthy value but got ' + value);
    }
  }
  
  /**
   * Helper to assert falsy
   */
  function assertFalse(value, message) {
    if (value) {
      throw new Error(message || 'Expected falsy value but got ' + value);
    }
  }
  
  /**
   * Mock ATP Client
   */
  function createMockATPClient(options) {
    options = options || {};
    
    return {
      login: function(identifier, password) {
        if (options.shouldFail) {
          return Promise.reject(options.error || new Error('Login failed'));
        }
        
        if (options.delay) {
          return new Promise(function(resolve) {
            setTimeout(function() {
              resolve({
                accessJwt: 'mock-access-token',
                refreshJwt: 'mock-refresh-token',
                handle: identifier,
                did: 'did:plc:mock123',
                email: 'test@example.com'
              });
            }, options.delay);
          });
        }
        
        return Promise.resolve({
          accessJwt: 'mock-access-token',
          refreshJwt: 'mock-refresh-token',
          handle: identifier,
          did: 'did:plc:mock123',
          email: 'test@example.com'
        });
      }
    };
  }
  
  console.log('\n=== LoginView Tests ===\n');
  
  // Test 1: Component renders correctly
  test('renders login form with handle and password inputs', function() {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    var submitButton = container.querySelector('button[type="submit"]');
    
    assertTrue(handleInput !== null, 'Handle input should exist');
    assertTrue(passwordInput !== null, 'Password input should exist');
    assertTrue(submitButton !== null, 'Submit button should exist');
    assertEqual(passwordInput.type, 'password', 'Password input should have type password');
  });
  
  // Test 2: Displays title and subtitle
  test('displays BlueKai title and subtitle', function() {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var title = container.querySelector('.login-view__title');
    var subtitle = container.querySelector('.login-view__subtitle');
    
    assertTrue(title !== null, 'Title should exist');
    assertTrue(subtitle !== null, 'Subtitle should exist');
    assertEqual(title.textContent, 'BlueKai', 'Title should be BlueKai');
  });
  
  // Test 3: Validation - empty handle
  test('shows validation error for empty handle', function(done) {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    // Wait for validation to run
    setTimeout(function() {
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('Handle is required') !== -1, 'Should show handle required error');
      done();
    }, 50);
  });
  
  // Test 4: Validation - empty password
  test('shows validation error for empty password', function(done) {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('Password is required') !== -1, 'Should show password required error');
      done();
    }, 50);
  });
  
  // Test 5: Validation - invalid handle format
  test('shows validation error for invalid handle format', function(done) {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    handleInput.value = 'invalidhandle';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('valid handle') !== -1, 'Should show invalid handle error');
      done();
    }, 50);
  });
  
  // Test 6: Shows loading state during authentication
  test('shows loading state during authentication', function(done) {
    var container = document.createElement('div');
    var mockClient = createMockATPClient({ delay: 100 });
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'test-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var button = container.querySelector('button[type="submit"]');
      assertTrue(button.classList.contains('button--loading'), 'Button should have loading class');
      assertTrue(button.disabled, 'Button should be disabled during loading');
      done();
    }, 50);
  });
  
  // Test 7: Successful login calls onLogin callback
  test('calls onLogin callback on successful authentication', function(done) {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    var loginCalled = false;
    var sessionData = null;
    
    var onLogin = function(session) {
      loginCalled = true;
      sessionData = session;
    };
    
    render(h(LoginView, { atpClient: mockClient, onLogin: onLogin }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'test-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      assertTrue(loginCalled, 'onLogin should be called');
      assertTrue(sessionData !== null, 'Session data should be provided');
      assertEqual(sessionData.handle, 'user.bsky.social', 'Session should have correct handle');
      done();
    }, 100);
  });
  
  // Test 8: Displays authentication error
  test('displays authentication error on login failure', function(done) {
    var container = document.createElement('div');
    var mockError = { status: 401, message: 'Invalid credentials' };
    var mockClient = createMockATPClient({ shouldFail: true, error: mockError });
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'wrong-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var errorMessage = container.querySelector('.error-message');
      assertTrue(errorMessage !== null, 'Error message should be displayed');
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('Invalid handle or password') !== -1, 'Should show invalid credentials error');
      done();
    }, 100);
  });
  
  // Test 9: Displays network error
  test('displays network error message', function(done) {
    var container = document.createElement('div');
    var mockError = { message: 'Network request failed' };
    var mockClient = createMockATPClient({ shouldFail: true, error: mockError });
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'test-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('Cannot connect') !== -1, 'Should show network error');
      done();
    }, 100);
  });
  
  // Test 10: Retry button clears error
  test('retry button clears error message', function(done) {
    var container = document.createElement('div');
    var mockError = { status: 401, message: 'Invalid credentials' };
    var mockClient = createMockATPClient({ shouldFail: true, error: mockError });
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'wrong-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var retryButton = container.querySelector('.error-message__retry');
      assertTrue(retryButton !== null, 'Retry button should exist');
      
      retryButton.click();
      
      setTimeout(function() {
        var errorMessage = container.querySelector('.error-message');
        assertTrue(errorMessage === null, 'Error message should be cleared');
        done();
      }, 50);
    }, 100);
  });
  
  // Test 11: Rate limit error message
  test('displays rate limit error message', function(done) {
    var container = document.createElement('div');
    var mockError = { status: 429, message: 'Too Many Requests' };
    var mockClient = createMockATPClient({ shouldFail: true, error: mockError });
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'test-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('Too many login attempts') !== -1, 'Should show rate limit error');
      done();
    }, 100);
  });
  
  // Test 12: Server error message
  test('displays server error message', function(done) {
    var container = document.createElement('div');
    var mockError = { status: 500, message: 'Internal Server Error' };
    var mockClient = createMockATPClient({ shouldFail: true, error: mockError });
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var handleInput = container.querySelector('#login-handle');
    var passwordInput = container.querySelector('#login-password');
    
    handleInput.value = 'user.bsky.social';
    handleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'test-password';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    var form = container.querySelector('form');
    var submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    setTimeout(function() {
      var errorText = container.textContent;
      assertTrue(errorText.indexOf('BlueSky is having issues') !== -1, 'Should show server error');
      done();
    }, 100);
  });
  
  // Test 13: Signup link is present
  test('displays signup link', function() {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    
    render(h(LoginView, { atpClient: mockClient }), container);
    
    var signupLink = container.querySelector('.login-view__link');
    assertTrue(signupLink !== null, 'Signup link should exist');
    
    var linkText = container.textContent;
    assertTrue(linkText.indexOf('Sign up') !== -1, 'Should show "Sign up" text');
  });
  
  // Test 14: Signup link calls onNavigateToSignup callback
  test('calls onNavigateToSignup callback when signup link clicked', function() {
    var container = document.createElement('div');
    var mockClient = createMockATPClient();
    var navigateCalled = false;
    
    var onNavigateToSignup = function() {
      navigateCalled = true;
    };
    
    render(h(LoginView, { 
      atpClient: mockClient,
      onNavigateToSignup: onNavigateToSignup
    }), container);
    
    var signupLink = container.querySelector('.login-view__link');
    assertTrue(signupLink !== null, 'Signup link should exist');
    
    signupLink.click();
    
    assertTrue(navigateCalled, 'onNavigateToSignup should be called');
  });
  
  console.log('\n=== Test Results ===');
  console.log('Total: ' + results.total);
  console.log('Passed: ' + results.passed);
  console.log('Failed: ' + results.failed);
  console.log('Success Rate: ' + Math.round((results.passed / results.total) * 100) + '%\n');
  
  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runLoginViewTests: runLoginViewTests };
}

export { runLoginViewTests };
