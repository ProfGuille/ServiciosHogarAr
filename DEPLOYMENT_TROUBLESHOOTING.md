# Servicios Hogar Backend - Deployment Troubleshooting

## HTTP 503 Error Resolution

This document explains how the HTTP 503 Service Unavailable error was resolved and provides troubleshooting steps for future deployment issues.

## Problem Summary

The original issue was that the server would crash during startup if the `DATABASE_URL` environment variable was missing or invalid, causing a 503 error.

## Solution Implemented

### 1. Graceful Database Connection Handling

The server now handles missing database connections gracefully:

- **Before**: Server would crash with a fatal error if `DATABASE_URL` was missing
- **After**: Server starts in "limited mode" and logs warnings instead of crashing

### 2. Health Check Improvements

Enhanced health checks provide detailed diagnostic information:

```bash
# Test server status
curl https://servicioshogar-backend-uje1.onrender.com/api/health

# Quick ping test
curl https://servicioshogar-backend-uje1.onrender.com/api/ping
```

### 3. Fallback Mechanisms

- Session store falls back to memory store when database is unavailable
- Notification cron jobs are disabled when database is not available
- Routes are loaded conditionally with error handling

## Testing the Deployment

### Local Testing

```bash
cd backend
npm run build
node test-deployment.js
```

### Production Testing

```bash
# Test basic connectivity
curl https://servicioshogar-backend-uje1.onrender.com/

# Test health status
curl https://servicioshogar-backend-uje1.onrender.com/api/health

# Test simple ping
curl https://servicioshogar-backend-uje1.onrender.com/api/ping
```

## Required Environment Variables

### Critical (Server won't start without these)
- `PORT` - Server port (default: 3000, Render uses 10000)

### Important (Server starts but with limited functionality)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `NODE_ENV` - Environment (production/development)

### Optional (Additional features)
- `VAPID_PUBLIC_KEY` - For push notifications
- `VAPID_PRIVATE_KEY` - For push notifications  
- `VAPID_EMAIL` - For push notifications

## Common Issues and Solutions

### 1. Server Returns 503

**Symptoms**: 
- `curl` returns "HTTP ERROR 503"
- Server appears offline

**Diagnosis**:
```bash
# Check if server is responding at all
curl -I https://servicioshogar-backend-uje1.onrender.com/api/ping

# Check detailed health status
curl https://servicioshogar-backend-uje1.onrender.com/api/health
```

**Solutions**:
1. Check Render logs for startup errors
2. Verify environment variables are configured
3. Check build process completed successfully

### 2. Database Connection Issues

**Symptoms**:
- Health check shows `"database": { "status": "disconnected" }`
- Warnings about limited mode in logs

**Solutions**:
1. Verify `DATABASE_URL` is configured in Render dashboard
2. Test database connection manually
3. Check database service is running

### 3. Session/Authentication Issues

**Symptoms**:
- Users can't log in
- Sessions don't persist
- Health check shows `"session_store": { "type": "memory" }`

**Solutions**:
1. Configure `DATABASE_URL` for persistent sessions
2. Set `SESSION_SECRET` environment variable
3. Verify database session table exists

## Render Configuration

The `render.yaml` file includes:

```yaml
healthCheckPath: /api/health  # Render will use this to check service health
envVars:
  - key: NODE_ENV
    value: production
  # ... other environment variables
```

## Deployment Checklist

- [ ] Build completes successfully
- [ ] Server starts without crashes
- [ ] Health check returns 200 status
- [ ] Basic endpoints respond correctly
- [ ] Environment variables configured
- [ ] Database connection (if available)
- [ ] External services configured (email, push notifications)

## Monitoring

### Log Messages to Watch For

**Good Signs**:
```
🚀 Servidor ejecutándose en puerto 10000
✅ Database connection initialized successfully
✅ Rutas registradas exitosamente
```

**Warning Signs** (non-critical):
```
⚠️ Database not available - running in limited mode
⚠️ Using memory session store
⚠️ Notification cron jobs: Deshabilitados
```

**Error Signs** (critical):
```
❌ Error registering routes
ERROR: Server startup failed
```

## Contact Information

For deployment issues:
- Check server logs in Render dashboard
- Test endpoints using the curl commands above
- Review this troubleshooting guide

The server is designed to be resilient and should start even with missing configuration, providing clear diagnostic information through the health endpoint.