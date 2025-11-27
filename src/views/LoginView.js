import { h } from 'preact';
import { useState } from 'preact/hooks';
import TextInput from '../components/TextInput.js';
import Button from '../components/Button.js';
import ErrorMessage from '../components/ErrorMessage.js';

/**
 * LoginView - Authentication view for BlueSky login
 * Requirements: 5.1, 5.2, 9.2
 * 
 * @param {Object} props
 * @param {Function} props.onLogin - Callback when login succeeds (receives session data)
 * @param {Object} props.atpClient - ATP client instance
 */
function LoginView(props) {
  var onLogin = props.onLogin;
  var atpClient = props.atpClient;
  
  var _useState = useState('');
  var handle = _useState[0];
  var setHandle = _useState[1];
  
  var _useState2 = useState('');
  var password = _useState2[0];
  var setPassword = _useState2[1];
  
  var _useState3 = useState(false);
  var loading = _useState3[0];
  var setLoading = _useState3[1];
  
  var _useState4 = useState(null);
  var error = _useState4[0];
  var setError = _useState4[1];
  
  var _useState5 = useState({});
  var validationErrors = _useState5[0];
  var setValidationErrors = _useState5[1];
  
  /**
   * Validate form inputs
   * Requirements: 5.2 - Accept BlueSky handle and app password
   * 
   * @returns {boolean} True if valid
   */
  var validateForm = function() {
    var errors = {};
    
    // Validate handle
    if (!handle || handle.trim() === '') {
      errors.handle = 'Handle is required';
    } else if (handle.indexOf('@') === -1 && handle.indexOf('.') === -1) {
      errors.handle = 'Enter a valid handle (e.g., user.bsky.social)';
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password is too short';
    }
    
    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Handle form submission
   * Requirements: 5.1 - Present login screen and authenticate
   * Requirements: 9.2 - Display authentication errors
   */
  var handleSubmit = function(e) {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setValidationErrors({});
    
    // Validate inputs
    if (!validateForm()) {
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    // Attempt login
    atpClient.login(handle.trim(), password)
      .then(function(session) {
        // Login successful
        setLoading(false);
        
        // Call onLogin callback with session data
        if (onLogin) {
          onLogin(session);
        }
      })
      .catch(function(err) {
        // Login failed
        setLoading(false);
        
        // Map error to user-friendly message
        var errorMessage = getLoginErrorMessage(err);
        setError(errorMessage);
      });
  };
  
  /**
   * Handle retry after error
   */
  var handleRetry = function() {
    setError(null);
    setValidationErrors({});
  };
  
  /**
   * Get user-friendly error message for login errors
   * Requirements: 9.2 - Indicate whether issue is credentials or connectivity
   */
  var getLoginErrorMessage = function(err) {
    if (!err) {
      return 'Login failed. Please try again.';
    }
    
    // Network errors
    if (err.message && (
      err.message.indexOf('Network') !== -1 ||
      err.message.indexOf('Failed to fetch') !== -1 ||
      err.message.indexOf('timeout') !== -1
    )) {
      return 'Cannot connect. Check your connection.';
    }
    
    // Authentication errors (401)
    if (err.status === 401 || 
        (err.message && err.message.indexOf('Invalid credentials') !== -1)) {
      return 'Invalid handle or password. Please try again.';
    }
    
    // Rate limiting (429)
    if (err.status === 429) {
      return 'Too many login attempts. Please wait and try again.';
    }
    
    // Server errors (500+)
    if (err.status && err.status >= 500) {
      return 'BlueSky is having issues. Try again later.';
    }
    
    // Generic error
    return err.message || 'Login failed. Please try again.';
  };
  
  return h('div', { className: 'login-view' },
    h('div', { className: 'login-view__container' },
      h('div', { className: 'login-view__header' },
        h('h1', { className: 'login-view__title' }, 'BlueKai'),
        h('p', { className: 'login-view__subtitle' }, 'BlueSky for KaiOS')
      ),
      
      h('form', {
        className: 'login-view__form',
        onSubmit: handleSubmit,
        noValidate: true
      },
        h(TextInput, {
          id: 'login-handle',
          label: 'Handle or Email',
          type: 'text',
          value: handle,
          onChange: setHandle,
          placeholder: 'user.bsky.social or email',
          error: validationErrors.handle,
          required: true,
          showCounter: false
        }),
        
        h(TextInput, {
          id: 'login-password',
          label: 'App Password',
          type: 'password',
          value: password,
          onChange: setPassword,
          placeholder: 'Enter your app password',
          error: validationErrors.password,
          required: true,
          showCounter: false
        }),
        
        error && h(ErrorMessage, {
          error: error,
          onRetry: handleRetry,
          inline: true
        }),
        
        h(Button, {
          type: 'submit',
          loading: loading,
          disabled: loading,
          fullWidth: true,
          variant: 'primary'
        }, 'Log In')
      ),
      
      h('div', { className: 'login-view__footer' },
        h('p', { className: 'login-view__help' },
          'Use your BlueSky handle and app password to log in.'
        ),
        h('p', { className: 'login-view__signup-link' },
          'Don\'t have an account? ',
          h('a', {
            href: 'https://bsky.app/',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'login-view__link'
          }, 'Sign up on Bluesky')
        )
      )
    )
  );
}

export default LoginView;
