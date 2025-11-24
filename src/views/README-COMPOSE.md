# ComposeView Component

## Overview
The ComposeView component provides a complete post composition interface for BlueKai, supporting both new posts and replies with draft auto-save functionality.

## Features
- ✅ Text composition with 300 character limit
- ✅ Real-time character counter
- ✅ Draft auto-save to LocalStorage
- ✅ Reply support with @mention pre-population
- ✅ Cancel confirmation when content exists
- ✅ Loading states during submission
- ✅ Comprehensive error handling

## Basic Usage

### New Post
```javascript
import { h, render } from 'preact';
import ComposeView from './views/ComposeView.js';
import ATPClient from './services/atp-client.js';

const atpClient = new ATPClient();

render(h(ComposeView, {
  atpClient: atpClient,
  onSubmit: function(result) {
    console.log('Post created:', result);
    // Navigate to timeline or post detail
  },
  onCancel: function() {
    console.log('Composition cancelled');
    // Navigate back to previous view
  }
}), document.getElementById('app'));
```

### Reply to Post
```javascript
const replyTo = {
  post: {
    uri: 'at://did:plc:user/app.bsky.feed.post/abc123',
    cid: 'bafyabc123',
    author: {
      handle: 'alice.bsky.social',
      displayName: 'Alice Smith'
    },
    record: {
      text: 'This is the original post'
    }
  }
};

render(h(ComposeView, {
  atpClient: atpClient,
  replyTo: replyTo,
  onSubmit: function(result) {
    console.log('Reply created:', result);
  },
  onCancel: function() {
    console.log('Reply cancelled');
  }
}), document.getElementById('app'));
```

### Reply in Nested Thread
```javascript
const replyTo = {
  post: {
    uri: 'at://did:plc:user/app.bsky.feed.post/reply456',
    cid: 'bafyreply456',
    author: {
      handle: 'bob.bsky.social',
      displayName: 'Bob Jones'
    },
    record: {
      text: 'This is a reply in a thread'
    }
  },
  root: {
    uri: 'at://did:plc:user/app.bsky.feed.post/root123',
    cid: 'bafyroot123'
  }
};

render(h(ComposeView, {
  atpClient: atpClient,
  replyTo: replyTo,
  onSubmit: function(result) {
    console.log('Nested reply created:', result);
  },
  onCancel: function() {
    console.log('Nested reply cancelled');
  }
}), document.getElementById('app'));
```

## Props

### Required Props

#### `atpClient` (Object)
ATP client instance for API calls.
```javascript
atpClient: new ATPClient()
```

#### `onSubmit` (Function)
Callback invoked when post is successfully submitted.
```javascript
onSubmit: function(result) {
  // result: { uri: string, cid: string }
}
```

#### `onCancel` (Function)
Callback invoked when composition is cancelled.
```javascript
onCancel: function() {
  // Handle cancellation
}
```

### Optional Props

#### `replyTo` (Object)
Reply context for composing a reply.
```javascript
replyTo: {
  post: {
    uri: string,        // Post URI
    cid: string,        // Post CID
    author: {
      handle: string,   // Author handle
      displayName: string // Author display name
    },
    record: {
      text: string      // Post text
    }
  },
  root: {              // Optional: for nested threads
    uri: string,
    cid: string
  }
}
```

## Component Behavior

### Character Limit
- Maximum 300 characters
- Real-time counter shows: "current/300"
- Input prevented beyond limit
- Submit button disabled when over limit

### Draft Auto-Save
- Automatically saves to LocalStorage after 500ms of inactivity
- Only for new posts (not replies)
- Restored on component mount
- Cleared on successful submission
- Cleared on confirmed cancellation
- Empty drafts not saved

### Cancel Confirmation
- Shows modal if content exists
- For new posts: any non-empty text
- For replies: text beyond @mention
- No confirmation if no content

### Loading States
- Submit button shows loading spinner
- Both buttons disabled during submission
- Prevents duplicate submissions

### Error Handling
- Network errors: "Cannot connect. Check your connection."
- Auth errors: "Session expired. Please log in again."
- Rate limiting: "Too many posts. Please wait and try again."
- Server errors: "BlueSky is having issues. Try again later."
- Retry button available for recoverable errors

## Reply Behavior

### UI Changes
- Title: "New Post" → "Reply"
- Submit button: "Post" → "Reply"
- Reply context card displayed
- Blue left border on reply context

### @Mention Pre-population
- Automatically adds: `@handle `
- Cursor positioned after space
- User can edit or remove mention
- Counted in character limit

### Reply References
```javascript
// Sent to API
{
  text: "Reply text",
  reply: {
    root: {
      uri: "at://...",  // Thread root
      cid: "bafy..."
    },
    parent: {
      uri: "at://...",  // Immediate parent
      cid: "bafy..."
    }
  }
}
```

## Draft Storage

### Storage Key
```javascript
'compose_draft'
```

### Storage Format
```javascript
// Plain text string
localStorage.setItem('compose_draft', 'Draft post content');
```

### Draft Lifecycle
1. **Save**: Debounced 500ms after text change
2. **Restore**: On component mount (new posts only)
3. **Clear**: On successful submission or confirmed cancel

## Integration Examples

### With Router
```javascript
import Router from './navigation/router.js';

const router = new Router();

router.addRoute('/compose', function() {
  render(h(ComposeView, {
    atpClient: atpClient,
    onSubmit: function(result) {
      router.navigate('/timeline');
    },
    onCancel: function() {
      router.back();
    }
  }), document.getElementById('app'));
});
```

### With State Management
```javascript
import { useAppState } from './state/app-state.js';

function ComposeViewWrapper() {
  const { state, dispatch } = useAppState();
  
  return h(ComposeView, {
    atpClient: state.atpClient,
    onSubmit: function(result) {
      dispatch({ type: 'POST_CREATED', payload: result });
    },
    onCancel: function() {
      dispatch({ type: 'CANCEL_COMPOSE' });
    }
  });
}
```

### With Navigation Manager
```javascript
import NavigationManager from './navigation/navigation-manager.js';

const navManager = new NavigationManager({
  onSelect: function(element) {
    if (element.classList.contains('compose-submit')) {
      // Submit form
    }
  }
});

// Update focusable elements after render
navManager.updateFocusableElements(
  document.querySelectorAll('textarea, button')
);
```

## Styling

### CSS Classes
```css
.compose-view                    /* Main container */
.compose-view__container         /* Content wrapper */
.compose-view__header            /* Header section */
.compose-view__title             /* Title text */
.compose-view__reply-context     /* Reply context card */
.compose-view__reply-label       /* "Replying to" label */
.compose-view__reply-post        /* Parent post container */
.compose-view__reply-author      /* Author info */
.compose-view__reply-author-name /* Author display name */
.compose-view__reply-author-handle /* Author handle */
.compose-view__reply-text        /* Parent post text */
.compose-view__form              /* Form element */
.compose-view__actions           /* Button container */
.compose-view__confirm-content   /* Modal content */
.compose-view__confirm-actions   /* Modal buttons */
```

### Customization
```css
/* Override character counter color */
.text-input__counter {
  color: #1da1f2;
}

/* Customize reply context */
.compose-view__reply-context {
  background-color: #f0f8ff;
  border-left-color: #1da1f2;
}

/* Adjust for smaller screens */
@media (max-width: 240px) {
  .compose-view__container {
    padding: 4px;
  }
}
```

## Testing

### Test Files
- `src/views/ComposeView.test.js` - Basic functionality (10 tests)
- `src/views/ComposeView.draft.test.js` - Draft persistence (6 tests)
- `src/views/ComposeView.reply.test.js` - Reply support (8 tests)

### Running Tests
```bash
# Build the bundle
npm run build

# Open test pages in browser
open test-compose-view.html
open test-compose-draft.html
open test-compose-reply.html
```

### Manual Testing Checklist
- [ ] Type text and verify character counter updates
- [ ] Reach 300 characters and verify input blocked
- [ ] Submit empty form and verify button disabled
- [ ] Submit valid post and verify API call
- [ ] Cancel with content and verify confirmation modal
- [ ] Cancel without content and verify immediate cancel
- [ ] Type text, wait 500ms, refresh page, verify draft restored
- [ ] Submit post and verify draft cleared
- [ ] Open reply mode and verify @mention present
- [ ] Submit reply and verify reply references included

## Accessibility

### Keyboard Navigation
- Tab: Move between textarea and buttons
- Enter: Submit form (when focused on submit button)
- Escape: Close cancel confirmation modal

### Screen Reader Support
- Form has proper labels
- Character counter has aria-live region
- Error messages announced
- Modal has focus trap

### ARIA Attributes
```html
<textarea aria-describedby="counter error" />
<div id="counter" aria-live="polite">150/300</div>
<div id="error" role="alert">Error message</div>
```

## Performance

### Optimizations
- Debounced draft save (500ms)
- Efficient character counting
- Minimal re-renders
- Event listener cleanup

### Memory Management
- Timers cleared on unmount
- Event listeners removed
- No memory leaks

## Browser Compatibility

### Gecko 48 (Firefox 48)
- ✅ ES5 syntax only
- ✅ No arrow functions
- ✅ No template literals
- ✅ XMLHttpRequest (not Fetch)
- ✅ LocalStorage API

### KaiOS 2.5
- ✅ Screen size optimized (240x320)
- ✅ D-pad navigation ready
- ✅ T9 keyboard compatible
- ✅ Low memory footprint

## Troubleshooting

### Draft Not Saving
- Check LocalStorage is enabled
- Verify 500ms debounce delay
- Ensure not in reply mode
- Check for empty text

### @Mention Not Pre-populated
- Verify replyTo prop provided
- Check replyTo.post.author.handle exists
- Ensure component mounted correctly

### Submit Button Disabled
- Check text is not empty
- Verify under 300 characters
- Ensure not in loading state
- Check for validation errors

### Cancel Confirmation Not Showing
- Verify text content exists
- For replies, check text beyond @mention
- Ensure modal component loaded

## Related Components
- `TextInput` - Text input with character counter
- `Button` - Action buttons
- `ErrorMessage` - Error display
- `Modal` - Confirmation dialog

## Related Services
- `ATPClient` - API communication
- `StorageManager` - LocalStorage wrapper

## Requirements
- Requirement 4.5: Post Creation
- Requirement 8.1: Text Input Support
- Requirement 8.2: Character Counter
- Requirement 8.3: Character Limit Enforcement
- Requirement 8.4: Composition Features
- Requirement 4.4: Reply Support
- Requirement 9.3: Error Handling

## Version History
- v1.0.0 (2025-11-23) - Initial implementation
  - Basic post composition
  - Draft auto-save
  - Reply support
  - Character limit enforcement
  - Error handling
