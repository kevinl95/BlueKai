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
    
    console.log('Attempting login for handle:', handle.trim());
    
    // Attempt login
    atpClient.login(handle.trim(), password)
      .then(function(session) {
        // Login successful
        console.log('Login successful, session:', session);
        setLoading(false);
        
        // Call onLogin callback with session data
        if (onLogin) {
          console.log('Calling onLogin callback');
          onLogin(session);
        } else {
          console.warn('No onLogin callback provided');
        }
      })
      .catch(function(err) {
        // Login failed
        console.error('Login failed:', err);
        setLoading(false);
        
        // Set the original error object so ErrorMessage can process it properly
        setError(err);
      });
  };
  
  /**
   * Handle retry after error
   */
  var handleRetry = function() {
    setError(null);
    setValidationErrors({});
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
        h('p', { className: 'login-view__subtitle' }, 'BlueSky client for KaiOS')
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
        
        // Error message display
        error && h('div', {
          style: {
            padding: '12px',
            backgroundColor: '#ffebee',
            border: '2px solid #f44336',
            borderRadius: '6px',
            margin: '12px 0',
            fontSize: '14px',
            color: '#d32f2f',
            textAlign: 'center',
            fontWeight: '500'
          }
        }, [
          h('div', { style: { fontSize: '16px', marginBottom: '8px' } }, '⚠️'),
          h('div', { style: { marginBottom: '8px' } }, error.status === 401 ? 'Invalid username or password.' : 'Login failed. Please try again.'),
          h('button', {
            type: 'button',
            onClick: handleRetry,
            style: {
              padding: '6px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }
          }, 'Try Again')
        ]),
        
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
          'Don\'t have an account? ',
          h('a', {
            href: 'https://bsky.app/',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'login-view__signup-link-anchor'
          }, 'Sign up')
        )
      )
    )
  );
}

export default LoginView;
