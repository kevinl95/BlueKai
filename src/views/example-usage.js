/**
 * LoginView Example Usage
 * Demonstrates how to use the LoginView component
 */

import { h, render } from 'preact';
import LoginView from './LoginView.js';
import ATPClient from '../services/atp-client.js';
import { loginSuccess } from '../state/actions.js';

/**
 * Example 1: Basic LoginView usage
 */
function example1() {
  console.log('Example 1: Basic LoginView');
  
  // Create ATP client
  var atpClient = new ATPClient({
    baseURL: 'https://bsky.social'
  });
  
  // Handle successful login
  var handleLogin = function(session) {
    console.log('Login successful!');
    console.log('Handle:', session.handle);
    console.log('DID:', session.did);
    
    // Navigate to timeline or update app state
    // dispatch(loginSuccess(session, { handle: session.handle, did: session.did }));
  };
  
  // Render LoginView
  var container = document.getElementById('app');
  render(
    h(LoginView, {
      atpClient: atpClient,
      onLogin: handleLogin
    }),
    container
  );
}

/**
 * Example 2: LoginView with state management integration
 */
function example2() {
  console.log('Example 2: LoginView with state management');
  
  var atpClient = new ATPClient();
  
  // Assuming you have a dispatch function from your state manager
  var dispatch = function(action) {
    console.log('Dispatching action:', action.type);
    // Your state update logic here
  };
  
  var handleLogin = function(session) {
    // Get user profile
    atpClient.getProfile(session.did)
      .then(function(profile) {
        // Dispatch login success action with full user data
        dispatch(loginSuccess(session, {
          did: session.did,
          handle: session.handle,
          displayName: profile.displayName,
          avatar: profile.avatar
        }));
        
        // Navigate to timeline
        window.location.hash = '#/timeline';
      })
      .catch(function(error) {
        console.error('Failed to load profile:', error);
        
        // Still dispatch login with basic info
        dispatch(loginSuccess(session, {
          did: session.did,
          handle: session.handle
        }));
        
        window.location.hash = '#/timeline';
      });
  };
  
  var container = document.getElementById('app');
  render(
    h(LoginView, {
      atpClient: atpClient,
      onLogin: handleLogin
    }),
    container
  );
}

/**
 * Example 3: LoginView with custom error handling
 */
function example3() {
  console.log('Example 3: LoginView with custom error handling');
  
  var atpClient = new ATPClient();
  
  var handleLogin = function(session) {
    console.log('Login successful:', session.handle);
    
    // Store session in localStorage
    try {
      localStorage.setItem('bluekai_session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to store session:', e);
    }
    
    // Redirect to main app
    window.location.href = '/timeline';
  };
  
  var container = document.getElementById('app');
  render(
    h(LoginView, {
      atpClient: atpClient,
      onLogin: handleLogin
    }),
    container
  );
}

/**
 * Example 4: Testing LoginView with mock client
 */
function example4() {
  console.log('Example 4: Testing with mock client');
  
  // Create mock ATP client for testing
  var mockClient = {
    login: function(identifier, password) {
      console.log('Mock login called with:', identifier);
      
      // Simulate network delay
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          if (password === 'wrong') {
            reject({ status: 401, message: 'Invalid credentials' });
          } else {
            resolve({
              accessJwt: 'mock-token',
              refreshJwt: 'mock-refresh',
              handle: identifier,
              did: 'did:plc:mock123',
              email: 'test@example.com'
            });
          }
        }, 1000);
      });
    }
  };
  
  var handleLogin = function(session) {
    console.log('Mock login successful:', session);
  };
  
  var container = document.getElementById('app');
  render(
    h(LoginView, {
      atpClient: mockClient,
      onLogin: handleLogin
    }),
    container
  );
}

// Export examples
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    example1: example1,
    example2: example2,
    example3: example3,
    example4: example4
  };
}

export { example1, example2, example3, example4 };
