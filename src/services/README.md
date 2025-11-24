# ATP API Client

This directory contains the AT Protocol (ATP) API client for the BlueKai BlueSky client.

## Overview

The ATP client provides a complete interface to the BlueSky social network API, including:

- **Authentication**: Login, session management, and automatic token refresh
- **Timeline**: Fetch and paginate through the user's home timeline
- **Posts**: Create, like, unlike, repost, and unrepost posts
- **Profiles**: View and update user profiles, follow/unfollow users
- **Notifications**: Fetch notifications and manage read status

## Architecture

### HttpClient (`http-client.js`)

Enhanced HTTP client built on top of XMLHttpRequest with:

- **Request/Response Interceptors**: Modify requests and responses globally
- **Retry Logic**: Automatic retry with exponential backoff for failed requests
- **Timeout Handling**: Configurable request timeouts
- **Error Handling**: Consistent error handling across all requests

**Example Usage:**

```javascript
import HttpClient from './http-client.js';

var client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  maxRetries: 3
});

// Add request interceptor
client.addRequestInterceptor(function(config) {
  config.headers = config.headers || {};
  config.headers['X-Custom'] = 'value';
  return config;
});

// Make request
client.get('/endpoint')
  .then(function(response) {
    console.log(response.data);
  });
```

### ATPClient (`atp-client.js`)

Main ATP API client with full BlueSky protocol support.

**Features:**

- Automatic authentication header injection
- Session persistence to LocalStorage
- Automatic token refresh before expiration
- JWT token expiry calculation
- Error handling for auth failures

**Example Usage:**

```javascript
import ATPClient from './atp-client.js';

var client = new ATPClient({
  baseURL: 'https://bsky.social'
});

// Login
client.login('user.bsky.social', 'app-password')
  .then(function(session) {
    console.log('Logged in as:', session.handle);
    
    // Get timeline
    return client.getTimeline({ limit: 50 });
  })
  .then(function(timeline) {
    console.log('Posts:', timeline.feed.length);
  });
```

## API Methods

### Authentication

#### `login(identifier, password)`

Authenticate with BlueSky and create a session.

**Parameters:**
- `identifier` (string): User handle or email
- `password` (string): App password

**Returns:** Promise resolving to session object

```javascript
client.login('user.bsky.social', 'xxxx-xxxx-xxxx-xxxx')
  .then(function(session) {
    console.log('DID:', session.did);
    console.log('Handle:', session.handle);
  });
```

#### `refreshSession()`

Refresh the current session to get new tokens.

**Returns:** Promise resolving to updated session

#### `logout()`

Clear the current session from memory and storage.

**Returns:** Promise resolving when complete

#### `getSession()`

Get the current session object.

**Returns:** Session object or null

#### `isAuthenticated()`

Check if user is currently authenticated.

**Returns:** Boolean

### Timeline & Posts

#### `getTimeline(options)`

Fetch the user's home timeline.

**Parameters:**
- `options.algorithm` (string): Feed algorithm (default: 'reverse-chronological')
- `options.limit` (number): Number of posts (default: 50)
- `options.cursor` (string): Pagination cursor

**Returns:** Promise resolving to `{ feed, cursor }`

```javascript
client.getTimeline({ limit: 25 })
  .then(function(result) {
    result.feed.forEach(function(item) {
      console.log(item.post.record.text);
    });
    
    // Load next page
    if (result.cursor) {
      return client.getTimeline({ cursor: result.cursor });
    }
  });
```

#### `getPost(uri)`

Fetch a single post with its thread.

**Parameters:**
- `uri` (string): Post URI

**Returns:** Promise resolving to thread object

#### `createPost(options)`

Create a new post.

**Parameters:**
- `options.text` (string): Post text (required)
- `options.reply` (object): Reply reference (optional)
- `options.embed` (object): Embed data (optional)

**Returns:** Promise resolving to created post data

```javascript
client.createPost({
  text: 'Hello BlueSky!',
  reply: {
    parent: { uri: 'at://...', cid: '...' },
    root: { uri: 'at://...', cid: '...' }
  }
});
```

#### `likePost(uri, cid)`

Like a post.

**Parameters:**
- `uri` (string): Post URI
- `cid` (string): Post CID

**Returns:** Promise resolving to like record

#### `unlikePost(likeUri)`

Remove a like from a post.

**Parameters:**
- `likeUri` (string): Like record URI

**Returns:** Promise resolving when complete

#### `repost(uri, cid)`

Repost a post.

**Parameters:**
- `uri` (string): Post URI
- `cid` (string): Post CID

**Returns:** Promise resolving to repost record

#### `unrepost(repostUri)`

Remove a repost.

**Parameters:**
- `repostUri` (string): Repost record URI

**Returns:** Promise resolving when complete

### Profiles

#### `getProfile(actor)`

Fetch a user's profile.

**Parameters:**
- `actor` (string): User handle or DID

**Returns:** Promise resolving to profile object

```javascript
client.getProfile('user.bsky.social')
  .then(function(profile) {
    console.log('Display Name:', profile.displayName);
    console.log('Bio:', profile.description);
    console.log('Followers:', profile.followersCount);
  });
```

#### `updateProfile(updates)`

Update the current user's profile.

**Parameters:**
- `updates.displayName` (string): New display name (optional)
- `updates.description` (string): New bio (optional)

**Returns:** Promise resolving to updated profile

```javascript
client.updateProfile({
  displayName: 'New Name',
  description: 'Updated bio'
});
```

#### `follow(subject)`

Follow a user.

**Parameters:**
- `subject` (string): User DID to follow

**Returns:** Promise resolving to follow record

#### `unfollow(followUri)`

Unfollow a user.

**Parameters:**
- `followUri` (string): Follow record URI

**Returns:** Promise resolving when complete

### Notifications

#### `getNotifications(options)`

Fetch notifications.

**Parameters:**
- `options.limit` (number): Number of notifications (default: 50)
- `options.cursor` (string): Pagination cursor
- `options.seenAt` (string): ISO timestamp filter

**Returns:** Promise resolving to `{ notifications, cursor, seenAt }`

```javascript
client.getNotifications({ limit: 25 })
  .then(function(result) {
    result.notifications.forEach(function(notif) {
      console.log(notif.reason, notif.author.handle);
    });
  });
```

#### `getNotificationCount(options)`

Get unread notification count.

**Parameters:**
- `options.seenAt` (string): ISO timestamp to count from

**Returns:** Promise resolving to `{ count }`

#### `updateSeenNotifications(seenAt)`

Mark notifications as seen.

**Parameters:**
- `seenAt` (string): ISO timestamp (optional, defaults to now)

**Returns:** Promise resolving when complete

## Testing

All components have comprehensive test suites:

- `http-client.test.js` - HTTP client tests
- `atp-client.test.js` - Authentication tests
- `atp-timeline.test.js` - Timeline and post tests
- `atp-profile.test.js` - Profile tests
- `atp-notifications.test.js` - Notification tests

Run all tests by opening `test-atp-client.html` in a browser.

## Compatibility

All code is compatible with Gecko 48 (Firefox 48):

- Uses XMLHttpRequest instead of Fetch API
- ES5 compatible (transpiled via Babel)
- No async/await (uses Promises)
- Polyfills for Object.assign and Array methods

## Error Handling

The client handles various error scenarios:

- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Automatic token refresh on 401
- **Rate Limiting**: Retry on 429 responses
- **Timeout**: Configurable request timeouts

All errors are returned as rejected promises with consistent structure:

```javascript
{
  status: 401,
  statusText: 'Unauthorized',
  headers: {},
  data: { error: 'ExpiredToken', message: '...' },
  error: 'AuthError'
}
```

## Session Management

Sessions are automatically managed:

1. **Login**: Creates session and stores in LocalStorage
2. **Restoration**: Automatically restores valid sessions on app start
3. **Refresh**: Automatically refreshes tokens before expiration
4. **Expiry**: Clears expired sessions on restoration
5. **Logout**: Clears session from memory and storage

## Best Practices

### Pagination

Always use cursor-based pagination for large datasets:

```javascript
function loadAllPosts(cursor) {
  return client.getTimeline({ cursor: cursor })
    .then(function(result) {
      // Process posts
      processPosts(result.feed);
      
      // Load next page if available
      if (result.cursor) {
        return loadAllPosts(result.cursor);
      }
    });
}
```

### Error Handling

Always handle errors appropriately:

```javascript
client.createPost({ text: 'Hello' })
  .then(function(post) {
    console.log('Posted:', post.uri);
  })
  .catch(function(error) {
    if (error.status === 401) {
      // Session expired, redirect to login
      redirectToLogin();
    } else if (error.error === 'NetworkError') {
      // Network issue, show retry option
      showRetryDialog();
    } else {
      // Other error
      showError(error.data.message);
    }
  });
```

### Session Checks

Check authentication before making requests:

```javascript
if (!client.isAuthenticated()) {
  redirectToLogin();
  return;
}

client.getTimeline()
  .then(function(timeline) {
    // Handle timeline
  });
```

## Future Enhancements

Potential improvements for future versions:

- Direct message support
- Search functionality
- List management
- Media upload
- Custom feed algorithms
- WebSocket support for real-time updates
