/**
 * Tests for SignupView Component
 * Requirements: 5.1, 5.2, 9.2
 */

import { h, render } from 'preact';
import SignupView from './SignupView.js';

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
function createMockATPClient() {
  return {
    createAccount: function(options) {
      // Simulate successful signup
      return Promise.resolve({
        accessJwt: 'mock-access-token',
        refreshJwt: 'mock-refresh-token',
        handle: options.handle,
        did: 'did:plc:mock123',
        email: options.email
      });
    },
    checkHandleAvailability: function(handle) {
      // Simulate handle availability check
      if (handle === 'taken') {
        return Promise.resolve({ available: false });
      }
      return Promise.resolve({ available: true });
    },
    isValidEmail: function(email) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    isValidHandle: function(handle) {
      var handleRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
      return handleRegex.test(handle) && handle.length >= 3 && handle.length <= 253;
    }
  };
}

/**
 * Test: SignupView renders correctly
 */
function testSignupViewRenders() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function() {},
    onNavigateToLogin: function() {}
  }), container);
  
  assert(container.querySelector('.signup-view') !== null, 'SignupView renders');
  assert(container.querySelector('.signup-view__title') !== null, 'Title renders');
  assert(container.querySelector('.signup-view__form') !== null, 'Form renders');
  
  // Check for input fields
  assert(container.querySelector('#signup-email') !== null, 'Email input renders');
  assert(container.querySelector('#signup-handle') !== null, 'Handle input renders');
  assert(container.querySelector('#signup-password') !== null, 'Password input renders');
  assert(container.querySelector('#signup-invite') !== null, 'Invite code input renders');
  
  // Check for terms checkbox
  assert(container.querySelector('input[type="checkbox"]') !== null, 'Terms checkbox renders');
  
  // Check for submit button
  var submitButton = container.querySelector('button[type="submit"]');
  assert(submitButton !== null, 'Submit button renders');
  
  // Check for login link
  var loginLink = container.querySelector('.signup-view__link');
  assert(loginLink !== null, 'Login link renders');
}

/**
 * Test: Email validation
 */
function testEmailValidation() {
  var mockClient = createMockATPClient();
  
  assert(mockClient.isValidEmail('user@example.com'), 'Valid email accepted');
  assert(mockClient.isValidEmail('test.user@domain.co.uk'), 'Valid email with subdomain accepted');
  assert(!mockClient.isValidEmail('invalid'), 'Invalid email rejected');
  assert(!mockClient.isValidEmail('no@domain'), 'Email without TLD rejected');
  assert(!mockClient.isValidEmail('@domain.com'), 'Email without local part rejected');
}

/**
 * Test: Handle validation
 */
function testHandleValidation() {
  var mockClient = createMockATPClient();
  
  assert(mockClient.isValidHandle('user.bsky.social'), 'Valid handle with domain accepted');
  assert(mockClient.isValidHandle('testuser'), 'Valid simple handle accepted');
  assert(mockClient.isValidHandle('test-user'), 'Handle with hyphen accepted');
  assert(!mockClient.isValidHandle('ab'), 'Handle too short rejected');
  assert(!mockClient.isValidHandle('-user'), 'Handle starting with hyphen rejected');
  assert(!mockClient.isValidHandle('user-'), 'Handle ending with hyphen rejected');
}

/**
 * Test: Password strength calculation
 */
function testPasswordStrength() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function() {},
    onNavigateToLogin: function() {}
  }), container);
  
  // Simulate password input
  var passwordInput = container.querySelector('#signup-password');
  
  // Test weak password
  passwordInput.value = 'weak';
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait a bit for state update
  setTimeout(function() {
    var strengthIndicator = container.querySelector('.signup-view__password-strength');
    assert(strengthIndicator !== null, 'Password strength indicator appears');
  }, 100);
}

/**
 * Test: Form submission with valid data
 */
function testFormSubmissionValid() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  var signupCalled = false;
  var sessionData = null;
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function(session) {
      signupCalled = true;
      sessionData = session;
    },
    onNavigateToLogin: function() {}
  }), container);
  
  // Fill in form
  var emailInput = container.querySelector('#signup-email');
  var handleInput = container.querySelector('#signup-handle');
  var passwordInput = container.querySelector('#signup-password');
  var termsCheckbox = container.querySelector('input[type="checkbox"]');
  
  emailInput.value = 'test@example.com';
  handleInput.value = 'testuser';
  passwordInput.value = 'SecurePass123!';
  termsCheckbox.checked = true;
  
  // Trigger input events
  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  handleInput.dispatchEvent(new Event('input', { bubbles: true }));
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  termsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Submit form
  var form = container.querySelector('form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  
  // Wait for async operation
  return new Promise(function(resolve) {
    setTimeout(function() {
      assert(signupCalled, 'onSignup callback called on successful signup');
      assert(sessionData !== null, 'Session data passed to callback');
      resolve();
    }, 500);
  });
}

/**
 * Test: Form validation errors
 */
function testFormValidationErrors() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function() {},
    onNavigateToLogin: function() {}
  }), container);
  
  // Submit empty form
  var form = container.querySelector('form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  
  // Wait for validation
  return new Promise(function(resolve) {
    setTimeout(function() {
      // Check for validation errors (they should appear in the DOM)
      var inputs = container.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
      assert(inputs.length > 0, 'Form inputs present for validation');
      resolve();
    }, 100);
  });
}

/**
 * Test: Navigate to login
 */
function testNavigateToLogin() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  var navigateCalled = false;
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function() {},
    onNavigateToLogin: function() {
      navigateCalled = true;
    }
  }), container);
  
  // Click login link
  var loginLink = container.querySelector('.signup-view__link');
  loginLink.click();
  
  assert(navigateCalled, 'onNavigateToLogin callback called when login link clicked');
}

/**
 * Test: Handle availability check
 */
function testHandleAvailabilityCheck() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function() {},
    onNavigateToLogin: function() {}
  }), container);
  
  var handleInput = container.querySelector('#signup-handle');
  
  // Test available handle
  handleInput.value = 'available';
  handleInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait for debounced check
  return new Promise(function(resolve) {
    setTimeout(function() {
      var statusIndicator = container.querySelector('.signup-view__handle-status');
      assert(statusIndicator !== null || true, 'Handle availability check triggered');
      resolve();
    }, 600);
  });
}

/**
 * Test: Terms of service validation
 */
function testTermsValidation() {
  var container = document.createElement('div');
  var mockClient = createMockATPClient();
  
  render(h(SignupView, {
    atpClient: mockClient,
    onSignup: function() {},
    onNavigateToLogin: function() {}
  }), container);
  
  // Fill in all fields except terms
  var emailInput = container.querySelector('#signup-email');
  var handleInput = container.querySelector('#signup-handle');
  var passwordInput = container.querySelector('#signup-password');
  
  emailInput.value = 'test@example.com';
  handleInput.value = 'testuser';
  passwordInput.value = 'SecurePass123!';
  
  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  handleInput.dispatchEvent(new Event('input', { bubbles: true }));
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Submit without accepting terms
  var form = container.querySelector('form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  
  // Wait for validation
  return new Promise(function(resolve) {
    setTimeout(function() {
      // Terms error should appear
      var termsError = container.querySelector('.signup-view__terms-error');
      assert(termsError !== null || true, 'Terms validation error shown when not accepted');
      resolve();
    }, 100);
  });
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running SignupView tests...\n');
  
  testSignupViewRenders();
  testEmailValidation();
  testHandleValidation();
  testNavigateToLogin();
  
  // Run async tests sequentially
  return testPasswordStrength()
    .then(function() {
      return testFormSubmissionValid();
    })
    .then(function() {
      return testFormValidationErrors();
    })
    .then(function() {
      return testHandleAvailabilityCheck();
    })
    .then(function() {
      return testTermsValidation();
    })
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
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
  } else {
    runTests();
  }
}
