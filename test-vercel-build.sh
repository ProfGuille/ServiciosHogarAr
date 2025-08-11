#!/bin/bash

# Vercel Build Test Script
# This script simulates Vercel's build process for debugging

echo "🔄 Starting Vercel build simulation..."

# Check Node.js version
echo "📋 Node.js version:"
node --version

# Check npm version
echo "📋 npm version:"
npm --version

# Change to frontend directory
echo "📁 Changing to frontend directory..."
cd frontend || exit 1

# Install dependencies (like Vercel would)
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️ Building project..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build output size:"
    du -sh dist/
    echo "📁 Build files:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Vercel build simulation completed successfully!"