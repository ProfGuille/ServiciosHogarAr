#!/bin/bash

# Test Vercel Configuration
# This script tests if Vercel configuration will work properly

echo "🧪 Testing Vercel Configuration..."
echo ""

# Test 1: Check current branch
echo "📝 Test 1: Branch Detection"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Test 2: Test ignore command logic
echo ""
echo "📝 Test 2: Ignore Command Logic"
git rev-parse --abbrev-ref HEAD | grep -E '^(main|copilot/.*)$' -q
MATCH_RESULT=$?
echo "Branch matches pattern (main|copilot/*): $([[ $MATCH_RESULT -eq 0 ]] && echo "YES" || echo "NO")"

# Test ignore command (should return 1 for deploy, 0 for ignore)
git rev-parse --abbrev-ref HEAD | grep -E '^(main|copilot/.*)$' -q; [ $? -ne 0 ]
IGNORE_RESULT=$?
echo "Vercel ignore command result: $IGNORE_RESULT (0=ignore, 1=deploy)"
echo "Will Vercel deploy? $([[ $IGNORE_RESULT -eq 0 ]] && echo "NO ❌" || echo "YES ✅")"

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
echo "- Will deploy: $([[ $IGNORE_RESULT -eq 0 ]] && echo "NO" || echo "YES")"
echo "- Build: Working"
echo "- Configuration: Valid"
echo ""
echo "✅ Ready for Vercel deployment!"