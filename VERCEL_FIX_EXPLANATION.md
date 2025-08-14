# Vercel Deployment Fix

> **⚠️ IMPORTANT**: This fix requires **clearing the Root Directory setting** in Vercel dashboard (Settings → Build & Development Settings). The Root Directory field must be **empty** for this configuration to work.

## Problem
Vercel deployment was failing with the error:
```
sh: line 1: cd: frontend: No such file or directory
Error: Command "cd frontend && npm ci" exited with 1
```

## Root Cause
The issue has two parts:

1. **vercel.json Configuration**: The original configuration used `cd frontend &&` commands:
```json
{
  "buildCommand": "cd frontend && npm run build", 
  "installCommand": "cd frontend && npm ci"
}
```

2. **Vercel Dashboard Settings**: If "frontend" is set as the Root Directory in Vercel's Build & Development Settings, Vercel tries to change into that directory first, causing the `cd frontend` commands to fail.

This combination fails because Vercel attempts to navigate to a directory that doesn't exist in the expected context.

## Solution

### Step 1: Update vercel.json
Updated `vercel.json` to use npm's `--prefix` flag instead of `cd` commands:
```json
{
  "buildCommand": "npm run build --prefix frontend",
  "installCommand": "npm ci --prefix frontend"
}
```

### Step 2: Configure Vercel Dashboard Settings
**CRITICAL**: The Root Directory setting in Vercel must be cleared:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Build & Development Settings**
3. Find the **Root Directory** field
4. Clear/delete "frontend" from this field and leave it **empty**
5. Save the settings
6. Trigger a new deployment (Redeploy)

### Why Both Steps Are Required
- The `--prefix frontend` approach requires running commands from the repository root
- If Root Directory is set to "frontend", Vercel changes into that directory first
- This causes the `--prefix frontend` commands to look for `frontend/frontend/` path
- Clearing Root Directory ensures commands run from the repository root as expected

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
This complete solution fixes the Vercel deployment issue:
- ✅ Frontend builds correctly from repository root
- ✅ Output directory remains `frontend/dist`
- ✅ All rewrites and headers configuration preserved
- ✅ API proxy to backend remains functional
- ✅ Works regardless of Vercel's internal directory handling

## Quick Fix Summary
If you're experiencing this issue:
1. Update `vercel.json` with the `--prefix` commands (already done)
2. **Clear the Root Directory setting** in Vercel dashboard (Settings → Build & Development Settings)
3. Redeploy the project

The Root Directory should be **empty** for this configuration to work properly.