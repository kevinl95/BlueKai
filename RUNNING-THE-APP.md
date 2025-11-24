# Running BlueKai in Your Browser

## Quick Start

### Option 1: Development Server (Recommended)
The easiest way to see the app running with hot reload:

```bash
npm run dev
```

Then open your browser to: **http://localhost:8080**

The dev server will automatically reload when you make changes to the code.

### Option 2: Production Build
Build the app and open the HTML file:

```bash
# Build the production bundle
npm run build

# Open the app in your default browser (Linux)
xdg-open dist/index.html

# Or on macOS
open dist/index.html

# Or on Windows
start dist/index.html
```

### Option 3: Simple HTTP Server
If you want to test the production build with a local server:

```bash
# Build first
npm run build

# Serve the dist folder (using Python)
cd dist
python3 -m http.server 8000

# Or using Node's http-server (install globally first: npm install -g http-server)
cd dist
http-server -p 8000
```

Then open: **http://localhost:8000**

## What You'll See

### 1. Login Screen
When you first open the app, you'll see the login screen:
- Enter your BlueSky handle (e.g., `yourname.bsky.social`)
- Enter your app password (not your main password!)
- Click "Log In"

**Note:** You need a real BlueSky account to test the app. If you don't have one:
- Go to https://bsky.app to create an account
- Generate an app password in Settings → App Passwords

### 2. Timeline View
After logging in, you'll see:
- Your BlueSky timeline with posts
- Like, repost, and reply buttons on each post
- Softkey bar at the bottom:
  - **Left (Logout)**: Log out of the app
  - **Center (Compose)**: Create a new post
  - **Right (Refresh)**: Reload the timeline

### 3. Compose View
Click "Compose" to create a new post:
- Type your post (up to 300 characters)
- Character counter shows remaining characters
- Click "Post" to publish
- Click "Cancel" to go back (with confirmation if you've typed anything)

### 4. Reply Mode
Click the reply button on any post:
- See the original post you're replying to
- @mention is automatically added
- Type your reply
- Click "Reply" to publish

## Testing Individual Components

We've also created test pages for each component:

### Component Tests
```bash
# Open in browser after building
open test-components.html
```

### View Tests
- `test-login-view.html` - Login functionality
- `test-timeline.html` - Timeline display
- `test-post-item.html` - Individual post rendering
- `test-post-action-menu.html` - Post actions (like, repost, reply)
- `test-compose-view.html` - Post composition
- `test-compose-draft.html` - Draft auto-save
- `test-compose-reply.html` - Reply functionality

### Navigation Tests
- `test-navigation-integration.html` - D-pad navigation
- `test-softkey-bar.html` - Softkey bar

### Service Tests
- `test-atp-client.html` - API client
- `test-utils.html` - Utility functions

## App Structure

```
BlueKai/
├── src/
│   ├── index.js              # App entry point
│   ├── components/
│   │   ├── App.js            # Main app component
│   │   ├── Button.js         # Button component
│   │   ├── TextInput.js      # Text input with counter
│   │   ├── ErrorMessage.js   # Error display
│   │   └── Modal.js          # Modal dialog
│   ├── views/
│   │   ├── LoginView.js      # Login screen
│   │   ├── TimelineView.js   # Timeline display
│   │   ├── PostItem.js       # Single post
│   │   ├── PostList.js       # List of posts
│   │   ├── PostActionMenu.js # Post actions
│   │   └── ComposeView.js    # Post composition
│   ├── services/
│   │   ├── atp-client.js     # BlueSky API client
│   │   └── http-client.js    # HTTP wrapper
│   ├── navigation/
│   │   ├── router.js         # View routing
│   │   ├── navigation-manager.js # D-pad navigation
│   │   └── SoftkeyBar.js     # Bottom softkey bar
│   ├── state/
│   │   ├── app-state.js      # Global state
│   │   ├── reducer.js        # State reducer
│   │   └── actions.js        # State actions
│   └── utils/
│       ├── polyfills.js      # ES5 compatibility
│       ├── storage.js        # LocalStorage wrapper
│       ├── date-formatter.js # Date formatting
│       └── text-processor.js # Text processing
└── dist/
    ├── index.html            # Main HTML file
    └── bundle.js             # Compiled JavaScript
```

## Current Features

✅ **Authentication**
- Login with BlueSky handle and app password
- Session persistence
- Automatic token refresh
- Logout functionality

✅ **Timeline**
- View your BlueSky timeline
- Infinite scroll (load more)
- Pull to refresh
- Post interactions (like, repost, reply)

✅ **Post Composition**
- Create new posts (up to 300 characters)
- Character counter
- Draft auto-save
- Reply to posts with @mention
- Cancel confirmation

✅ **Navigation**
- D-pad navigation support
- Softkey bar (KaiOS style)
- Focus management
- Keyboard shortcuts

✅ **Error Handling**
- User-friendly error messages
- Network error detection
- Retry functionality
- Loading states

## Browser Compatibility

The app is built for **KaiOS 2.5** (Gecko 48 / Firefox 48), but works in modern browsers too:

- ✅ Firefox 48+ (KaiOS target)
- ✅ Chrome/Edge (modern)
- ✅ Safari (modern)
- ✅ Firefox (modern)

## Development Tips

### Hot Reload
Use `npm run dev` for the best development experience. Changes to your code will automatically reload the browser.

### Debugging
Open browser DevTools (F12) to:
- View console logs
- Inspect network requests
- Debug JavaScript
- Check LocalStorage

### Testing on KaiOS
To test on an actual KaiOS device:
1. Build the app: `npm run build`
2. Package as a KaiOS app (manifest.webapp)
3. Sideload to device via WebIDE

### Simulating KaiOS Screen Size
In Chrome DevTools:
1. Open DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Set custom dimensions: 240x320
4. Refresh the page

## Troubleshooting

### "Cannot connect" error
- Check your internet connection
- Verify BlueSky API is accessible
- Check browser console for CORS errors

### Login fails
- Verify your handle is correct (e.g., `user.bsky.social`)
- Use an app password, not your main password
- Check if your account is active

### Timeline not loading
- Check if you're logged in
- Verify network connection
- Check browser console for errors
- Try refreshing the page

### Draft not saving
- Check if LocalStorage is enabled
- Verify you're not in private/incognito mode
- Check browser console for errors

### Styles not loading
- Rebuild the app: `npm run build`
- Clear browser cache
- Check if CSS files exist in dist/

## Next Steps

The app currently has these features implemented:
- ✅ Login/Authentication
- ✅ Timeline viewing
- ✅ Post composition
- ✅ Reply functionality
- ✅ Like/Repost actions
- ✅ Draft auto-save

Still to be implemented:
- ⏳ Post detail view with full thread
- ⏳ Profile view
- ⏳ Notifications
- ⏳ Search functionality
- ⏳ Settings page

## Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the test pages to isolate the problem
3. Check the component README files in `src/*/README*.md`
4. Review the task summaries: `TASK-*-SUMMARY.md`

## Performance Notes

The app is optimized for KaiOS devices with limited resources:
- Minimal bundle size
- Efficient rendering
- Debounced operations
- Memory leak prevention
- ES5 compatibility

Enjoy exploring BlueKai! 🎉
