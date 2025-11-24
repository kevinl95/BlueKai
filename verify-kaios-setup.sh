#!/bin/bash

echo "========================================="
echo "  BlueKai KaiOS Setup Verification"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (missing)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        return 0
    else
        echo -e "${RED}❌${NC} $1/ (missing)"
        return 1
    fi
}

errors=0

echo "Checking source files..."
echo ""

# Check manifest
check_file "manifest.webapp" || ((errors++))

# Check index.html
check_file "index.html" || ((errors++))

# Check logo
check_file "bluekai-logo.png" || ((errors++))

# Check favicon
check_file "favicon.ico" || ((errors++))

# Check icons directory
check_dir "icons" || ((errors++))

# Check individual icons
check_file "icons/icon-56.png" || ((errors++))
check_file "icons/icon-112.png" || ((errors++))

# Check dist directory
check_dir "dist" || ((errors++))

# Check bundle
check_file "dist/bundle.js" || ((errors++))

echo ""
echo "Checking public directory (served files)..."
echo ""

# Check public directory exists
check_dir "public" || ((errors++))

if [ -d "public" ]; then
    # Check public files
    check_file "public/manifest.webapp" || echo -e "${YELLOW}⚠️${NC}  public/manifest.webapp (run ./build-kaios.sh)"
    check_file "public/index.html" || echo -e "${YELLOW}⚠️${NC}  public/index.html (run ./build-kaios.sh)"
    check_file "public/dist/bundle.js" || echo -e "${YELLOW}⚠️${NC}  public/dist/bundle.js (run ./build-kaios.sh)"
fi

echo ""
echo "Checking manifest validity..."
if python3 -m json.tool manifest.webapp > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} manifest.webapp is valid JSON"
else
    echo -e "${RED}❌${NC} manifest.webapp has JSON errors"
    ((errors++))
fi

echo ""
echo "Checking bundle size..."
if [ -f "dist/bundle.js" ]; then
    size=$(wc -c < "dist/bundle.js")
    if [ $size -gt 1000 ]; then
        echo -e "${GREEN}✅${NC} bundle.js exists and has content ($size bytes)"
    else
        echo -e "${YELLOW}⚠️${NC}  bundle.js is very small ($size bytes) - may need rebuild"
    fi
else
    echo -e "${RED}❌${NC} bundle.js not found - run 'npm run build'"
    ((errors++))
fi

echo ""
echo "========================================="
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Ready to run in KaiOS emulator!"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./serve-kaios.sh"
    echo "  2. Open KaiOS Simulator"
    echo "  3. Enter: http://localhost:8080/manifest.webapp"
else
    echo -e "${RED}❌ Found $errors error(s)${NC}"
    echo ""
    echo "Fix the errors above, then try again."
    echo ""
    if [ ! -f "dist/bundle.js" ]; then
        echo "To build the app:"
        echo "  npm run build"
        echo ""
    fi
    if [ ! -f "icons/icon-56.png" ]; then
        echo "To generate icons:"
        echo "  ./create-icons.sh"
        echo ""
    fi
fi
echo "========================================="
