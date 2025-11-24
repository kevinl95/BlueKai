# Views

This directory contains view components for the BlueKai application. Views are page-level components that compose smaller UI components and handle application logic.

## Components

### LoginView

Authentication view for BlueSky login.

**Requirements:** 5.1, 5.2, 9.2

**Features:**
- Handle and password input fields
- Input validation (required fields, format checking)
- Loading state during authentication
- User-friendly error messages
- Distinguishes between network and authentication errors
- Retry functionality
- Optimized for KaiOS D-pad navigation

**Props:**
- `atpClient` (Object, required): ATP client instance for authentication
- `onLogin` (Function, required): Callback when login succeeds, receives session data

**Usage:**
```javascript
import { h, render } from 'preact';
import LoginView from './views/LoginView.js';
import ATPClient from './services/atp-client.js';

const atpClient = new ATPClient();

const handleLogin = (session) => {
  console.log('Logged in as:', session.handle);
  // Navigate to timeline or update app state
};

render(
  h(LoginView, {
    atpClient: atpClient,
    onLogin: handleLogin
  }),
  document.getElementById('app')
);
```

**Validation Rules:**
- Handle: Required, must contain '@' or '.' (e.g., user.bsky.social)
- Password: Required, minimum 4 characters

**Error Messages:**
- Network errors: "Cannot connect. Check your connection."
- Invalid credentials (401): "Invalid handle or password. Please try again."
- Rate limiting (429): "Too many login attempts. Please wait and try again."
- Server errors (500+): "BlueSky is having issues. Try again later."

**Testing:**
Run tests with: `open test-login-view.html`

See `example-usage.js` for more examples.

### Timeline Components

See [README-TIMELINE.md](./README-TIMELINE.md) for detailed documentation on timeline components.

**Components:**
- `PostItem` - Displays a single post
- `PostList` - List with virtual scrolling
- `TimelineView` - Main timeline view

**Requirements:** 3.1, 3.4, 4.2, 4.3, 4.6, 6.1, 6.2, 6.4, 7.2, 9.4, 10.3

**Features:**
- Virtual scrolling for performance
- Cache-first loading
- Infinite scroll pagination
- D-pad navigation
- Data saver mode
- Error handling with retry
- Offline support

**Testing:**
Run tests with: `open test-timeline.html`

## File Structure

```
src/views/
├── LoginView.js          # LoginView component
├── LoginView.css         # LoginView styles
├── LoginView.test.js     # LoginView tests
├── PostItem.js           # Post item component
├── PostItem.css          # Post item styles
├── PostItem.test.js      # Post item tests
├── PostList.js           # Post list with virtual scrolling
├── PostList.css          # Post list styles
├── PostList.test.js      # Post list tests
├── TimelineView.js       # Timeline view component
├── TimelineView.css      # Timeline view styles
├── TimelineView.test.js  # Timeline view tests
├── example-usage.js      # Usage examples
├── README.md            # This file
└── README-TIMELINE.md   # Timeline components documentation
```

## Design Principles

1. **KaiOS Optimized**: All views are designed for 240x320 screens with D-pad navigation
2. **Accessibility**: Semantic HTML, ARIA labels, proper focus management
3. **Error Handling**: User-friendly error messages with retry options
4. **Loading States**: Clear visual feedback during async operations
5. **Validation**: Client-side validation with helpful error messages
6. **ES5 Compatible**: All code transpiles to ES5 for Gecko 48 compatibility

## Adding New Views

When creating a new view component:

1. Create the component file (e.g., `TimelineView.js`)
2. Create corresponding CSS file (e.g., `TimelineView.css`)
3. Create test file (e.g., `TimelineView.test.js`)
4. Add usage examples to `example-usage.js`
5. Update this README with component documentation

## Testing

All view components should have comprehensive tests covering:
- Rendering
- User interactions
- Validation
- Error handling
- Loading states
- Success scenarios

Run all view tests:
```bash
# Build test bundle first
npm run build -- --config webpack.test.config.js

# Open test files in browser
open test-login-view.html
open test-timeline.html
```

## Styling

View styles follow these conventions:
- BEM naming: `.view-name__element--modifier`
- Mobile-first responsive design
- High contrast for readability (WCAG AA)
- Focus indicators for D-pad navigation
- Optimized for small screens (240x320)

## State Management

Views should:
- Accept callbacks for state updates (e.g., `onLogin`)
- Not directly manipulate global state
- Use local state for UI-only concerns
- Dispatch actions through callbacks

## Navigation

Views integrate with the navigation system:
- Support D-pad navigation
- Handle softkey actions
- Manage focus properly
- Support back navigation
