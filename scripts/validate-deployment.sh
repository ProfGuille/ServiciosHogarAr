#!/bin/bash

# Pre-deployment validation script
# This script validates that all required components are ready for deployment

set -e

echo "=== Pre-Deployment Validation ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

validation_errors=0

# Function to report validation results
validate() {
    local test_name="$1"
    local condition="$2"
    
    if [[ $condition -eq 0 ]]; then
        echo -e "${GREEN}✅ $test_name${NC}"
    else
        echo -e "${RED}❌ $test_name${NC}"
        validation_errors=$((validation_errors + 1))
    fi
}

# Test 1: Frontend build exists
test_frontend_dist() {
    [[ -d "frontend/dist" && -f "frontend/dist/index.html" ]]
}
validate "Frontend build exists" $?

# Test 2: Frontend has required files
test_frontend_files() {
    [[ -f "frontend/dist/index.html" ]] && 
    [[ -d "frontend/dist/assets" ]] &&
    [[ $(find frontend/dist -name "*.js" | wc -l) -gt 0 ]]
}
validate "Frontend has required files" $?

# Test 3: Backend build exists
test_backend_dist() {
    [[ -d "backend/dist" && -f "backend/dist/index.js" ]]
}
validate "Backend build exists" $?

# Test 4: Frontend copied to backend
test_frontend_copied() {
    [[ -d "backend/frontend-dist" && -f "backend/frontend-dist/index.html" ]]
}
validate "Frontend copied to backend" $?

# Test 5: File counts match
test_file_counts() {
    local frontend_files=$(find frontend/dist -type f | wc -l)
    local backend_files=$(find backend/frontend-dist -type f | wc -l)
    [[ $frontend_files -eq $backend_files ]]
}
validate "File counts match between source and destination" $?

# Test 6: Package.json files exist
test_package_files() {
    [[ -f "frontend/package.json" && -f "backend/package.json" ]]
}
validate "Package.json files exist" $?

# Test 7: Deployment summary exists
test_deployment_summary() {
    [[ -f "deployment-summary.json" ]]
}
validate "Deployment summary exists" $?

# Test 8: Build scripts are executable
test_build_scripts() {
    [[ -x "scripts/build-deployment.sh" && -x "scripts/build-fallback.sh" ]]
}
validate "Build scripts are executable" $?

# Summary
echo ""
echo "=== Validation Summary ==="
if [[ $validation_errors -eq 0 ]]; then
    echo -e "${GREEN}✅ All validations passed! Deployment is ready.${NC}"
    exit 0
else
    echo -e "${RED}❌ $validation_errors validation(s) failed. Please fix before deploying.${NC}"
    exit 1
fi