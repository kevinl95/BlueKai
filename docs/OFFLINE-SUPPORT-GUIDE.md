# Offline Support User Guide

## Overview

BlueKai now includes comprehensive offline support that allows users to continue using the app even when their network connection is lost.

## What Works Offline

When you're offline, you can:

- ✅ View previously loaded timeline posts
- ✅ Read cached post details
- ✅ View cached user profiles
- ✅ Navigate between cached content
- ✅ Browse your cached notifications

## What Doesn't Work Offline

When you're offline, you cannot:

- ❌ Load new posts
- ❌ Create new posts
- ❌ Like, repost, or reply to posts
- ❌ Follow or unfollow users
- ❌ Edit your profile
- ❌ Load any uncached content

## Visual Indicators

### Offline Banner

When your device goes offline, you'll see a red banner at the top of the screen:

```
⚠ OFFLINE
```

This banner will automatically disappear when your connection is restored.

### Error Messages

If you try to perform an action that requires internet while offline, you'll see:

> "You are offline. Connect to continue."

## How It Works

### Automatic Detection

BlueKai automatically detects when your device:
- Loses network connection
- Regains network connection
- Switches between WiFi and mobile data

### Cache System

The app caches content as you browse:
- Timeline posts are cached for 5 minutes
- Profile data is cached for 15 minutes
- Your session is cached until you log out

When offline, you can access all this cached content.

### Connection Restoration

When your connection is restored:
1. The offline banner disappears
2. You can perform all actions again
3. The app automatically refreshes content
4. Any pending actions can be retried

## Testing Offline Mode

### On Your Device

1. **Airplane Mode**: Turn on airplane mode to test offline behavior
2. **WiFi Off**: Turn off WiFi to simulate connection loss
3. **Mobile Data Off**: Disable mobile data

### In Browser (Development)

1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from the throttling dropdown
4. The app will behave as if offline

## Tips for Low Connectivity Areas

If you're in an area with intermittent connectivity:

1. **Load Content First**: When you have connection, browse the timeline to cache posts
2. **Read Offline**: You can read cached posts even when connection drops
3. **Wait for Connection**: Save actions like posting or liking for when you have stable connection
4. **Enable Data Saver**: Turn on data saver mode to reduce data usage

## Developer Notes

### Network Status API

The offline support uses the browser's `navigator.onLine` API and listens for `online`/`offline` events.

### Compatibility

- ✅ KaiOS 2.5
- ✅ Gecko 48
- ✅ All supported devices

### Testing

To test offline support in development:

```bash
# Run offline tests
node run-offline-tests.js

# Open interactive test page
# Open test-offline.html in browser
```

## Troubleshooting

### Offline Banner Stuck

If the offline banner doesn't disappear when you're back online:
1. Close and reopen the app
2. Check your device's network settings
3. Try toggling airplane mode off and on

### Can't Access Cached Content

If you can't see cached content when offline:
1. Make sure you loaded the content while online first
2. Check if the cache has expired (5-15 minutes)
3. The cache may have been cleared due to storage limits

### Actions Failing Despite Being Online

If actions fail even though you're online:
1. Check your actual internet connection (try loading a website)
2. BlueSky servers may be down
3. Try refreshing the app

## Future Enhancements

Planned improvements for offline support:

- 📝 Queue posts to send when connection restored
- 🔄 Automatic retry of failed actions
- 💾 Longer cache duration options
- 📊 Show time since last online
- 🔔 Notification when connection restored

## Feedback

If you encounter issues with offline support or have suggestions for improvement, please report them through the app's feedback mechanism.
