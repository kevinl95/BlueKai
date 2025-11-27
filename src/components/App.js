import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ATPClient from '../services/atp-client.js';
import LoginView from '../views/LoginView.js';
import SignupView from '../views/SignupView.js';
import TimelineView from '../views/TimelineView.js';
import ComposeView from '../views/ComposeView.js';
import SoftkeyBar from '../navigation/SoftkeyBar.js';

/**
 * Main App Component
 * Manages app state and view routing
 */
function App() {
  var _useState = useState('loading');
  var currentView = _useState[0];
  var setCurrentView = _useState[1];
  
  var _useState2 = useState(null);
  var atpClient = _useState2[0];
  var setAtpClient = _useState2[1];
  
  var _useState3 = useState(null);
  var session = _useState3[0];
  var setSession = _useState3[1];
  
  var _useState4 = useState(null);
  var replyContext = _useState4[0];
  var setReplyContext = _useState4[1];
  
  /**
   * Initialize ATP client and check for existing session
   */
  useEffect(function() {
    var client = new ATPClient({
      baseURL: 'https://bsky.social'
    });
    
    setAtpClient(client);
    
    // Check if user is already logged in
    var existingSession = client.getSession();
    if (existingSession) {
      setSession(existingSession);
      setCurrentView('timeline');
    } else {
      setCurrentView('login');
    }
  }, []);
  
  /**
   * Handle successful login
   */
  var handleLogin = function(sessionData) {
    setSession(sessionData);
    setCurrentView('timeline');
  };
  
  /**
   * Handle successful signup
   */
  var handleSignup = function(sessionData) {
    setSession(sessionData);
    setCurrentView('timeline');
  };
  
  /**
   * Navigate to signup view
   */
  var handleNavigateToSignup = function() {
    setCurrentView('signup');
  };
  
  /**
   * Navigate to login view
   */
  var handleNavigateToLogin = function() {
    setCurrentView('login');
  };
  
  /**
   * Handle logout
   */
  var handleLogout = function() {
    if (atpClient) {
      atpClient.logout();
    }
    setSession(null);
    setCurrentView('login');
  };
  
  /**
   * Navigate to compose view
   */
  var handleCompose = function() {
    setReplyContext(null);
    setCurrentView('compose');
  };
  
  /**
   * Navigate to compose view for reply
   */
  var handleReply = function(post) {
    setReplyContext({
      post: post
    });
    setCurrentView('compose');
  };
  
  /**
   * Handle post submission
   */
  var handlePostSubmit = function(result) {
    console.log('Post created:', result);
    setReplyContext(null);
    setCurrentView('timeline');
  };
  
  /**
   * Handle compose cancel
   */
  var handleComposeCancel = function() {
    setReplyContext(null);
    setCurrentView('timeline');
  };
  
  /**
   * Render loading state
   */
  if (currentView === 'loading') {
    return h('div', { 
      style: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: '10px'
      } 
    },
      h('div', { 
        style: { 
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1da1f2'
        } 
      }, 'BlueKai'),
      h('div', { 
        style: { 
          fontSize: '12px',
          color: '#666'
        } 
      }, 'Loading...')
    );
  }
  
  /**
   * Render login view
   */
  if (currentView === 'login') {
    return h('div', { style: { height: '100%' } },
      h(LoginView, {
        atpClient: atpClient,
        onLogin: handleLogin,
        onNavigateToSignup: handleNavigateToSignup
      })
    );
  }
  
  /**
   * Render signup view
   */
  if (currentView === 'signup') {
    return h('div', { style: { height: '100%' } },
      h(SignupView, {
        atpClient: atpClient,
        onSignup: handleSignup,
        onNavigateToLogin: handleNavigateToLogin
      })
    );
  }
  
  /**
   * Render timeline view
   */
  if (currentView === 'timeline') {
    return h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column' } },
      h(TimelineView, {
        atpClient: atpClient,
        onReply: handleReply
      }),
      h(SoftkeyBar, {
        left: { label: 'Logout', action: handleLogout },
        center: { label: 'Compose', action: handleCompose },
        right: { label: 'Refresh', action: function() { 
          setCurrentView('loading');
          setTimeout(function() { setCurrentView('timeline'); }, 100);
        }}
      })
    );
  }
  
  /**
   * Render compose view
   */
  if (currentView === 'compose') {
    return h('div', { style: { height: '100%' } },
      h(ComposeView, {
        atpClient: atpClient,
        replyTo: replyContext,
        onSubmit: handlePostSubmit,
        onCancel: handleComposeCancel
      })
    );
  }
  
  // Fallback
  return h('div', { style: { padding: '20px', textAlign: 'center' } },
    h('h1', null, 'BlueKai'),
    h('p', null, 'Unknown view: ' + currentView)
  );
}

export default App;
