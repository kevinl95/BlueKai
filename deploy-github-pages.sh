#!/bin/bash

# BlueKai GitHub Pages Deployment Script
# Builds and deploys to GitHub Pages (gh-pages branch)

set -e  # Exit on error

echo "🚀 BlueKai GitHub Pages Deployment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
fi

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf dist

# Run production build
echo -e "${YELLOW}📦 Building production bundle...${NC}"
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist directory not created.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Deploy to gh-pages branch
echo ""
echo -e "${YELLOW}📤 Deploying to GitHub Pages...${NC}"

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "gh-pages branch exists"
else
    echo "Creating gh-pages branch..."
    git branch gh-pages
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Switch to gh-pages branch
git checkout gh-pages

# Remove old files (keep .git)
echo "Removing old files..."
git rm -rf . 2>/dev/null || true

# Copy new build files
echo "Copying new build files..."
cp -r dist/* .

# Add .nojekyll if it doesn't exist
if [ ! -f ".nojekyll" ]; then
    touch .nojekyll
fi

# Add all files
git add .

# Commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to deploy${NC}"
else
    git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to remote
    echo -e "${YELLOW}Pushing to remote...${NC}"
    git push origin gh-pages
    
    echo -e "${GREEN}✅ Successfully deployed to GitHub Pages!${NC}"
fi

# Switch back to original branch
git checkout "$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Your app should be available at:"
echo "   https://[your-username].github.io/[your-repo-name]/"
echo ""
echo "If this is your first deployment, you may need to:"
echo "1. Go to your repository settings"
echo "2. Navigate to Pages section"
echo "3. Set source to 'gh-pages' branch"
echo ""
