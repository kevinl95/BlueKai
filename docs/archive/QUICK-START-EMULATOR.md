# Quick Start: KaiOS Emulator

## Prerequisites Checklist

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)
- [ ] App built (`npm run build`)
- [ ] Logo saved as `bluekai-logo.png`
- [ ] Icons generated (`./create-icons.sh`)
- [ ] KaiOS Simulator installed

## Quick Setup (5 minutes)

### 1. Save Your Logo
Save the BlueKai logo PNG as `bluekai-logo.png` in the project root.

### 2. Generate Icons
```bash
# If you have ImageMagick
./create-icons.sh

# If not, manually resize to 56x56 and 112x112
# and save to icons/ directory
```

### 3. Build the App
```bash
npm run build
```

### 4. Start Local Server
```bash
# Choose one:
python3 -m http.server 8080
# or
npx http-server -p 8080 --cors
```

### 5. Open in KaiOS Simulator
1. Launch KaiOS Simulator
2. Click "Open Hosted App"
3. Enter: `http://localhost:8080/manifest.webapp`
4. Click "Open"

## Verify Everything Works

### Check Files Exist
```bash
# Check manifest
cat manifest.webapp

# Check index.html
cat index.html

# Check bundle
ls -lh dist/bundle.js

# Check icons
ls -lh icons/
```

### Test in Browser First
```bash
open http://localhost:8080
```

Should see:
- ✅ BlueKai loading screen
- ✅ Favicon in browser tab
- ✅ No console errors

### Test in Emulator
1. App loads successfully
2. Icons appear correctly
3. D-pad navigation works
4. Can interact with UI

## Common Issues

### "Cannot load manifest"
**Fix:** Use full URL with manifest file:
```
http://localhost:8080/manifest.webapp
```

### Icons not showing
**Fix:** 
```bash
# Regenerate icons
./create-icons.sh

# Restart server
# Restart emulator
```

### App not loading
**Fix:**
```bash
# Rebuild
npm run build

# Check bundle exists
ls -lh dist/bundle.js

# Check for errors
tail -f dist/bundle.js
```

### CORS errors
**Fix:**
```bash
# Use http-server with CORS
npx http-server -p 8080 --cors
```

## File Structure

Your project should look like this:

```
BlueKai-1/
├── manifest.webapp          ← KaiOS manifest
├── index.html              ← Entry point
├── bluekai-logo.png        ← Your logo (source)
├── favicon.ico             ← Generated favicon
├── icons/
│   ├── icon-56.png         ← Generated
│   ├── icon-112.png        ← Generated
│   ├── icon-128.png        ← Generated
│   └── icon-256.png        ← Generated
├── dist/
│   └── bundle.js           ← Built app
└── src/
    └── ...                 ← Source code
```

## Testing Checklist

- [ ] Logo saved as bluekai-logo.png
- [ ] Icons generated in icons/ directory
- [ ] favicon.ico exists in root
- [ ] npm run build completed successfully
- [ ] dist/bundle.js exists and is not empty
- [ ] Local server running on port 8080
- [ ] Can access http://localhost:8080 in browser
- [ ] Favicon shows in browser tab
- [ ] No console errors in browser
- [ ] KaiOS Simulator installed
- [ ] App loads in simulator
- [ ] Icons show correctly in simulator
- [ ] D-pad navigation works

## Next Steps

Once the app loads in the emulator:

1. **Test Login Flow**
   - Enter BlueSky credentials
   - Verify authentication works
   - Check session persistence

2. **Test Timeline**
   - View posts
   - Scroll with D-pad
   - Check performance

3. **Test Post Detail**
   - Select a post
   - View replies
   - Test nested threads

4. **Test Interactions**
   - Like/unlike posts
   - Repost/unrepost
   - Reply to posts

5. **Test Compose**
   - Create new post
   - Reply to post
   - Check character count

## Useful Commands

```bash
# Build app
npm run build

# Start server (Python)
python3 -m http.server 8080

# Start server (Node.js)
npx http-server -p 8080 --cors

# Check server is running
curl http://localhost:8080/manifest.webapp

# View manifest
cat manifest.webapp | jq .

# Check bundle size
ls -lh dist/bundle.js

# Watch build
npm run build -- --watch

# Clean and rebuild
rm -rf dist/ && npm run build
```

## Resources

- **KaiOS Docs:** https://developer.kaiostech.com/docs
- **Simulator Download:** https://developer.kaiostech.com/simulator
- **Community Forum:** https://discourse.kaiostech.com
- **BlueSky API:** https://docs.bsky.app

## Support

If you run into issues:

1. Check KAIOS-EMULATOR-SETUP.md for detailed troubleshooting
2. Check ICON-SETUP.md for icon generation help
3. Check browser/emulator console for errors
4. Verify all files exist and are not empty
5. Try rebuilding: `rm -rf dist/ && npm run build`

Good luck! 🦋
