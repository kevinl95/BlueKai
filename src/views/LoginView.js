import { h } from 'preact';
import { useState } from 'preact/hooks';
import TextInput from '../components/TextInput.js';
import Button from '../components/Button.js';
import ErrorMessage from '../components/ErrorMessage.js';
import { useTranslation } from '../i18n/useTranslation.js';

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
  
  var _useTranslation = useTranslation();
  var t = _useTranslation.t;
  
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
      errors.handle = t('signup.errors.handleRequired');
    } else if (handle.indexOf('@') === -1 && handle.indexOf('.') === -1) {
      errors.handle = t('signup.errors.handleInvalid');
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.password = t('signup.errors.passwordRequired');
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
      return t('login.error');
    }
    
    // Network errors
    if (err.message && (
      err.message.indexOf('Network') !== -1 ||
      err.message.indexOf('Failed to fetch') !== -1 ||
      err.message.indexOf('timeout') !== -1
    )) {
      return t('login.networkError');
    }
    
    // Authentication errors (401)
    if (err.status === 401 || 
        (err.message && err.message.indexOf('Invalid credentials') !== -1)) {
      return t('login.error');
    }
    
    // Rate limiting (429)
    if (err.status === 429) {
      return t('errors.rateLimited');
    }
    
    // Server errors (500+)
    if (err.status && err.status >= 500) {
      return t('errors.serverError');
    }
    
    // Generic error
    return err.message || t('login.error');
  };
  
  return h('main', { 
    className: 'login-view',
    id: 'main-content',
    role: 'main',
    'aria-label': 'Login'
  },
    h('div', { className: 'login-view__container' },
      h('header', { className: 'login-view__header' },
        h('h1', { className: 'login-view__title' }, t('login.title')),
        h('p', { className: 'login-view__subtitle' }, 'BlueSky for KaiOS')
      ),
      
      h('form', {
        className: 'login-view__form',
        onSubmit: handleSubmit,
        noValidate: true,
        'aria-label': 'Login form'
      },
        h(TextInput, {
          id: 'login-handle',
          label: t('login.handle'),
          type: 'text',
          value: handle,
          onChange: setHandle,
          placeholder: t('login.handlePlaceholder'),
          error: validationErrors.handle,
          required: true,
          showCounter: false,
          autocomplete: 'username',
          autocapitalize: 'off'
        }),
        
        h(TextInput, {
          id: 'login-password',
          label: t('login.password'),
          type: 'password',
          value: password,
          onChange: setPassword,
          placeholder: t('login.passwordPlaceholder'),
          error: validationErrors.password,
          required: true,
          showCounter: false,
          autocomplete: 'current-password'
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
        }, loading ? t('login.loggingIn') : t('login.submit'))
      ),
      
      h('footer', { className: 'login-view__footer' },
        h('p', { className: 'login-view__signup-link' },
          t('login.signupLink')
        )
      )
    )
  );
}

export default LoginView;
