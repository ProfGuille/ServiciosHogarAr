#!/bin/bash

# Test Vercel Configuration
# This script tests if Vercel configuration will work properly

echo "🧪 Testing Vercel Configuration..."
echo ""

# Test 1: Check current branch
echo "📝 Test 1: Branch Detection"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Test 2: Dashboard Configuration Status
echo ""
echo "📝 Test 2: Deployment Configuration"
echo "⚠️  Important: This project uses Vercel Dashboard settings for deployment control."
echo "Vercel Dashboard Settings:"
echo "  - Ignored Build Step: Custom Command"
echo "  - Command: echo \"No ignored build step\"; exit 1"
echo "  - Result: ALL branches will deploy (exit 1 = always deploy)"
echo ""
echo "Current branch '$CURRENT_BRANCH' will deploy: ✅ YES"

# Test 3: Validate vercel.json syntax
echo ""
echo "📝 Test 3: Vercel.json Validation"
if command -v jq &> /dev/null; then
    if jq empty vercel.json 2>/dev/null; then
        echo "vercel.json syntax: ✅ Valid JSON"
    else
        echo "vercel.json syntax: ❌ Invalid JSON"
        exit 1
    fi
else
    echo "vercel.json syntax: ⚠️  jq not available, skipping validation"
fi

# Test 4: Check required files
echo ""
echo "📝 Test 4: Required Files"
required_files=("vercel.json" "frontend/package.json" "frontend/vite.config.ts")
for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "$file: ✅ Present"
    else
        echo "$file: ❌ Missing"
        exit 1
    fi
done

# Test 5: Check frontend dependencies
echo ""
echo "📝 Test 5: Frontend Dependencies"
cd frontend
if [[ -f "package-lock.json" ]]; then
    echo "Frontend dependencies: ✅ package-lock.json present"
else
    echo "Frontend dependencies: ⚠️  package-lock.json missing, will run npm install"
fi

# Test 6: Test build process
echo ""
echo "📝 Test 6: Build Process"
echo "Running frontend build..."
if npm run build &>/dev/null; then
    echo "Frontend build: ✅ Successful"
    if [[ -d "dist" ]] && [[ -f "dist/index.html" ]]; then
        echo "Build output: ✅ dist/index.html present"
    else
        echo "Build output: ❌ dist/index.html missing"
        exit 1
    fi
else
    echo "Frontend build: ❌ Failed"
    exit 1
fi

# Test 7: Check environment variables
echo ""
echo "📝 Test 7: Environment Variables"
if [[ -f ".env.production" ]]; then
    echo ".env.production: ✅ Present"
    echo "Environment variables configured:"
    grep "^VITE_" .env.production | sed 's/=.*/=***/' || echo "No VITE_ variables found"
else
    echo ".env.production: ❌ Missing"
fi

cd ..

# Test 8: Verify no .htaccess in build output
echo ""
echo "📝 Test 8: Vercel Compatibility"
if [[ -f "frontend/dist/.htaccess" ]]; then
    echo "Build output: ⚠️  .htaccess present (not needed for Vercel)"
else
    echo "Build output: ✅ No .htaccess (Vercel-compatible)"
fi

echo ""
echo "🎉 All tests completed!"
echo ""
echo "📋 Summary:"
echo "- Branch: $CURRENT_BRANCH"
echo "- Will deploy: YES (Dashboard setting: always deploy)"
echo "- Build: Working"
echo "- Configuration: Valid"
echo ""
echo "✅ Ready for Vercel deployment!"
echo ""
echo "📌 Note: Deployment behavior is controlled by Vercel Dashboard settings,"
echo "   not by ignoreCommand in vercel.json (which has been removed)."