# Navigation System

This directory contains the navigation system for BlueKai, including D-pad navigation, routing, and softkey management for KaiOS devices.

## Components

### NavigationManager

Handles D-pad and softkey input for KaiOS navigation with circular focus management.

**Features:**
- D-pad navigation (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
- Enter key for selection
- Softkey support (SoftLeft/F1, SoftRight/F2)
- Circular navigation (wraps around at list ends)
- Visual focus indicators
- Customizable focus class

**Usage:**

```javascript
var NavigationManager = require('./navigation-manager');

var nav = new NavigationManager({
  onSelect: function(element, index) {
    console.log('Selected:', element, 'at index:', index);
  },
  onSoftLeft: function() {
    console.log('Left softkey pressed');
  },
  onSoftRight: function() {
    console.log('Right softkey pressed');
  },
  circular: true,
  focusClass: 'focused'
});

// Initialize and start listening
nav.init();

// Update focusable elements
var items = document.querySelectorAll('.list-item');
nav.updateFocusableElements(items);

// Update softkey callbacks dynamically
nav.updateSoftkeys({
  onSoftLeft: function() { /* new handler */ },
  onSoftRight: function() { /* new handler */ }
});

// Clean up when done
nav.destroy();
```

**API:**

- `init()` - Start listening for key events
- `destroy()` - Stop listening and clean up
- `updateFocusableElements(elements)` - Set the list of navigable elements
- `moveFocus(direction)` - Move focus by direction (1 or -1)
- `getFocusedElement()` - Get currently focused element
- `getFocusedIndex()` - Get index of focused element
- `setFocusIndex(index)` - Set focus to specific index
- `updateSoftkeys(callbacks)` - Update softkey handlers

### Router

Simple hash-based router for client-side navigation.

**Features:**
- Hash-based routing (#/path)
- Route parameters (/post/:id)
- Navigation history management
- Back navigation support
- Named routes
- Route matching with regex

**Usage:**

```javascript
var Router = require('./router');

var router = new Router();

// Register routes
router.register('/', function(params, path) {
  console.log('Home page');
}, 'home');

router.register('/timeline', function(params, path) {
  console.log('Timeline page');
}, 'timeline');

router.register('/post/:id', function(params, path) {
  console.log('Post page, ID:', params.id);
}, 'post');

// Initialize and start listening
router.init();

// Navigate programmatically
router.navigate('/timeline');
router.navigate('/post/123');

// Navigate to named route
router.navigateToRoute('post', { id: '456' });

// Go back
if (router.canGoBack()) {
  router.back();
}

// Get current route info
var current = router.getCurrentRoute();
console.log('Current path:', current.path);
console.log('Current params:', current.params);

// Clean up when done
router.destroy();
```

**API:**

- `init()` - Start listening for hash changes
- `destroy()` - Stop listening and clean up
- `register(path, handler, name)` - Register a route
- `navigate(path, replace)` - Navigate to a path
- `navigateToRoute(name, params, replace)` - Navigate to named route
- `back()` - Go back in history
- `getCurrentRoute()` - Get current route info
- `getCurrentPath()` - Get current path from hash
- `getHistory()` - Get navigation history
- `canGoBack()` - Check if can go back
- `clearHistory()` - Clear navigation history

### SoftkeyBar

Preact component that displays softkey labels at the bottom of the screen.

**Features:**
- Displays left, center, and right softkey labels
- Fixed positioning at bottom of screen
- Optimized for KaiOS 240x320 display
- Dynamic label updates
- High contrast for readability

**Usage:**

```javascript
var h = require('preact').h;
var SoftkeyBar = require('./SoftkeyBar');

// In your component render
h(SoftkeyBar, {
  left: { 
    label: 'Back',
    action: function() { /* handle back */ }
  },
  center: { 
    label: 'Select',
    action: function() { /* handle select */ }
  },
  right: { 
    label: 'Options',
    action: function() { /* handle options */ }
  }
})
```

**Props:**

- `left` - Left softkey configuration { label, action }
- `center` - Center softkey configuration { label, action }
- `right` - Right softkey configuration { label, action }

**Styling:**

Include `softkey-bar.css` in your HTML:

```html
<link rel="stylesheet" href="src/navigation/softkey-bar.css">
```

## Integration Example

Here's how to use all three components together:

```javascript
var NavigationManager = require('./navigation-manager');
var Router = require('./router');
var h = require('preact').h;
var render = require('preact').render;
var SoftkeyBar = require('./SoftkeyBar');

// Create router
var router = new Router();

// Create navigation manager
var nav = new NavigationManager({
  onSelect: function(element) {
    // Handle selection
    var action = element.getAttribute('data-action');
    if (action === 'open-post') {
      var postId = element.getAttribute('data-id');
      router.navigate('/post/' + postId);
    }
  },
  onSoftLeft: function() {
    // Handle back
    if (router.canGoBack()) {
      router.back();
    }
  },
  onSoftRight: function() {
    // Handle options
    router.navigate('/options');
  }
});

// Register routes
router.register('/timeline', function() {
  // Render timeline view
  var items = document.querySelectorAll('.post-item');
  nav.updateFocusableElements(items);
  
  // Update softkeys
  renderSoftkeys({
    left: { label: 'Menu' },
    center: { label: 'Select' },
    right: { label: 'Compose' }
  });
});

router.register('/post/:id', function(params) {
  // Render post detail view
  console.log('Viewing post:', params.id);
  
  // Update softkeys
  renderSoftkeys({
    left: { label: 'Back' },
    center: { label: 'Select' },
    right: { label: 'Options' }
  });
});

// Helper to render softkeys
function renderSoftkeys(config) {
  var container = document.getElementById('softkey-container');
  render(h(SoftkeyBar, config), container);
  
  // Update navigation manager callbacks
  nav.updateSoftkeys({
    onSoftLeft: config.left ? config.left.action : null,
    onSoftRight: config.right ? config.right.action : null
  });
}

// Initialize
router.init();
nav.init();
```

## Testing

Each component has comprehensive tests:

- `navigation-manager.test.js` - NavigationManager tests
- `router.test.js` - Router tests
- `SoftkeyBar.test.js` - SoftkeyBar component tests

Run tests in Node.js:

```bash
node src/navigation/navigation-manager.test.js
node src/navigation/router.test.js
```

Or open the HTML test files in a browser:

- `test-navigation-manager.html`
- `test-router.html`
- `test-softkey-bar.html`

## Browser Compatibility

All components are compatible with Gecko 48 (Firefox 48) and KaiOS 2.5:

- ES5 syntax only
- No modern JavaScript features
- Polyfills included where needed
- Tested on KaiOS devices

## CSS Styling

The navigation system includes minimal CSS for the SoftkeyBar. Add custom styles for focus indicators:

```css
.focused {
  background-color: #0066cc;
  color: white;
  outline: 2px solid #0066cc;
}
```

## Performance Considerations

- NavigationManager uses event delegation for efficiency
- Router uses hash-based navigation (no server requests)
- SoftkeyBar is a lightweight Preact component
- Circular navigation prevents infinite loops
- History is limited to prevent memory issues

## KaiOS Specific Notes

### Softkey Codes

KaiOS devices may use different key codes:
- Left softkey: `SoftLeft` or `F1`
- Right softkey: `SoftRight` or `F2`
- Center D-pad: `Enter`

The NavigationManager handles both variants.

### Screen Size

The SoftkeyBar is optimized for 240x320 displays but adapts to different sizes.

### Focus Management

Visual focus indicators are critical for KaiOS since there's no touch input. Ensure high contrast (3:1 minimum) for accessibility.
