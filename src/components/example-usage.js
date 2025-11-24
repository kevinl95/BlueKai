/**
 * Example Usage of Base UI Components
 * This file demonstrates how to use each component
 */

import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import TextInput from './TextInput';
import Button from './Button';
import Modal from './Modal';

// Import CSS
import './LoadingIndicator.css';
import './ErrorMessage.css';
import './TextInput.css';
import './Button.css';
import './Modal.css';

/**
 * Example 1: LoadingIndicator
 */
function LoadingExample() {
  return h('div', null,
    h('h3', null, 'Loading Indicators'),
    h(LoadingIndicator, { message: 'Loading posts...', size: 'small' }),
    h(LoadingIndicator, { message: 'Loading...', size: 'medium' }),
    h(LoadingIndicator, { message: 'Please wait...', size: 'large' }),
    h(LoadingIndicator, { message: 'Inline loading', size: 'small', inline: true })
  );
}

/**
 * Example 2: ErrorMessage
 */
function ErrorExample() {
  var handleRetry = function() {
    console.log('Retry clicked');
    alert('Retrying...');
  };
  
  return h('div', null,
    h('h3', null, 'Error Messages'),
    h(ErrorMessage, { error: 'NetworkError' }),
    h(ErrorMessage, { error: 'Unauthorized', title: 'Authentication Failed' }),
    h(ErrorMessage, { 
      error: 'Failed to load posts', 
      onRetry: handleRetry 
    }),
    h(ErrorMessage, { 
      error: 'Connection issue', 
      inline: true 
    })
  );
}

/**
 * Example 3: TextInput
 */
function TextInputExample() {
  var name = useState('')[0];
  var setName = useState('')[1];
  var bio = useState('')[0];
  var setBio = useState('')[1];
  var password = useState('')[0];
  var setPassword = useState('')[1];
  
  return h('div', null,
    h('h3', null, 'Text Inputs'),
    h(TextInput, {
      label: 'Name',
      value: name,
      onChange: setName,
      placeholder: 'Enter your name',
      required: true
    }),
    h(TextInput, {
      label: 'Bio',
      value: bio,
      onChange: setBio,
      maxLength: 160,
      multiline: true,
      rows: 3,
      placeholder: 'Tell us about yourself'
    }),
    h(TextInput, {
      label: 'Password',
      value: password,
      onChange: setPassword,
      type: 'password',
      placeholder: 'Enter password',
      required: true
    })
  );
}

/**
 * Example 4: Button
 */
function ButtonExample() {
  var loading = useState(false)[0];
  var setLoading = useState(false)[1];
  
  var handleClick = function() {
    console.log('Button clicked');
    alert('Button clicked!');
  };
  
  var handleLoadingClick = function() {
    setLoading(true);
    setTimeout(function() {
      setLoading(false);
    }, 2000);
  };
  
  return h('div', null,
    h('h3', null, 'Buttons'),
    h('div', { style: { marginBottom: '10px' } },
      h(Button, { onClick: handleClick, variant: 'primary' }, 'Primary'),
      ' ',
      h(Button, { onClick: handleClick, variant: 'secondary' }, 'Secondary'),
      ' ',
      h(Button, { onClick: handleClick, variant: 'danger' }, 'Danger')
    ),
    h('div', { style: { marginBottom: '10px' } },
      h(Button, { onClick: handleClick, size: 'small' }, 'Small'),
      ' ',
      h(Button, { onClick: handleClick, size: 'medium' }, 'Medium'),
      ' ',
      h(Button, { onClick: handleClick, size: 'large' }, 'Large')
    ),
    h('div', { style: { marginBottom: '10px' } },
      h(Button, { onClick: handleLoadingClick, loading: loading }, 'Loading'),
      ' ',
      h(Button, { onClick: handleClick, disabled: true }, 'Disabled')
    ),
    h('div', null,
      h(Button, { onClick: handleClick, fullWidth: true }, 'Full Width')
    )
  );
}

/**
 * Example 5: Modal
 */
function ModalExample() {
  var isOpen = useState(false)[0];
  var setIsOpen = useState(false)[1];
  var modalSize = useState('medium')[0];
  var setModalSize = useState('medium')[1];
  
  var openModal = function(size) {
    setModalSize(size);
    setIsOpen(true);
  };
  
  var closeModal = function() {
    setIsOpen(false);
  };
  
  return h('div', null,
    h('h3', null, 'Modal'),
    h('div', null,
      h(Button, { onClick: function() { openModal('small'); } }, 'Small Modal'),
      ' ',
      h(Button, { onClick: function() { openModal('medium'); } }, 'Medium Modal'),
      ' ',
      h(Button, { onClick: function() { openModal('large'); } }, 'Large Modal')
    ),
    h(Modal, {
      isOpen: isOpen,
      onClose: closeModal,
      title: 'Example Modal',
      size: modalSize
    },
      h('p', null, 'This is a modal dialog.'),
      h('p', null, 'Press Escape or click the backdrop to close.'),
      h(Button, { onClick: closeModal, variant: 'primary', fullWidth: true }, 'Close')
    )
  );
}

/**
 * Complete Example App
 */
function ExampleApp() {
  return h('div', { style: { padding: '20px', maxWidth: '320px', margin: '0 auto' } },
    h('h1', null, 'BlueKai Components'),
    h('hr', null),
    h(LoadingExample, null),
    h('hr', null),
    h(ErrorExample, null),
    h('hr', null),
    h(TextInputExample, null),
    h('hr', null),
    h(ButtonExample, null),
    h('hr', null),
    h(ModalExample, null)
  );
}

// Export for use in other files
export default ExampleApp;
export {
  LoadingExample,
  ErrorExample,
  TextInputExample,
  ButtonExample,
  ModalExample
};

// If running directly, render to DOM
if (typeof window !== 'undefined' && document.getElementById('root')) {
  render(h(ExampleApp, null), document.getElementById('root'));
}
