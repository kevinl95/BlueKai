# PostDetailView Component

Detailed documentation for the PostDetailView component.

## Overview

PostDetailView is a view component that displays a single BlueSky post with its complete reply thread. It supports nested replies up to 3 levels deep and provides interaction capabilities through the integrated PostActionMenu.

## Requirements

**Requirement 4.4:** Post interaction and reply functionality

## Features

### Core Features
- **Full Post Display**: Shows complete post content with author information
- **Reply Thread**: Displays nested replies with visual hierarchy
- **Nested Rendering**: Supports up to 3 levels of reply nesting
- **Deep Thread Handling**: Shows "View more" link for threads deeper than 3 levels
- **Post Interactions**: Like, unlike, repost, unrepost, and reply actions
- **Loading States**: Clear feedback during data fetching
- **Error Handling**: User-friendly error messages with retry
- **Data Saver Mode**: Optional image loading control

### Reply Thread Features
- **Visual Hierarchy**: Indentation increases by 16px per level
- **Level Indicators**: Visual line indicators for nested replies
- **Smart Truncation**: Automatically shows "View more" for deep threads
- **Empty State**: Friendly message when no replies exist
- **Reply Count**: Shows total number of replies in header

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiClient` | Object | Yes | ATP client instance for API calls |
| `postUri` | String | Yes | AT Protocol URI of the post to display |
| `onNavigateToReply` | Function | No | Callback when user wants to reply to a post |
| `onNavigateToPost` | Function | No | Callback to navigate to another post detail |
| `dataSaverMode` | Boolean | No | Enable data saver mode (default: false) |

## Usage Examples

### Basic Usage

```javascript
import { h, render } from 'preact';
import PostDetailView from './views/PostDetailView.js';
import ATPClient from './services/atp-client.js';

const atpClient = new ATPClient();

render(
  h(PostDetailView, {
    apiClient: atpClient,
    postUri: 'at://did:plc:xxx/app.bsky.feed.post/123'
  }),
  document.getElementById('app')
);
```

### With Navigation Callbacks

```javascript
import { h, render } from 'preact';
import PostDetailView from './views/PostDetailView.js';
import ATPClient from './services/atp-client.js';

const atpClient = new ATPClient();

const handleNavigateToReply = (post) => {
  // Navigate to compose view with reply context
  router.navigate('/compose', {
    replyTo: post
  });
};

const handleNavigateToPost = (postUri) => {
  // Navigate to another post detail
  router.navigate('/post', {
    uri: postUri
  });
};

render(
  h(PostDetailView, {
    apiClient: atpClient,
    postUri: 'at://did:plc:xxx/app.bsky.feed.post/123',
    onNavigateToReply: handleNavigateToReply,
    onNavigateToPost: handleNavigateToPost
  }),
  document.getElementById('app')
);
```

### With Data Saver Mode

```javascript
import { h, render } from 'preact';
import PostDetailView from './views/PostDetailView.js';
import ATPClient from './services/atp-client.js';

const atpClient = new ATPClient();
const dataSaverEnabled = localStorage.getItem('dataSaverMode') === 'true';

render(
  h(PostDetailView, {
    apiClient: atpClient,
    postUri: 'at://did:plc:xxx/app.bsky.feed.post/123',
    dataSaverMode: dataSaverEnabled
  }),
  document.getElementById('app')
);
```

### Integrated with Router

```javascript
import { h, Component } from 'preact';
import PostDetailView from './views/PostDetailView.js';
import Router from './navigation/router.js';

function App() {
  Component.call(this);
  
  this.state = {
    currentPostUri: null
  };
  
  this.router = new Router();
  
  // Register route
  this.router.register('/post/:uri', function(params) {
    this.setState({ currentPostUri: params.uri });
  }.bind(this));
}

App.prototype = Object.create(Component.prototype);

App.prototype.render = function() {
  if (!this.state.currentPostUri) {
    return h('div', null, 'Loading...');
  }
  
  return h(PostDetailView, {
    apiClient: this.props.apiClient,
    postUri: this.state.currentPostUri,
    onNavigateToReply: function(post) {
      this.router.navigate('/compose?reply=' + encodeURIComponent(post.uri));
    }.bind(this),
    onNavigateToPost: function(uri) {
      this.router.navigate('/post/' + encodeURIComponent(uri));
    }.bind(this)
  });
};
```

## Reply Thread Structure

### Thread Data Format

The component expects thread data in the following format from the API:

```javascript
{
  post: {
    uri: "at://did:plc:xxx/app.bsky.feed.post/123",
    cid: "bafyxxx",
    author: {
      did: "did:plc:xxx",
      handle: "user.bsky.social",
      displayName: "User Name",
      avatar: "https://cdn.bsky.app/img/avatar/..."
    },
    record: {
      text: "Post content",
      createdAt: "2025-11-23T12:00:00.000Z"
    },
    likeCount: 5,
    repostCount: 2,
    replyCount: 3,
    viewer: {
      like: "at://...",  // Present if user liked
      repost: "at://..." // Present if user reposted
    }
  },
  replies: [
    {
      post: { /* Reply post data */ },
      replies: [
        {
          post: { /* Nested reply data */ },
          replies: []
        }
      ]
    }
  ]
}
```

### Nesting Levels

The component renders replies with the following nesting behavior:

- **Level 1**: Direct replies to the main post (16px indent)
- **Level 2**: Replies to level 1 replies (32px indent)
- **Level 3**: Replies to level 2 replies (48px indent)
- **Level 4+**: Not rendered, shows "View more" link instead

### Visual Hierarchy

Each reply level includes:
- Indentation (16px per level)
- Visual line indicator on the left
- Full PostItem component
- Nested replies (if applicable)
- "View more" link (if deeper than 3 levels)

## Interactions

### Post Actions

The component supports the following actions through PostActionMenu:

1. **Like/Unlike**
   - Toggles like status
   - Updates like count optimistically
   - Reverts on error

2. **Repost/Unrepost**
   - Toggles repost status
   - Updates repost count optimistically
   - Reverts on error

3. **Reply**
   - Calls `onNavigateToReply` callback
   - Passes post object for context
   - Used to navigate to compose view

### Action Flow

```
User selects post
  ↓
PostActionMenu opens
  ↓
User selects action
  ↓
Action executes (optimistic update)
  ↓
API call made
  ↓
Success: Keep update, close menu
Failure: Revert update, show error
```

## State Management

### Component State

```javascript
{
  thread: null,           // Thread data from API
  loading: true,          // Loading state
  error: null,            // Error message
  showActionMenu: false,  // Action menu visibility
  selectedPost: null,     // Currently selected post
  navigatingToReply: false // Reply navigation state
}
```

### State Transitions

1. **Initial Load**
   - `loading: true`
   - Fetch post data
   - `loading: false`, `thread: data`

2. **Error State**
   - `loading: false`
   - `error: message`
   - Show error with retry

3. **Action Menu**
   - User selects post
   - `showActionMenu: true`
   - `selectedPost: post`

4. **Action Execution**
   - Execute action
   - Close menu on success
   - Show error on failure

## Error Handling

### Error Types

1. **Network Errors**
   - Connection timeout
   - DNS failure
   - Message: "Cannot connect. Check your connection."

2. **Not Found (404)**
   - Post doesn't exist
   - Post was deleted
   - Message: "Post not found"

3. **Authentication Errors (401)**
   - Session expired
   - Invalid credentials
   - Message: "Please log in again"

4. **Server Errors (500+)**
   - BlueSky API issues
   - Message: "BlueSky is having issues. Try again later."

### Error Recovery

All errors include a retry button that:
- Clears error state
- Reloads post data
- Maintains user context

## Performance Considerations

### Optimization Strategies

1. **Lazy Rendering**
   - Only renders visible reply levels
   - Defers deep thread rendering

2. **Memoization**
   - Caches processed text
   - Reuses formatted dates

3. **Event Delegation**
   - Single event listener for all replies
   - Reduces memory footprint

4. **Virtual Scrolling**
   - Not implemented (thread depth limited)
   - Could be added for very long threads

### Memory Management

- Limits reply depth to 3 levels
- Cleans up event listeners on unmount
- Clears state on navigation

## Styling

### CSS Classes

- `.post-detail` - Main container
- `.post-detail__main` - Main post section
- `.post-detail__replies` - Replies container
- `.post-detail__replies-header` - Reply count header
- `.post-detail__reply` - Individual reply wrapper
- `.post-detail__view-more` - Deep thread link
- `.post-detail__no-replies` - Empty state
- `.post-detail__action-menu-overlay` - Action menu overlay

### Responsive Design

Optimized for KaiOS screens:
- 240x320 primary target
- Readable font sizes (13-14px)
- High contrast colors
- Touch-friendly spacing

## Testing

### Test Coverage

The component includes tests for:
1. Loading state rendering
2. Post data display
3. Error state handling
4. Reply thread rendering
5. Nested reply display (3 levels)
6. "View more" for deep threads
7. Empty state for no replies
8. Like/unlike actions
9. Navigation to reply composition

### Running Tests

```bash
# Build test bundle
npm run build -- --config webpack.test.config.js

# Open test file
open test-post-detail.html
```

### Manual Testing

Test scenarios:
1. Load post with no replies
2. Load post with flat replies
3. Load post with nested replies (3+ levels)
4. Test like/unlike actions
5. Test repost/unrepost actions
6. Test reply navigation
7. Test error states
8. Test retry functionality
9. Test data saver mode

## Accessibility

### ARIA Support

- `role="article"` on post items
- `aria-label` for post authors
- `aria-selected` for menu items
- Semantic HTML structure

### Keyboard Navigation

- D-pad navigation through replies
- Enter to select post
- Back/Escape to close menu
- Focus indicators visible

### Screen Reader Support

- Descriptive labels
- Proper heading hierarchy
- Status announcements
- Error messages

## Browser Compatibility

### Gecko 48 Support

- ES5 transpiled code
- No Fetch API (uses XMLHttpRequest)
- No async/await (uses Promises)
- Polyfills for Array methods

### Tested Browsers

- Firefox 48 (Gecko 48)
- KaiOS 2.5 browser
- Modern browsers (for development)

## Future Enhancements

### Potential Improvements

1. **Infinite Thread Loading**
   - Load deeper threads on demand
   - Pagination for long threads

2. **Thread Collapsing**
   - Collapse/expand reply branches
   - Minimize long threads

3. **Quote Posts**
   - Display quoted posts inline
   - Navigate to quoted content

4. **Media Support**
   - Display embedded images
   - Show video thumbnails
   - Link previews

5. **Thread Visualization**
   - Better visual indicators
   - Thread lines connecting replies
   - Highlight reply chains

## Related Components

- **PostItem**: Individual post display
- **PostActionMenu**: Action menu for interactions
- **PostList**: List of posts with virtual scrolling
- **TimelineView**: Main timeline view
- **ComposeView**: Post composition with reply support

## API Dependencies

### Required API Methods

- `apiClient.getPost(uri)` - Fetch post and thread
- `apiClient.likePost(uri, cid)` - Like a post
- `apiClient.unlikePost(likeUri)` - Unlike a post
- `apiClient.repost(uri, cid)` - Repost a post
- `apiClient.unrepost(repostUri)` - Unrepost a post

### API Response Format

See ATP Protocol documentation for complete response schemas:
- `app.bsky.feed.getPostThread` - Thread data
- `app.bsky.feed.like` - Like records
- `app.bsky.feed.repost` - Repost records

## Troubleshooting

### Common Issues

**Issue: Replies not displaying**
- Check API response format
- Verify `replies` array exists
- Check console for errors

**Issue: "View more" not showing**
- Verify thread depth > 3 levels
- Check reply count in data
- Inspect DOM structure

**Issue: Actions not working**
- Verify API client passed
- Check authentication status
- Review error messages

**Issue: Navigation not working**
- Verify callbacks provided
- Check callback signatures
- Test with console.log

### Debug Mode

Enable debug logging:

```javascript
// In component
console.log('Thread data:', this.state.thread);
console.log('Selected post:', this.state.selectedPost);
console.log('Action menu visible:', this.state.showActionMenu);
```

## Contributing

When modifying PostDetailView:

1. Update tests for new features
2. Maintain ES5 compatibility
3. Test on KaiOS device
4. Update documentation
5. Follow existing patterns
6. Consider performance impact

## License

Part of the BlueKai project. See main LICENSE file.
