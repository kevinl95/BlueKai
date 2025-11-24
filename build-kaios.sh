#!/bin/bash

echo "========================================="
echo "  Building BlueKai for KaiOS"
echo "========================================="
echo ""

# Clean public directory
echo "Cleaning public directory..."
rm -rf public/*

# Create directory structure
mkdir -p public/dist
mkdir -p public/icons

# Build the app
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Copy necessary files to public directory
echo "Copying files to public directory..."

# Copy manifest
cp manifest.webapp public/

# Copy index.html
cp index.html public/

# Copy favicon
if [ -f "favicon.ico" ]; then
    cp favicon.ico public/
fi

# Copy icons
if [ -d "icons" ]; then
    cp icons/*.png public/icons/ 2>/dev/null || true
fi

# Copy dist bundle
cp dist/bundle.js public/dist/

# Copy any CSS files if they exist
cp dist/*.css public/dist/ 2>/dev/null || true

echo ""
echo "✅ Files copied to public directory"
echo ""
echo "Public directory contents:"
ls -lh public/
echo ""
echo "Icons:"
ls -lh public/icons/ 2>/dev/null || echo "  (no icons found)"
echo ""
echo "Dist:"
ls -lh public/dist/
echo ""
echo "========================================="
echo "✅ Build complete!"
echo ""
echo "The public/ directory now contains:"
echo "  - manifest.webapp"
echo "  - index.html"
echo "  - favicon.ico"
echo "  - icons/"
echo "  - dist/bundle.js"
echo ""
echo "Ready to serve with: ./serve-kaios.sh"
echo "========================================="
