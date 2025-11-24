#!/bin/bash

echo "========================================="
echo "  BlueKai - KaiOS Development Server"
echo "========================================="
echo ""

# Build for KaiOS (copies files to public/)
./build-kaios.sh

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "Starting server from public/ directory..."
echo ""
echo "The app will be available at:"
echo "  📱 App: http://localhost:8080"
echo "  📄 Manifest: http://localhost:8080/manifest.webapp"
echo ""
echo "For KaiOS Emulator, use:"
echo "  http://localhost:8080/manifest.webapp"
echo ""
echo "⚠️  Serving ONLY from public/ directory (secure)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "========================================="
echo ""

# Change to public directory and serve from there
cd public

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8080
elif command -v npx &> /dev/null; then
    npx http-server -p 8080 --cors
else
    echo "❌ Error: No suitable HTTP server found!"
    echo ""
    echo "Please install one of:"
    echo "  - Python 3: sudo dnf install python3"
    echo "  - Node.js http-server: npm install -g http-server"
    exit 1
fi
