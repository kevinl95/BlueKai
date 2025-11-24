# State Management

This directory contains the global state management layer for BlueKai, built with Preact hooks and Context API.

## Overview

The state management system provides:
- Global application state with Preact Context
- Action-based state updates with a reducer pattern
- Session management with automatic refresh
- State persistence to LocalStorage
- Gecko 48 (ES5) compatibility

## Architecture

### Files

- **app-state.js** - Defines the state structure, context, and initialization logic
- **AppStateProvider.js** - Provider component that wraps the application
- **actions.js** - Action types and action creator functions
- **reducer.js** - Reducer function that handles state updates
- **session-manager.js** - Session validation, refresh, and expiration handling
- **index.js** - Central export point for all state management modules

### State Structure

```javascript
{
  user: {
    did: null,
    handle: null,
    displayName: null,
    avatar: null,
    email: null
  },
  session: {
    accessJwt: null,
    refreshJwt: null,
    expiresAt: null,
    isAuthenticated: false
  },
  timeline: {
    posts: [],
    cursor: null,
    loading: false,
    error: null,
    lastFetch: null
  },
  settings: {
    dataSaverMode: false,
    autoLoadImages: true,
    language: 'en'
  },
  navigation: {
    currentView: 'login',
    history: [],
    params: {}
  }
}
```

## Usage

### Setting Up the Provider

Wrap your application with the `AppStateProvider`:

```javascript
var h = require('preact').h;
var AppStateProvider = require('./state').AppStateProvider;
var App = require('./components/App');

function Root() {
  return h(AppStateProvider, null,
    h(App, null)
  );
}
```

### Using State in Components

Use the `useAppState` hook to access state and dispatch:

```javascript
var h = require('preact').h;
var useAppState = require('./state').useAppState;
var loginSuccess = require('./state').loginSuccess;

function LoginView() {
  var context = useAppState();
  var state = context.state;
  var dispatch = context.dispatch;
  
  function handleLogin(session, user) {
    dispatch(loginSuccess(session, user));
  }
  
  return h('div', null,
    h('p', null, 'Current view: ' + state.navigation.currentView)
  );
}
```

### Dispatching Actions

Import action creators and dispatch them:

```javascript
var actions = require('./state');

// Login
dispatch(actions.loginSuccess(session, user));

// Logout
dispatch(actions.logout());

// Load timeline
dispatch(actions.timelineLoadStart());
dispatch(actions.timelineLoadSuccess(posts, cursor));

// Navigate
dispatch(actions.navigate('profile', { handle: 'user.bsky' }));

// Update settings
dispatch(actions.updateSettings({ language: 'es' }));
dispatch(actions.toggleDataSaver());
```

## Session Management

The `SessionManager` provides utilities for managing user sessions:

### Validate Session on App Start

```javascript
var SessionManager = require('./state').SessionManager;

SessionManager.validateAndRestoreSession(state, dispatch, atpClient)
  .then(function(isValid) {
    if (isValid) {
      console.log('Session restored');
    } else {
      console.log('No valid session');
    }
  });
```

### Automatic Session Refresh

Start a timer to automatically refresh sessions:

```javascript
var timerId = SessionManager.startSessionRefreshTimer(state, dispatch, atpClient);

// Later, stop the timer
SessionManager.stopSessionRefreshTimer(timerId);
```

### Manual Session Refresh

```javascript
SessionManager.refreshSession(state.session, dispatch, atpClient)
  .then(function(success) {
    if (success) {
      console.log('Session refreshed');
    }
  });
```

### Logout

```javascript
SessionManager.logout(dispatch, atpClient);
```

## State Persistence

State is automatically persisted to LocalStorage when it changes. The following parts of state are persisted:

- User data
- Session tokens
- Settings
- Current view

Timeline data is NOT persisted to avoid stale data.

## Requirements Mapping

This implementation satisfies the following requirements:

- **5.3** - Securely store session token locally
- **5.4** - Automatically restore previous session if valid
- **5.5** - Automatic session refresh before expiration
- **5.6** - Clear all stored credentials and session data on logout

## Testing

Run the state management tests:

```bash
# Node.js test runner
node run-state-tests.js

# Browser test (open in browser)
open test-state-management.html
```

## Gecko 48 Compatibility

All code is written to be compatible with Gecko 48:

- Uses ES5 syntax (transpiled by Babel)
- No async/await (uses Promises)
- No ES6 modules (uses CommonJS)
- Uses Object.assign polyfill
- Uses Array methods with polyfills

## Performance Considerations

- State updates are batched by Preact
- Only necessary parts of state are persisted
- LocalStorage writes are debounced by Preact's effect system
- Session refresh checks run every 5 minutes (not on every render)

## Future Enhancements

- Add state middleware for logging/debugging
- Implement optimistic updates for better UX
- Add state selectors for derived data
- Consider IndexedDB for larger cache storage
