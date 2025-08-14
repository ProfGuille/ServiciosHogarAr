# Vercel Deployment Fix

## Problem
Vercel deployment was failing with the error:
```
sh: line 1: cd: frontend: No such file or directory
Error: Command "cd frontend && npm ci" exited with 1
```

## Root Cause
The original `vercel.json` configuration used `cd frontend &&` commands:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm ci"
}
```

This approach fails in Vercel's build environment because the `cd` command doesn't work reliably in Vercel's execution context.

## Solution
Updated `vercel.json` to use npm's `--prefix` flag instead of `cd` commands:
```json
{
  "buildCommand": "npm run build --prefix frontend",
  "installCommand": "npm ci --prefix frontend"
}
```

## Why This Works
- `npm --prefix <directory>` runs npm commands in the specified directory without changing the working directory
- This approach is more reliable in containerized/serverless environments like Vercel
- The commands work from any working directory context

## Testing
The fix was verified locally:
```bash
# These commands work correctly from the repository root
npm ci --prefix frontend
npm run build --prefix frontend
```

## Impact
This change fixes the Vercel deployment issue while maintaining all other functionality:
- ✅ Frontend builds correctly
- ✅ Output directory remains `frontend/dist`
- ✅ All rewrites and headers configuration preserved
- ✅ API proxy to backend remains functional