# Icon Setup Instructions

## Step 1: Save Your Logo

Save your BlueKai logo PNG as `bluekai-logo.png` in the project root directory.

You can do this by:
1. Right-clicking the image in the chat
2. Save as `bluekai-logo.png`
3. Place it in the BlueKai-1 directory

## Step 2: Generate Icons

Once you've saved the logo, run:

```bash
./create-icons.sh
```

This will create:
- `icons/icon-56.png` - KaiOS small icon (56x56)
- `icons/icon-112.png` - KaiOS large icon (112x112)
- `icons/icon-128.png` - Additional size (128x128)
- `icons/icon-256.png` - High resolution (256x256)
- `favicon.ico` - Browser favicon (32x32)

## Step 3: Verify Icons

Check that the icons were created:

```bash
ls -lh icons/
```

You should see:
```
icon-56.png
icon-112.png
icon-128.png
icon-256.png
```

## Alternative: Manual Creation

If you don't have ImageMagick installed, you can manually resize the image:

### Using GIMP (GUI)
1. Open `bluekai-logo.png` in GIMP
2. Image → Scale Image
3. Set width/height to desired size (56, 112, 128, 256)
4. Export as PNG to `icons/icon-[size].png`

### Using Online Tools
1. Go to https://www.iloveimg.com/resize-image
2. Upload your logo
3. Resize to each required size
4. Download and save to `icons/` directory

### Using ImageMagick (if available)
```bash
# Install ImageMagick first
sudo dnf install ImageMagick  # Fedora/RHEL
# or
sudo apt-get install imagemagick  # Ubuntu/Debian

# Then run the script
./create-icons.sh
```

## Step 4: Update index.html

The favicon link is already added to `index.html`:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="56x56" href="/icons/icon-56.png">
<link rel="icon" type="image/png" sizes="112x112" href="/icons/icon-112.png">
```

## Step 5: Test

1. Start your local server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open in browser:
   ```bash
   open http://localhost:8080
   ```

3. Check that the favicon appears in the browser tab

4. Test in KaiOS emulator:
   ```
   http://localhost:8080/manifest.webapp
   ```

## Troubleshooting

### Icons not showing in emulator
- Clear emulator cache
- Restart emulator
- Verify icon paths in manifest.webapp

### Favicon not showing in browser
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Clear browser cache
- Check browser console for 404 errors

### Script fails
- Make sure ImageMagick is installed
- Check that bluekai-logo.png exists
- Verify file permissions

## Current Status

✅ manifest.webapp created with icon references
✅ index.html created with favicon links
✅ icons/ directory created
✅ create-icons.sh script ready
⏳ Waiting for bluekai-logo.png to be saved
⏳ Icons to be generated

## Next Steps

1. Save your logo as `bluekai-logo.png`
2. Run `./create-icons.sh`
3. Verify icons were created
4. Test in browser and emulator
