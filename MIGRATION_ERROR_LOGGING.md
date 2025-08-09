# Database Migration Error Logging

This document describes the database migration error logging functionality implemented in the ServiciosHogarAr backend.

## Overview

The system now logs all database migration errors to a dedicated log file `logs/db_migration_errors.log` in addition to console logging. This ensures that migration errors are not lost in production environments where console logs might be ephemeral.

## Log File Location

- **Development**: `backend/logs/db_migration_errors.log`
- **Production**: `logs/db_migration_errors.log` (relative to the backend working directory)

## Log Format

Each log entry includes:

```
[ISO_TIMESTAMP] MIGRATION ERROR: Error message
Stack trace: Full stack trace (if available)
---
```

### Example

```
[2025-01-15T10:30:45.123Z] MIGRATION ERROR: relation "appointments" does not exist
Stack trace: Error: relation "appointments" does not exist
    at migrate (/app/backend/src/db.ts:59:5)
    at runMigrations (/app/backend/src/db.ts:78:11)
    at async initializeApp (/app/backend/src/index.ts:232:25)
---
```

## Features

- **Automatic directory creation**: The `logs/` directory is created automatically if it doesn't exist
- **Append-only logging**: New errors are appended to the existing log file
- **Timestamp tracking**: Each error is timestamped with ISO format
- **Stack trace preservation**: Full stack traces are captured when available
- **Graceful error handling**: If file logging fails, the system continues to work with console logging only

## File Management

### Git Ignore

The log files are automatically excluded from version control:
- `logs/` directory
- `*.log` files
- `db_migration_errors.log` specifically

### Log Rotation

Currently, the system does not implement automatic log rotation. In production environments, consider implementing:
- Log rotation based on file size
- Automatic cleanup of old log files
- Integration with system log management tools

## Testing

The logging functionality can be tested using:

```bash
cd backend
npx tsx src/test-migration-logging.ts
```

This test:
1. Creates a mock migration error
2. Logs it to the file system
3. Verifies the log file was created with correct content
4. Cleans up test files

## Usage in Code

The migration error logging is automatically triggered whenever `runMigrations()` encounters an error. No additional configuration is required.

```typescript
// Automatic logging happens in db.ts
export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: 'migrations' });
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    logMigrationError(error); // ← Automatic file logging
    return false;
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission errors**: Ensure the application has write permissions to create the `logs/` directory
2. **Disk space**: Monitor disk usage if migration errors occur frequently
3. **File path issues**: The log file path is relative to the backend working directory

### Debugging

If migration error logging is not working:

1. Check console for "Failed to write migration error to log file" messages
2. Verify file system permissions
3. Ensure the backend working directory is correct
4. Run the test script to isolate issues

## Security Considerations

- Log files may contain sensitive database connection information
- Ensure log files are not accessible via web server
- Consider log file encryption in highly sensitive environments
- Regularly review and clean up old log files