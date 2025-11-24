# KaiOS Emulator Setup Guide

## Prerequisites

1. **Install KaiOS Emulator**
   - Download from: https://developer.kaiostech.com/simulator
   - Or use WebIDE in Firefox (for older versions)

2. **Build the Application**
   ```bash
   npm run build
   ```

## Method 1: Using KaiOS Simulator (Recommended)

### Step 1: Start Local Server

You need to serve the app over HTTP. Use one of these methods:

**Option A: Using Python**
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Option B: Using Node.js http-server**
```bash
# Install globally
npm install -g http-server

# Run server
http-server -p 8080
```

**Option C: Using PHP**
```bash
php -S localhost:8080
```

### Step 2: Open in KaiOS Simulator

1. Open the KaiOS Simulator application
2. Click "Open Hosted App"
3. Enter the full URL with manifest:
   ```
   http://localhost:8080/manifest.webapp
   ```
4. Click "Open"

The app should now load in the simulator!

## Method 2: Using Firefox WebIDE (Legacy)

### Step 1: Enable WebIDE in Firefox

1. Open Firefox
2. Press `Shift + F8` or go to `Tools > Web Developer > WebIDE`
3. If WebIDE is not available, use Firefox Developer Edition

### Step 2: Connect to Simulator

1. In WebIDE, click "Select Runtime"
2. Choose "Install Simulator"
3. Install KaiOS 2.5 simulator
4. Select the installed simulator

### Step 3: Open App

1. Click "Open Packaged App"
2. Navigate to your BlueKai project directory
3. Select the folder containing `manifest.webapp`
4. Click "Open"
5. Click the "Play" button to run the app

## Method 3: Package as ZIP for Testing

### Create Package

```bash
# Create a zip file with all necessary files
zip -r bluekai.zip \
  manifest.webapp \
  index.html \
  dist/ \
  icons/ \
  -x "*.DS_Store" "*.git*"
```

### Install Package

1. In KaiOS Simulator, click "Open Packaged App"
2. Select the `bluekai.zip` file
3. The app will be installed and launched

## Troubleshooting

### Issue: "Unable to load manifest"

**Solution:** Make sure you're providing the full URL including the manifest file:
```
http://localhost:8080/manifest.webapp
```
NOT just:
```
http://localhost:8080
```

### Issue: "CORS errors"

**Solution:** Make sure your local server allows CORS. Add these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

For http-server:
```bash
http-server -p 8080 --cors
```

### Issue: "App not loading"

**Solution:** Check the browser console in the simulator:
1. Right-click in the simulator
2. Select "Inspect Element" or "Developer Tools"
3. Check the Console tab for errors

### Issue: "Manifest parse error"

**Solution:** Validate your manifest.webapp file:
- Ensure it's valid JSON
- Check all required fields are present
- Verify icon paths are correct

### Issue: "Icons not showing"

**Solution:** 
1. Make sure icon files exist in the `icons/` directory
2. Convert SVG to PNG if needed:
   ```bash
   # Using ImageMagick
   convert icons/icon.svg -resize 56x56 icons/icon-56.png
   convert icons/icon.svg -resize 112x112 icons/icon-112.png
   ```

## Testing Checklist

Before testing in the emulator:

- [ ] Build completed successfully (`npm run build`)
- [ ] `manifest.webapp` exists in root directory
- [ ] `index.html` exists in root directory
- [ ] `dist/bundle.js` exists and is not empty
- [ ] Icons exist in `icons/` directory
- [ ] Local server is running on port 8080
- [ ] Can access `http://localhost:8080` in browser

## D-Pad Navigation Testing

In the KaiOS simulator, test these keys:

- **Arrow Keys**: Navigate through UI
- **Enter**: Select/Confirm
- **Backspace**: Go back
- **Softkeys**: 
  - Left softkey: Usually mapped to a function key
  - Right softkey: Usually mapped to a function key

## Network Testing

To test with real BlueSky API:

1. Make sure your local server allows external connections
2. The simulator should have internet access
3. Check Network tab in DevTools to see API calls

## Performance Testing

Monitor performance in the simulator:

1. Open DevTools (F12)
2. Go to Performance tab
3. Record while using the app
4. Check for:
   - Long tasks (> 50ms)
   - Memory leaks
   - Excessive repaints

## Debugging Tips

### Enable Verbose Logging

Add to your code:
```javascript
// Enable debug mode
window.DEBUG = true;

// Log all API calls
console.log('API call:', method, url, data);
```

### Check Storage

In DevTools Console:
```javascript
// Check localStorage
console.log(localStorage);

// Check specific keys
console.log(localStorage.getItem('bluekai:session'));
```

### Monitor Memory

```javascript
// Check memory usage
if (performance.memory) {
  console.log('Memory:', performance.memory);
}
```

## Building for Production

When ready to deploy:

```bash
# Build production bundle
npm run build

# Create package
zip -r bluekai-v0.1.0.zip \
  manifest.webapp \
  index.html \
  dist/ \
  icons/ \
  -x "*.DS_Store" "*.git*" "*.map"
```

## Submitting to KaiStore

1. Create developer account at https://developer.kaiostech.com
2. Prepare app listing:
   - App name: BlueKai
   - Description: BlueSky client for KaiOS
   - Screenshots (240x320)
   - Privacy policy
3. Upload the packaged ZIP file
4. Submit for review

## Additional Resources

- KaiOS Developer Portal: https://developer.kaiostech.com
- KaiOS Documentation: https://developer.kaiostech.com/docs
- KaiOS Community: https://discourse.kaiostech.com
- WebIDE Guide: https://developer.mozilla.org/en-US/docs/Tools/WebIDE

## Quick Start Commands

```bash
# 1. Build the app
npm run build

# 2. Start local server
python3 -m http.server 8080

# 3. Open in browser to verify
open http://localhost:8080

# 4. Open KaiOS Simulator and load:
# http://localhost:8080/manifest.webapp
```

## Next Steps

After successfully loading in the emulator:

1. Test all views (Login, Timeline, Post Detail, Compose)
2. Test D-pad navigation
3. Test with real BlueSky credentials
4. Check performance and memory usage
5. Test offline functionality
6. Verify all interactions work correctly

Good luck testing! 🦋
