#!/bin/bash

# ----------------------
# CRICKET AUCTION APP - Azure Deployment Script
# ----------------------

set -e

echo "=========================================="
echo "Cricket Auction App - Azure Deployment"
echo "=========================================="

# Deployment paths
DEPLOYMENT_SOURCE=${DEPLOYMENT_SOURCE:-$(pwd)}
DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET:-/home/site/wwwroot}

echo ""
echo "Source: $DEPLOYMENT_SOURCE"
echo "Target: $DEPLOYMENT_TARGET"
echo ""

# 1. Clean target directory
echo "Step 1: Cleaning target directory..."
if [ -d "$DEPLOYMENT_TARGET" ]; then
  cd "$DEPLOYMENT_TARGET"
  rm -rf ./*
fi

# 2. Copy source files
echo "Step 2: Copying source files..."
cp -r "$DEPLOYMENT_SOURCE"/* "$DEPLOYMENT_TARGET/" || exit 1

cd "$DEPLOYMENT_TARGET"

# 3. Install production dependencies
echo "Step 3: Installing production dependencies..."
npm ci --production || npm install --production || exit 1

# 4. Build the application
echo "Step 4: Building the application..."
echo "  - Building frontend (Vite)..."
NODE_ENV=production npm run build:client || exit 1

echo "  - Building backend (esbuild)..."
NODE_ENV=production npm run build:server || exit 1

# 5. Copy static assets to dist
echo "Step 5: Copying static assets..."
if [ -d "client/public" ]; then
  mkdir -p dist/public
  cp -r client/public/* dist/public/ || true
fi

if [ -d "attached_assets" ]; then
  mkdir -p dist/public/assets
  cp -r attached_assets/* dist/public/assets/ || true
fi

# 6. Copy config files
echo "Step 6: Copying configuration files..."
if [ -f "config.json" ]; then
  cp config.json dist/ || true
fi

if [ -f "players.xlsx" ]; then
  cp players.xlsx dist/ || true
fi

# 7. Cleanup unnecessary files
echo "Step 7: Cleaning up..."
rm -rf node_modules/.cache
rm -rf client/node_modules || true

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Application structure:"
echo "  - Backend: dist/index.js"
echo "  - Frontend: dist/public/*"
echo "  - Assets: dist/public/assets/*"
echo "  - Config: dist/config.json"
echo ""
