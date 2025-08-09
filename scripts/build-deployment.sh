#!/bin/bash

# Robust deployment build script for Render
# This script implements multiple approaches and fallback mechanisms

set -e  # Exit on any error
set -o pipefail  # Exit on pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to verify directory and contents
verify_directory() {
    local dir="$1"
    local description="$2"
    
    if [[ ! -d "$dir" ]]; then
        log_error "$description directory not found: $dir"
        return 1
    fi
    
    local file_count=$(find "$dir" -type f | wc -l)
    if [[ $file_count -eq 0 ]]; then
        log_error "$description directory is empty: $dir"
        return 1
    fi
    
    log_success "$description directory verified: $dir ($file_count files)"
    return 0
}

# Function to verify essential files
verify_essential_files() {
    local base_dir="$1"
    local files=("index.html")
    
    for file in "${files[@]}"; do
        local file_path="$base_dir/$file"
        if [[ ! -f "$file_path" ]]; then
            log_error "Essential file missing: $file_path"
            return 1
        fi
        
        local file_size=$(stat -c%s "$file_path" 2>/dev/null || echo "0")
        if [[ $file_size -eq 0 ]]; then
            log_error "Essential file is empty: $file_path"
            return 1
        fi
        
        log_success "Essential file verified: $file ($file_size bytes)"
    done
    
    return 0
}

# Function to clean and prepare directories
prepare_build() {
    log_info "Preparing build environment..."
    
    # Clean up any previous builds
    if [[ -d "backend/frontend-dist" ]]; then
        log_info "Cleaning previous frontend-dist..."
        rm -rf backend/frontend-dist
    fi
    
    if [[ -d "frontend/dist" ]]; then
        log_info "Cleaning previous frontend dist..."
        rm -rf frontend/dist
    fi
    
    if [[ -d "backend/dist" ]]; then
        log_info "Cleaning previous backend dist..."
        rm -rf backend/dist
    fi
    
    log_success "Build environment prepared"
}

# Function to build frontend
build_frontend() {
    log_info "Building frontend..."
    
    if [[ ! -d "frontend" ]]; then
        log_error "Frontend directory not found"
        return 1
    fi
    
    cd frontend || {
        log_error "Cannot access frontend directory"
        return 1
    }
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_error "Frontend package.json not found"
        return 1
    fi
    
    # Install dependencies with retry logic
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        log_info "Installing frontend dependencies (attempt $((retry_count + 1))/$max_retries)..."
        
        if npm ci --production=false; then
            log_success "Frontend dependencies installed"
            break
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $max_retries ]]; then
                log_warning "Frontend dependency installation failed, retrying..."
                sleep 5
            else
                log_error "Frontend dependency installation failed after $max_retries attempts"
                return 1
            fi
        fi
    done
    
    # Build frontend
    log_info "Building frontend application..."
    if npm run build; then
        log_success "Frontend build completed"
    else
        log_error "Frontend build failed"
        return 1
    fi
    
    # Verify frontend build output
    if ! verify_directory "dist" "Frontend dist"; then
        return 1
    fi
    
    if ! verify_essential_files "dist"; then
        return 1
    fi
    
    # Return to root directory
    cd ..
    
    log_success "Frontend build stage completed successfully"
    return 0
}

# Function to build backend
build_backend() {
    log_info "Building backend..."
    
    if [[ ! -d "backend" ]]; then
        log_error "Backend directory not found"
        return 1
    fi
    
    cd backend || {
        log_error "Cannot access backend directory"
        return 1
    }
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_error "Backend package.json not found"
        return 1
    fi
    
    # Install dependencies with retry logic
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        log_info "Installing backend dependencies (attempt $((retry_count + 1))/$max_retries)..."
        
        if npm ci --production=false; then
            log_success "Backend dependencies installed"
            break
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $max_retries ]]; then
                log_warning "Backend dependency installation failed, retrying..."
                sleep 5
            else
                log_error "Backend dependency installation failed after $max_retries attempts"
                return 1
            fi
        fi
    done
    
    # Build backend
    log_info "Building backend application..."
    if npm run build; then
        log_success "Backend build completed"
    else
        log_error "Backend build failed"
        return 1
    fi
    
    # Verify backend build output (if dist directory should exist)
    if [[ -d "dist" ]]; then
        verify_directory "dist" "Backend dist"
    fi
    
    # Return to root directory
    cd ..
    
    log_success "Backend build stage completed successfully"
    return 0
}

# Function to copy frontend files with multiple methods
copy_frontend_files() {
    log_info "Copying frontend files to backend..."
    
    # Verify source exists
    if ! verify_directory "frontend/dist" "Frontend source"; then
        return 1
    fi
    
    # Method 1: Direct copy
    log_info "Attempting direct copy method..."
    if cp -r frontend/dist backend/frontend-dist; then
        log_success "Direct copy method succeeded"
    else
        log_warning "Direct copy method failed, trying alternative methods..."
        
        # Method 2: Create directory first, then copy contents
        log_info "Attempting staged copy method..."
        mkdir -p backend/frontend-dist
        if cp -r frontend/dist/* backend/frontend-dist/; then
            log_success "Staged copy method succeeded"
        else
            log_warning "Staged copy method failed, trying rsync method..."
            
            # Method 3: Use rsync if available
            if command -v rsync &> /dev/null; then
                log_info "Attempting rsync method..."
                if rsync -av frontend/dist/ backend/frontend-dist/; then
                    log_success "Rsync method succeeded"
                else
                    log_error "All copy methods failed"
                    return 1
                fi
            else
                log_error "Rsync not available and other copy methods failed"
                return 1
            fi
        fi
    fi
    
    # Verify the copy was successful
    if ! verify_directory "backend/frontend-dist" "Copied frontend"; then
        return 1
    fi
    
    if ! verify_essential_files "backend/frontend-dist"; then
        return 1
    fi
    
    # Compare file counts
    local source_files=$(find frontend/dist -type f | wc -l)
    local dest_files=$(find backend/frontend-dist -type f | wc -l)
    
    if [[ $source_files -ne $dest_files ]]; then
        log_warning "File count mismatch: source=$source_files, destination=$dest_files"
        # Don't fail, just warn, as some build systems create different file structures
    else
        log_success "File count verified: $dest_files files copied"
    fi
    
    log_success "Frontend files copy stage completed successfully"
    return 0
}

# Function to create deployment summary
create_deployment_summary() {
    log_info "Creating deployment summary..."
    
    cat > deployment-summary.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "build_success": true,
  "frontend": {
    "built": $(test -d "frontend/dist" && echo "true" || echo "false"),
    "file_count": $(find frontend/dist -type f 2>/dev/null | wc -l),
    "index_exists": $(test -f "frontend/dist/index.html" && echo "true" || echo "false")
  },
  "backend": {
    "built": $(test -d "backend/dist" && echo "true" || echo "false"),
    "frontend_copied": $(test -d "backend/frontend-dist" && echo "true" || echo "false"),
    "frontend_file_count": $(find backend/frontend-dist -type f 2>/dev/null | wc -l),
    "frontend_index_exists": $(test -f "backend/frontend-dist/index.html" && echo "true" || echo "false")
  },
  "environment": {
    "node_version": "$(node --version 2>/dev/null || echo 'unknown')",
    "npm_version": "$(npm --version 2>/dev/null || echo 'unknown')",
    "working_directory": "$(pwd)"
  }
}
EOF
    
    log_success "Deployment summary created"
    cat deployment-summary.json
}

# Main build process
main() {
    log_info "Starting robust deployment build process..."
    log_info "Working directory: $(pwd)"
    log_info "Build script: $0"
    log_info "Timestamp: $(date)"
    
    # Stage 1: Prepare environment
    if ! prepare_build; then
        log_error "Build preparation failed"
        exit 1
    fi
    
    # Stage 2: Build frontend
    if ! build_frontend; then
        log_error "Frontend build stage failed"
        exit 1
    fi
    
    # Stage 3: Build backend
    if ! build_backend; then
        log_error "Backend build stage failed"
        exit 1
    fi
    
    # Stage 4: Copy frontend files
    if ! copy_frontend_files; then
        log_error "Frontend files copy stage failed"
        exit 1
    fi
    
    # Stage 5: Create summary
    create_deployment_summary
    
    log_success "All build stages completed successfully!"
    log_info "Deployment is ready for startup"
    
    return 0
}

# Run main function
main "$@"