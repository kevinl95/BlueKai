# Fixed: KaiOS Emulator Setup

## The Problem

The webpack dev server (`START-APP.sh`) doesn't serve static files like `manifest.webapp` properly, causing:
- ❌ "Cannot GET /manifest.webapp" in Chrome
- ❌ "JSON parse error" in KaiOS emulator

## The Solution

Use a simple HTTP server instead of webpack-dev-server for KaiOS testing.

## Quick Fix (3 Steps)

### 1. Verify Setup
```bash
./verify-kaios-setup.sh
```

This checks that all required files exist.

### 2. Build and Start Server (Secure)
```bash
./serve-kaios.sh
```

This will:
- Build the app (`npm run build`)
- Copy only necessary files to `public/` directory
- Start HTTP server serving ONLY from `public/`
- Keep source code and sensitive files secure

### 3. Open in KaiOS Emulator
1. Launch KaiOS Simulator
2. Click "Open Hosted App"
3. Enter: `http://localhost:8080/manifest.webapp`
4. Click "Open"

## What Changed

### New Files Created

1. **build-kaios.sh** - Secure build script
   - Builds the app
   - Copies ONLY necessary files to `public/`
   - Keeps source code and sensitive files secure

2. **serve-kaios.sh** - Secure server for KaiOS testing
   - Runs build-kaios.sh first
   - Serves ONLY from `public/` directory
   - Never exposes source code or sensitive files

3. **verify-kaios-setup.sh** - Setup verification script
   - Checks all required files exist
   - Validates manifest JSON
   - Checks bundle size
   - Verifies public/ directory

4. **SECURITY-KAIOS-SETUP.md** - Security documentation
   - Explains why we use public/ directory
   - Lists what files are safe to serve
   - Production deployment guidelines

### Security Improvements

**Before:** Served from root directory
- ❌ Exposed source code
- ❌ Exposed node_modules/
- ❌ Exposed .git/ directory
- ❌ Exposed configuration files

**After:** Serves only from public/ directory
- ✅ Only compiled bundle exposed
- ✅ Source code stays private
- ✅ Dependencies stay private
- ✅ Configuration stays private

## Why This Works

**Python HTTP Server:**
- ✅ Serves ALL files in the directory
- ✅ Serves manifest.webapp correctly
- ✅ Proper MIME types
- ✅ No configuration needed

**Webpack Dev Server (old way):**
- ❌ Only serves from dist/ directory
- ❌ Doesn't serve manifest.webapp
- ❌ Requires complex configuration

## Testing

### Test in Browser First
```bash
# Start server
./serve-kaios.sh

# In another terminal, test the manifest
curl http://localhost:8080/manifest.webapp

# Should see JSON output
```

### Test in KaiOS Emulator
```bash
# 1. Start server
./serve-kaios.sh

# 2. Open KaiOS Simulator
# 3. Load: http://localhost:8080/manifest.webapp
```

## Troubleshooting

### "Cannot GET /manifest.webapp"

**Cause:** Using webpack-dev-server (START-APP.sh)

**Fix:** Use `./serve-kaios.sh` instead

### "JSON parse error"

**Cause:** Server returning HTML instead of JSON

**Fix:** 
1. Stop webpack-dev-server
2. Use `./serve-kaios.sh`
3. Verify: `curl http://localhost:8080/manifest.webapp`

### "Icons not showing"

**Fix:**
```bash
# Regenerate icons
./create-icons.sh

# Verify they exist
ls -lh icons/
```

### "Bundle not found"

**Fix:**
```bash
# Rebuild
npm run build

# Verify
ls -lh dist/bundle.js
```

## Development Workflow

### For KaiOS Testing (Use This!)
```bash
# 1. Make changes to code
# 2. Build
npm run build

# 3. Start server
./serve-kaios.sh

# 4. Test in emulator
# Load: http://localhost:8080/manifest.webapp
```

### For Browser Development
```bash
# Use webpack-dev-server for hot reload
./START-APP.sh

# Or
npm run dev
```

## File Checklist

Run `./verify-kaios-setup.sh` to check:

- [x] manifest.webapp
- [x] index.html
- [x] bluekai-logo.png
- [x] favicon.ico
- [x] icons/icon-56.png
- [x] icons/icon-112.png
- [x] dist/bundle.js

## Commands Reference

```bash
# Verify setup
./verify-kaios-setup.sh

# Generate icons
./create-icons.sh

# Build app
npm run build

# Serve for KaiOS (RECOMMENDED)
./serve-kaios.sh

# Serve for browser development
./START-APP.sh
```

## Success Indicators

When everything works:

✅ `curl http://localhost:8080/manifest.webapp` returns JSON
✅ `curl http://localhost:8080/` returns HTML
✅ `curl http://localhost:8080/dist/bundle.js` returns JavaScript
✅ KaiOS emulator loads the app
✅ Icons appear in emulator
✅ App is interactive

## Next Steps

Once the app loads in the emulator:

1. Test D-pad navigation
2. Test login flow
3. Test timeline scrolling
4. Test post interactions
5. Check performance

## Summary

**Don't use:** `./START-APP.sh` for KaiOS testing
**Use instead:** `./serve-kaios.sh` for KaiOS testing

The webpack dev server is great for development with hot reload, but for KaiOS emulator testing, you need a simple HTTP server that serves all files including the manifest.

Good luck! 🚀
