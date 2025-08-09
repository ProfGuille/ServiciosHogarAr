#!/bin/bash

# Debug script for frontend deployment issues
# This script helps diagnose why the frontend might not be available

echo "=== Frontend Deployment Diagnostic Script ==="
echo "Current working directory: $(pwd)"
echo "Script location: $(dirname "$0")"
echo "Date: $(date)"
echo ""

echo "=== Directory Structure ==="
echo "Repository root contents:"
ls -la
echo ""

echo "=== Frontend Directory ==="
if [ -d "frontend" ]; then
    echo "✅ Frontend directory exists"
    echo "Frontend directory contents:"
    ls -la frontend/
    echo ""
    
    if [ -d "frontend/dist" ]; then
        echo "✅ Frontend dist directory exists"
        echo "Frontend dist contents:"
        ls -la frontend/dist/
        echo ""
        
        if [ -f "frontend/dist/index.html" ]; then
            echo "✅ Frontend index.html exists"
            echo "index.html size: $(stat -c%s frontend/dist/index.html) bytes"
        else
            echo "❌ Frontend index.html missing"
        fi
    else
        echo "❌ Frontend dist directory missing"
        echo "Run: cd frontend && npm ci && npm run build"
    fi
else
    echo "❌ Frontend directory missing"
fi
echo ""

echo "=== Backend Directory ==="
if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
    echo "Backend directory contents:"
    ls -la backend/
    echo ""
    
    if [ -d "backend/frontend-dist" ]; then
        echo "✅ Backend frontend-dist directory exists"
        echo "Backend frontend-dist contents:"
        ls -la backend/frontend-dist/
        echo ""
        
        if [ -f "backend/frontend-dist/index.html" ]; then
            echo "✅ Backend frontend-dist/index.html exists"
            echo "index.html size: $(stat -c%s backend/frontend-dist/index.html) bytes"
        else
            echo "❌ Backend frontend-dist/index.html missing"
        fi
    else
        echo "❌ Backend frontend-dist directory missing"
        echo "Run: cp -r frontend/dist backend/frontend-dist"
    fi
    
    if [ -d "backend/dist" ]; then
        echo "✅ Backend dist directory exists (compiled TypeScript)"
        echo "Backend dist contents:"
        ls -la backend/dist/
    else
        echo "❌ Backend dist directory missing"
        echo "Run: cd backend && npm run build"
    fi
else
    echo "❌ Backend directory missing"
fi
echo ""

echo "=== Build Commands ==="
echo "To build frontend:"
echo "  cd frontend && npm ci && npm run build"
echo ""
echo "To build backend:"
echo "  cd backend && npm ci && npm run build"
echo ""
echo "To copy frontend files:"
echo "  cp -r frontend/dist backend/frontend-dist"
echo ""
echo "Complete build command (from render.yaml):"
echo "  cd frontend && npm ci && npm run build && cd ../backend && npm ci && npm run build && cp -r ../frontend/dist ./frontend-dist"
echo ""

echo "=== Environment Information ==="
echo "Node version: $(node --version 2>/dev/null || echo 'Node not found')"
echo "npm version: $(npm --version 2>/dev/null || echo 'npm not found')"
echo "Current user: $(whoami)"
echo "PATH: $PATH"
echo ""

echo "=== Package.json Files ==="
if [ -f "package.json" ]; then
    echo "✅ Root package.json exists"
else
    echo "❌ Root package.json missing"
fi

if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json exists"
else
    echo "❌ Backend package.json missing"
fi
echo ""

echo "=== End of Diagnostic ==="