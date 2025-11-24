# Timeline Components

This directory contains the timeline functionality components for BlueKai.

## Components

### PostItem
**File:** `PostItem.js`

Displays a single post with author information, content, and engagement metrics.

**Props:**
- `post` (Object, required) - Post data from ATP API
- `focused` (Boolean) - Whether this post is currently focused
- `dataSaverMode` (Boolean) - Whether to show avatar placeholders
- `onSelect` (Function) - Callback when post is selected

**Usage:**
```javascript
var PostItem = require('./PostItem');

h(PostItem, {
  post: {
    uri: 'at://...',
    author: {
      handle: 'user.bsky.social',
      displayName: 'User Name',
      avatar: 'https://...'
    },
    record: {
      text: 'Post content',
      createdAt: '2025-11-23T12:00:00Z'
    },
    likeCount: 5,
    repostCount: 2,
    replyCount: 3,
    viewer: {
      like: 'at://...',  // URI if liked
      repost: null
    }
  },
  focused: false,
  dataSaverMode: false,
  onSelect: function(post) {
    console.log('Selected:', post.uri);
  }
});
```

**Features:**
- Linkifies URLs in post text
- Shows relative timestamps ("2h ago")
- Visual indicators for user interactions
- Data saver mode support
- Keyboard accessible

---

### PostList
**File:** `PostList.js`

List component that renders posts with virtual scrolling for performance.

**Props:**
- `posts` (Array, required) - Array of post objects
- `onSelectPost` (Function) - Callback when a post is selected
- `dataSaverMode` (Boolean) - Whether to use data saver mode
- `navigationManager` (Object) - NavigationManager instance
- `emptyMessage` (String) - Message to show when no posts
- `itemHeight` (Number) - Estimated height per post (default: 120)
- `bufferSize` (Number) - Number of items to render above/below viewport (default: 3)

**Usage:**
```javascript
var PostList = require('./PostList');

h(PostList, {
  posts: [/* array of posts */],
  onSelectPost: function(post) {
    console.log('Selected:', post.uri);
  },
  dataSaverMode: false,
  navigationManager: navManager,
  emptyMessage: 'No posts to display',
  itemHeight: 120,
  bufferSize: 3
});
```

**Features:**
- Virtual scrolling (only renders visible items)
- Keyboard navigation (ArrowUp/Down/Enter)
- Automatic scroll to focused item
- Empty state handling
- Performance optimized for 100+ posts

**Virtual Scrolling:**
- Calculates visible range based on scroll position
- Renders only visible items + buffer
- Uses CSS transforms for positioning
- Maintains spacer for proper scrollbar

---

### TimelineView
**File:** `TimelineView.js`

Main view component that fetches and displays the user's timeline.

**Props:**
- `dataSaverMode` (Boolean) - Whether to use data saver mode
- `onNavigate` (Function) - Callback for navigation (view, params)
- `onSoftkeyUpdate` (Function) - Callback to update softkey configuration
- `navigationManager` (Object) - NavigationManager instance

**Usage:**
```javascript
var TimelineView = require('./TimelineView');

h(TimelineView, {
  dataSaverMode: false,
  onNavigate: function(view, params) {
    console.log('Navigate to:', view, params);
  },
  onSoftkeyUpdate: function(softkeys) {
    console.log('Softkeys:', softkeys);
  },
  navigationManager: navManager
});
```

**Features:**
- Fetches timeline from ATP API
- Cache-first loading (instant display)
- Background refresh for fresh data
- Pull-to-refresh via softkey
- Infinite scroll with pagination
- Error handling with retry
- Loading states
- Offline support with cached content

**State:**
- `posts` - Array of posts
- `cursor` - Pagination cursor
- `loading` - Initial loading flag
- `loadingMore` - Pagination loading flag
- `error` - Error message
- `hasMore` - Whether more posts available

**Methods:**
- `loadTimeline()` - Load timeline from API
- `loadMore()` - Load next page
- `refresh()` - Refresh timeline
- `handleSelectPost(post)` - Handle post selection

**Caching:**
- Cache key: `cache_timeline:home`
- TTL: 5 minutes
- Loads from cache first, then fetches fresh data
- Updates cache after successful fetch

**Softkeys:**
- Left: Refresh
- Center: Select
- Right: Menu

---

## Data Structures

### Post Object
```javascript
{
  uri: "at://did:plc:xxx/app.bsky.feed.post/xxx",
  cid: "bafyxxx",
  author: {
    did: "did:plc:xxx",
    handle: "user.bsky.social",
    displayName: "User Name",
    avatar: "https://cdn.bsky.app/img/avatar/..."
  },
  record: {
    text: "Post content",
    createdAt: "2025-11-23T12:00:00.000Z",
    reply: {
      parent: { uri: "...", cid: "..." },
      root: { uri: "...", cid: "..." }
    }
  },
  replyCount: 5,
  repostCount: 10,
  likeCount: 25,
  viewer: {
    like: "at://...",    // URI if user liked
    repost: "at://..."   // URI if user reposted
  }
}
```

## Dependencies

### Internal
- `../utils/date-formatter` - Relative time formatting
- `../utils/text-processor` - URL linkification
- `../utils/storage` - LocalStorage wrapper
- `../utils/cache-manager` - Cache with TTL
- `../services/atp-client` - ATP API client
- `../components/LoadingIndicator` - Loading states
- `../components/ErrorMessage` - Error display

### External
- `preact` - UI framework

## Styling

### CSS Files
- `PostItem.css` - Post item styles
- `PostList.css` - List and virtual scrolling styles
- `TimelineView.css` - Timeline view layout

### Key Classes
- `.post-item` - Post container
- `.post-item--focused` - Focused post state
- `.post-list` - List container
- `.post-list--empty` - Empty state
- `.timeline-view` - Timeline container
- `.timeline-view--loading` - Loading state
- `.timeline-view--error` - Error state

### Design Tokens
- Background: `#000` (black)
- Text: `#fff` (white)
- Secondary text: `#888` (gray)
- Focus border: `#0066cc` (blue)
- Focus background: `#1a1a1a` (dark gray)
- Error background: `#331a00` (dark orange)

## Testing

### Test Files
- `PostItem.test.js` - PostItem tests
- `PostList.test.js` - PostList tests
- `TimelineView.test.js` - TimelineView tests

### Test Pages
- `test-post-item.html` - PostItem visual tests
- `test-timeline.html` - Complete timeline tests

### Running Tests
```bash
# Build test bundle
npm run build -- --config webpack.test.config.js

# Open test pages in browser
```

## Performance

### Virtual Scrolling
- Renders only visible items + buffer (default 3)
- Typical: 10-15 DOM nodes for 100 posts
- Smooth 60fps scrolling
- Memory efficient

### Caching
- 5-minute TTL for timeline
- Cache-first loading
- Background refresh
- Offline support

### Bundle Size
- PostItem: ~2KB minified
- PostList: ~3KB minified
- TimelineView: ~4KB minified
- Total: ~9KB

## Accessibility

### ARIA Attributes
- `role="article"` on posts
- `role="list"` on list
- `aria-label` on interactive elements
- `aria-label` with counts on metrics

### Keyboard Navigation
- ArrowUp/Down - Navigate posts
- Enter - Select post
- Tab - Focus list

### Visual
- High contrast (WCAG AA)
- Focus indicators (3:1 contrast)
- Readable font sizes (14px minimum)
- Clear visual hierarchy

## Browser Compatibility

### Requirements
- ES5 JavaScript
- Gecko 48+ (Firefox 48)
- XMLHttpRequest
- LocalStorage
- CSS Flexbox
- CSS Transforms

### Polyfills
- Promise (if needed)
- Object.assign (if needed)
- Array methods (if needed)

## KaiOS Optimizations

### Screen Size
- Optimized for 240x320 screens
- Responsive layout
- Readable text sizes

### Navigation
- D-pad support (arrow keys)
- Softkey integration
- Touch-free operation

### Data Efficiency
- Data saver mode
- Optional image loading
- Cached content
- Minimal API calls

## Future Enhancements

### Planned Features
- Pull-to-refresh gesture
- Post actions menu (like, repost, reply)
- Thread view
- Media preview
- Quote posts
- Embedded links

### Performance
- Intersection Observer for load more
- Request deduplication
- Optimistic updates
- Background sync

## Troubleshooting

### Posts Not Loading
1. Check authentication (session token)
2. Check network connection
3. Check ATP API status
4. Check browser console for errors

### Virtual Scrolling Issues
1. Verify itemHeight matches actual height
2. Check bufferSize is adequate
3. Verify scroll container has height
4. Check for CSS conflicts

### Cache Not Working
1. Check LocalStorage availability
2. Verify cache key generation
3. Check TTL settings
4. Clear cache and retry

### Navigation Issues
1. Verify NavigationManager integration
2. Check keyboard event listeners
3. Verify focusable elements
4. Check focus indicators visible

## Support

For issues or questions:
1. Check test pages for examples
2. Review test files for usage patterns
3. Check browser console for errors
4. Verify Gecko 48 compatibility
