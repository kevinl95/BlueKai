import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import TextInput from '../components/TextInput.js';
import Button from '../components/Button.js';
import ErrorMessage from '../components/ErrorMessage.js';

/**
 * SignupView - Account creation view for BlueSky signup
 * Requirements: 5.1, 5.2, 9.2
 * 
 * @param {Object} props
 * @param {Function} props.onSignup - Callback when signup succeeds (receives session data)
 * @param {Function} props.onNavigateToLogin - Callback to navigate to login view
 * @param {Object} props.atpClient - ATP client instance
 */
function SignupView(props) {
  var onSignup = props.onSignup;
  var onNavigateToLogin = props.onNavigateToLogin;
  var atpClient = props.atpClient;
  
  var _useState = useState('');
  var email = _useState[0];
  var setEmail = _useState[1];
  
  var _useState2 = useState('');
  var handle = _useState2[0];
  var setHandle = _useState2[1];
  
  var _useState3 = useState('');
  var password = _useState3[0];
  var setPassword = _useState3[1];
  
  var _useState4 = useState('');
  var inviteCode = _useState4[0];
  var setInviteCode = _useState4[1];
  
  var _useState5 = useState(false);
  var acceptedTerms = _useState5[0];
  var setAcceptedTerms = _useState5[1];
  
  var _useState6 = useState(false);
  var loading = _useState6[0];
  var setLoading = _useState6[1];
  
  var _useState7 = useState(null);
  var error = _useState7[0];
  var setError = _useState7[1];
  
  var _useState8 = useState({});
  var validationErrors = _useState8[0];
  var setValidationErrors = _useState8[1];
  
  var _useState9 = useState(null);
  var handleAvailability = _useState9[0];
  var setHandleAvailability = _useState9[1];
  
  var _useState10 = useState(false);
  var checkingHandle = _useState10[0];
  var setCheckingHandle = _useState10[1];
  
  var _useState11 = useState(null);
  var handleCheckTimeout = _useState11[0];
  var setHandleCheckTimeout = _useState11[1];
  
  /**
   * Check handle availability with debouncing
   * Requirements: 5.1 - Add handle availability check
   */
  useEffect(function() {
    // Clear previous timeout
    if (handleCheckTimeout) {
      clearTimeout(handleCheckTimeout);
    }
    
    // Reset availability state
    setHandleAvailability(null);
    
    // Only check if handle is valid format
    if (!handle || handle.length < 3) {
      return;
    }
    
    if (!atpClient.isValidHandle(handle)) {
      return;
    }
    
    // Debounce handle check (wait 500ms after user stops typing)
    var timeout = setTimeout(function() {
      setCheckingHandle(true);
      
      atpClient.checkHandleAvailability(handle)
        .then(function(result) {
          setHandleAvailability(result.available);
          setCheckingHandle(false);
        })
        .catch(function() {
          // If check fails, don't show error, just stop checking
          setCheckingHandle(false);
        });
    }, 500);
    
    setHandleCheckTimeout(timeout);
    
    // Cleanup
    return function() {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [handle]);
  
  /**
   * Calculate password strength
   * Requirements: 5.1 - Implement password strength indicator
   * 
   * @returns {Object} Strength info
   */
  var getPasswordStrength = function() {
    if (!password) {
      return { level: 0, label: '', color: '' };
    }
    
    var strength = 0;
    
    // Length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Contains number
    if (/[0-9]/.test(password)) strength++;
    
    // Contains special character
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
      return { level: 1, label: 'Weak', color: '#dc3545' };
    } else if (strength <= 4) {
      return { level: 2, label: 'Fair', color: '#ffc107' };
    } else {
      return { level: 3, label: 'Strong', color: '#28a745' };
    }
  };
  
  /**
   * Validate form inputs
   * Requirements: 5.2 - Accept email, handle, and password
   * 
   * @returns {boolean} True if valid
   */
  var validateForm = function() {
    var errors = {};
    
    // Validate email
    if (!email || email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!atpClient.isValidEmail(email)) {
      errors.email = 'Enter a valid email address';
    }
    
    // Validate handle
    if (!handle || handle.trim() === '') {
      errors.handle = 'Handle is required';
    } else if (!atpClient.isValidHandle(handle)) {
      errors.handle = 'Handle must be 3-253 characters, alphanumeric with dots/hyphens';
    } else if (handleAvailability === false) {
      errors.handle = 'This handle is already taken';
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Validate terms acceptance
    if (!acceptedTerms) {
      errors.terms = 'You must accept the terms of service';
    }
    
    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Handle form submission
   * Requirements: 5.1 - Create account and authenticate
   * Requirements: 9.2 - Display validation and API errors
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
    
    // Attempt signup
    var signupOptions = {
      email: email.trim(),
      handle: handle.trim(),
      password: password
    };
    
    // Add invite code if provided
    if (inviteCode && inviteCode.trim()) {
      signupOptions.inviteCode = inviteCode.trim();
    }
    
    atpClient.createAccount(signupOptions)
      .then(function(session) {
        // Signup successful
        setLoading(false);
        
        // Call onSignup callback with session data
        if (onSignup) {
          onSignup(session);
        }
      })
      .catch(function(err) {
        // Signup failed
        setLoading(false);
        
        // Map error to user-friendly message
        var errorMessage = getSignupErrorMessage(err);
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
   * Handle navigate to login
   */
  var handleNavigateToLogin = function(e) {
    e.preventDefault();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };
  
  /**
   * Get user-friendly error message for signup errors
   * Requirements: 9.2 - Display validation and API errors
   */
  var getSignupErrorMessage = function(err) {
    if (!err) {
      return 'Signup failed. Please try again.';
    }
    
    // Network errors
    if (err.message && (
      err.message.indexOf('Network') !== -1 ||
      err.message.indexOf('Failed to fetch') !== -1 ||
      err.message.indexOf('timeout') !== -1
    )) {
      return 'Cannot connect. Check your connection.';
    }
    
    // Handle taken
    if (err.message && err.message.indexOf('handle') !== -1) {
      return 'Handle is already taken or invalid.';
    }
    
    // Email error
    if (err.message && err.message.indexOf('email') !== -1) {
      return 'Email is invalid or already in use.';
    }
    
    // Invite code error
    if (err.message && err.message.indexOf('invite') !== -1) {
      return 'Invalid invite code. Check and try again.';
    }
    
    // Rate limiting (429)
    if (err.status === 429) {
      return 'Too many signup attempts. Please wait and try again.';
    }
    
    // Server errors (500+)
    if (err.status && err.status >= 500) {
      return 'BlueSky is having issues. Try again later.';
    }
    
    // Generic error
    return err.message || 'Signup failed. Please try again.';
  };
  
  var passwordStrength = getPasswordStrength();
  
  return h('div', { className: 'signup-view' },
    h('div', { className: 'signup-view__container' },
      h('div', { className: 'signup-view__header' },
        h('h1', { className: 'signup-view__title' }, 'Create Account'),
        h('p', { className: 'signup-view__subtitle' }, 'Join BlueSky on KaiOS')
      ),
      
      h('form', {
        className: 'signup-view__form',
        onSubmit: handleSubmit,
        noValidate: true
      },
        h(TextInput, {
          id: 'signup-email',
          label: 'Email',
          type: 'email',
          value: email,
          onChange: setEmail,
          placeholder: 'your@email.com',
          error: validationErrors.email,
          required: true,
          showCounter: false
        }),
        
        h('div', { className: 'signup-view__handle-field' },
          h(TextInput, {
            id: 'signup-handle',
            label: 'Handle',
            type: 'text',
            value: handle,
            onChange: setHandle,
            placeholder: 'username.bsky.social',
            error: validationErrors.handle,
            required: true,
            showCounter: false
          }),
          
          // Handle availability indicator
          handle.length >= 3 && !validationErrors.handle && h('div', {
            className: 'signup-view__handle-status'
          },
            checkingHandle && h('span', {
              className: 'signup-view__handle-checking'
            }, 'Checking...'),
            
            !checkingHandle && handleAvailability === true && h('span', {
              className: 'signup-view__handle-available',
              style: { color: '#28a745' }
            }, '✓ Available'),
            
            !checkingHandle && handleAvailability === false && h('span', {
              className: 'signup-view__handle-taken',
              style: { color: '#dc3545' }
            }, '✗ Taken')
          )
        ),
        
        h('div', { className: 'signup-view__password-field' },
          h(TextInput, {
            id: 'signup-password',
            label: 'Password',
            type: 'password',
            value: password,
            onChange: setPassword,
            placeholder: 'At least 8 characters',
            error: validationErrors.password,
            required: true,
            showCounter: false
          }),
          
          // Password strength indicator
          password && h('div', {
            className: 'signup-view__password-strength'
          },
            h('div', { className: 'signup-view__password-strength-label' },
              'Strength: ',
              h('span', {
                style: { color: passwordStrength.color, fontWeight: 'bold' }
              }, passwordStrength.label)
            ),
            h('div', { className: 'signup-view__password-strength-bar' },
              h('div', {
                className: 'signup-view__password-strength-fill',
                style: {
                  width: (passwordStrength.level * 33.33) + '%',
                  backgroundColor: passwordStrength.color,
                  height: '4px',
                  transition: 'width 0.3s ease'
                }
              })
            )
          )
        ),
        
        h(TextInput, {
          id: 'signup-invite',
          label: 'Invite Code (optional)',
          type: 'text',
          value: inviteCode,
          onChange: setInviteCode,
          placeholder: 'Enter invite code if you have one',
          showCounter: false
        }),
        
        // Terms of service checkbox
        h('div', { className: 'signup-view__terms' },
          h('label', {
            className: 'signup-view__terms-label',
            style: { display: 'flex', alignItems: 'center', gap: '8px' }
          },
            h('input', {
              type: 'checkbox',
              checked: acceptedTerms,
              onChange: function(e) { setAcceptedTerms(e.target.checked); }
            }),
            h('span', null, 'I accept the BlueSky Terms of Service')
          ),
          validationErrors.terms && h('div', {
            className: 'signup-view__terms-error',
            style: { color: '#dc3545', fontSize: '12px', marginTop: '4px' }
          }, validationErrors.terms)
        ),
        
        error && h(ErrorMessage, {
          error: error,
          onRetry: handleRetry,
          inline: true
        }),
        
        h(Button, {
          type: 'submit',
          loading: loading,
          disabled: loading || checkingHandle,
          fullWidth: true,
          variant: 'primary'
        }, 'Create Account')
      ),
      
      h('div', { className: 'signup-view__footer' },
        h('p', { className: 'signup-view__login-link' },
          'Already have an account? ',
          h('a', {
            href: '#',
            onClick: handleNavigateToLogin,
            className: 'signup-view__link'
          }, 'Log in')
        )
      )
    )
  );
}

export default SignupView;
