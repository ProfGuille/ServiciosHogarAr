#!/bin/bash

# Deployment verification and debugging script
echo "=== Deployment Verification Script ==="
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Working directory: $(pwd)"
echo "__dirname equivalent: $(dirname "$0")"

# Basic environment info
echo -e "\n=== Environment ==="
echo "USER: $(whoami)"
echo "PWD: $(pwd)"
echo "HOME: $HOME"
echo "NODE_ENV: $NODE_ENV"
echo "RENDER_STAGE: ${RENDER_STAGE:-not_set}"

# Check directory structure
echo -e "\n=== Directory Structure ==="
echo "Current directory contents:"
ls -la

echo -e "\nParent directory contents:"
ls -la .. 2>/dev/null || echo "Cannot access parent directory"

echo -e "\nLooking for frontend-dist directories:"
find . -name "frontend-dist" -type d 2>/dev/null || echo "No frontend-dist directories found"

echo -e "\nLooking for index.html files:"
find . -name "index.html" -type f 2>/dev/null || echo "No index.html files found"

# Check specific paths that the backend looks for
echo -e "\n=== Backend Path Analysis ==="
PATHS=(
  "./frontend-dist"
  "../frontend-dist"
  "../../frontend-dist"
  "../../../frontend-dist"
  "backend/frontend-dist"
  "dist/frontend-dist"
  "../dist/frontend-dist"
  "frontend/dist"
  "../frontend/dist"
)

for path in "${PATHS[@]}"; do
  if [ -d "$path" ]; then
    echo "✅ Directory exists: $path"
    if [ -f "$path/index.html" ]; then
      echo "   ✅ index.html found"
      echo "   Files: $(ls "$path" | wc -l) total"
    else
      echo "   ❌ index.html NOT found"
    fi
  else
    echo "❌ Directory missing: $path"
  fi
done

# Check for diagnostic files
echo -e "\n=== Diagnostic Files ==="
if [ -f "deployment-diagnostic.json" ]; then
  echo "✅ deployment-diagnostic.json found:"
  cat deployment-diagnostic.json
else
  echo "❌ deployment-diagnostic.json not found"
fi

if [ -f "../deployment-diagnostic.json" ]; then
  echo "✅ ../deployment-diagnostic.json found:"
  cat ../deployment-diagnostic.json
else
  echo "❌ ../deployment-diagnostic.json not found"
fi

# Check build directories
echo -e "\n=== Build Verification ==="
if [ -d "dist" ]; then
  echo "✅ Backend dist directory exists"
  echo "   Contents: $(ls dist | head -5 | tr '\n' ' ')..."
else
  echo "❌ Backend dist directory missing"
fi

if [ -d "../frontend/dist" ]; then
  echo "✅ Frontend dist directory exists"
  echo "   Contents: $(ls ../frontend/dist | head -5 | tr '\n' ' ')..."
elif [ -d "frontend/dist" ]; then
  echo "✅ Frontend dist directory exists (local)"
  echo "   Contents: $(ls frontend/dist | head -5 | tr '\n' ' ')..."
else
  echo "❌ Frontend dist directory missing"
fi

echo -e "\n=== Verification Complete ==="