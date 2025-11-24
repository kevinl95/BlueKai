#!/bin/bash

# Script to create KaiOS icons from source image
# Requires ImageMagick (install with: sudo dnf install ImageMagick)

SOURCE="bluekai-logo.png"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it:"
    echo "  Fedora/RHEL: sudo dnf install ImageMagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    exit 1
fi

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
    echo "Error: Source image '$SOURCE' not found!"
    echo "Please save your PNG as 'bluekai-logo.png' in the project root."
    exit 1
fi

echo "Creating icons from $SOURCE..."

# Create icons directory if it doesn't exist
mkdir -p icons

# Generate KaiOS required sizes
echo "Generating icon-56.png..."
convert "$SOURCE" -resize 56x56 -background none -gravity center -extent 56x56 icons/icon-56.png

echo "Generating icon-112.png..."
convert "$SOURCE" -resize 112x112 -background none -gravity center -extent 112x112 icons/icon-112.png

# Generate additional useful sizes
echo "Generating icon-128.png..."
convert "$SOURCE" -resize 128x128 -background none -gravity center -extent 128x128 icons/icon-128.png

echo "Generating icon-256.png..."
convert "$SOURCE" -resize 256x256 -background none -gravity center -extent 256x256 icons/icon-256.png

# Generate favicon
echo "Generating favicon.ico..."
convert "$SOURCE" -resize 32x32 -background none -gravity center -extent 32x32 favicon.ico

echo ""
echo "✅ Icons created successfully!"
echo ""
echo "Generated files:"
echo "  - icons/icon-56.png (KaiOS small icon)"
echo "  - icons/icon-112.png (KaiOS large icon)"
echo "  - icons/icon-128.png (Additional size)"
echo "  - icons/icon-256.png (High-res)"
echo "  - favicon.ico (Browser favicon)"
echo ""
echo "Next steps:"
echo "  1. Verify icons look good: ls -lh icons/"
echo "  2. Update manifest.webapp if needed"
echo "  3. Add favicon to index.html"
