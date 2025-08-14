#!/bin/bash

# Test script to validate Vercel configuration
echo "🧪 Testing Vercel configuration..."
echo "==============================================="
echo "⚠️  IMPORTANT: For Vercel deployment, ensure Root Directory"
echo "   setting is EMPTY in Vercel dashboard settings!"
echo "==============================================="
echo ""

# Test install command
echo "📦 Testing install command..."
if npm ci --prefix frontend; then
    echo "✅ Install command works correctly"
else
    echo "❌ Install command failed"
    exit 1
fi

# Test build command
echo ""
echo "🔨 Testing build command..."
if npm run build --prefix frontend; then
    echo "✅ Build command works correctly"
else
    echo "❌ Build command failed"
    exit 1
fi

# Check output directory
echo ""
echo "📁 Checking output directory..."
if [ -d "frontend/dist" ]; then
    echo "✅ Output directory exists: frontend/dist"
    
    if [ -f "frontend/dist/index.html" ]; then
        echo "✅ index.html exists in output directory"
    else
        echo "❌ index.html missing from output directory"
        exit 1
    fi
    
    file_count=$(find frontend/dist -type f | wc -l)
    echo "📊 Build output contains $file_count files"
    
else
    echo "❌ Output directory missing: frontend/dist"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Vercel configuration is working correctly."
echo "==============================================="