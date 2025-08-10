#!/bin/bash

# Simple fallback build script for deployment
# This is used if the main build script fails

set -e

echo "=== FALLBACK BUILD SCRIPT ==="
echo "Using simplified build process..."

# Build frontend
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Build backend  
echo "Building backend..."
cd backend
npm ci
npm run build

# Copy frontend files with verification
echo "Copying frontend files..."
cp -r ../frontend/dist ./frontend-dist

# Verify copy worked
if [ ! -f "./frontend-dist/index.html" ]; then
    echo "ERROR: Frontend copy verification failed"
    exit 1
fi

echo "Fallback build completed successfully"