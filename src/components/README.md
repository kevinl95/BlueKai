# Base UI Components

This directory contains the base UI components for BlueKai, designed for KaiOS 2.5 compatibility.

## Components

### LoadingIndicator
Simple loading indicator with animated dots.

**Props:**
- `message` (string): Loading message to display (default: "Loading...")
- `size` (string): Size variant - 'small', 'medium', 'large' (default: 'medium')
- `inline` (boolean): Whether to display inline (default: false)

**Usage:**
```javascript
import { h } from 'preact';
import LoadingIndicator from './LoadingIndicator';

h(LoadingIndicator, { message: 'Loading posts...', size: 'medium' })
```

### ErrorMessage
User-friendly error display with optional retry button.

**Props:**
- `error` (string|Error): Error object or message
- `onRetry` (Function): Optional retry callback
- `title` (string): Optional error title (default: "Error")
- `inline` (boolean): Whether to display inline (default: false)

**Features:**
- Maps technical errors to user-friendly messages
- Handles network, auth, rate limit, and server errors
- Supports HTTP status code mapping

**Usage:**
```javascript
import { h } from 'preact';
import ErrorMessage from './ErrorMessage';

h(ErrorMessage, {
  error: 'NetworkError',
  onRetry: function() { console.log('Retry clicked'); }
})
```

### TextInput
Input wrapper with character counter for KaiOS.

**Props:**
- `label` (string): Input label
- `value` (string): Input value
- `onChange` (Function): Change handler
- `maxLength` (number): Maximum character length
- `placeholder` (string): Placeholder text
- `error` (string): Error message
- `multiline` (boolean): Whether to use textarea (default: false)
- `rows` (number): Number of rows for textarea (default: 3)
- `type` (string): Input type (default: 'text')
- `showCounter` (boolean): Whether to show character counter (default: true)
- `required` (boolean): Whether field is required (default: false)
- `id` (string): Input ID (auto-generated if not provided)

**Features:**
- Character counter with max length enforcement
- Error state display
- Support for text input and textarea
- Accessibility attributes

**Usage:**
```javascript
import { h } from 'preact';
import { useState } from 'preact/hooks';
import TextInput from './TextInput';

function MyComponent() {
  var value = useState('')[0];
  var setValue = useState('')[1];
  
  return h(TextInput, {
    label: 'Post content',
    value: value,
    onChange: setValue,
    maxLength: 300,
    multiline: true,
    rows: 4
  });
}
```

### Button
Focusable button with navigation support for KaiOS.

**Props:**
- `onClick` (Function): Click handler
- `children` (string): Button text/content
- `disabled` (boolean): Whether button is disabled (default: false)
- `loading` (boolean): Whether button is in loading state (default: false)
- `variant` (string): Button style - 'primary', 'secondary', 'danger' (default: 'primary')
- `size` (string): Button size - 'small', 'medium', 'large' (default: 'medium')
- `type` (string): Button type - 'button', 'submit', 'reset' (default: 'button')
- `className` (string): Additional CSS classes
- `fullWidth` (boolean): Whether button should take full width (default: false)

**Features:**
- Loading state with spinner
- Disabled state
- Focus indicators with high contrast
- Enter key activation support

**Usage:**
```javascript
import { h } from 'preact';
import Button from './Button';

h(Button, {
  onClick: function() { console.log('Clicked'); },
  variant: 'primary',
  size: 'medium'
}, 'Submit')
```

### Modal
Modal dialog with focus trapping for KaiOS.

**Props:**
- `isOpen` (boolean): Whether modal is open
- `onClose` (Function): Close handler
- `title` (string): Modal title
- `children` (*): Modal content
- `closeOnEscape` (boolean): Whether to close on Escape key (default: true)
- `closeOnBackdrop` (boolean): Whether to close on backdrop click (default: true)
- `size` (string): Modal size - 'small', 'medium', 'large' (default: 'medium')

**Features:**
- Focus trapping within modal
- Close on Escape or Back button (Backspace)
- Close on backdrop click
- Focus restoration on close
- Body scroll prevention when open
- Accessibility attributes

**Usage:**
```javascript
import { h } from 'preact';
import { useState } from 'preact/hooks';
import Modal from './Modal';

function MyComponent() {
  var isOpen = useState(false)[0];
  var setIsOpen = useState(false)[1];
  
  return h(Modal, {
    isOpen: isOpen,
    onClose: function() { setIsOpen(false); },
    title: 'Confirm Action',
    size: 'medium'
  }, 
    h('p', null, 'Are you sure?')
  );
}
```

## Styling

Each component has its own CSS file that should be imported:

```javascript
import './LoadingIndicator.css';
import './ErrorMessage.css';
import './TextInput.css';
import './Button.css';
import './Modal.css';
```

All components are optimized for KaiOS 2.5 with:
- Small screen sizes (240x320)
- High contrast focus indicators
- D-pad navigation support
- Minimal bundle size

## Testing

Each component has a corresponding test file with manual testing instructions. Run tests using the test HTML files in the project root.

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Screen reader compatibility
- High contrast focus indicators (3:1 minimum)
