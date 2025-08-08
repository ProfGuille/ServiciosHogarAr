# Database Migration Fix for Appointments Table Error

## Problem Summary
The NotificationCronService was failing in production with the error:
```
❌ Error checking upcoming appointments: DrizzleQueryError: Failed query... 
relation "appointments" does not exist
```

## Root Cause
The appointments table was missing from the production database migration, but the cron service code expected it to exist.

## Solution Applied
1. **Fixed migration configuration** in `src/db.ts` to use the correct migrations folder
2. **Created new migration** `0001_add_appointments_notifications.sql` that adds:
   - `appointments` table with proper schema
   - `notifications` table for notification tracking
   - `notification_preferences` table for user preferences
   - `push_subscriptions` table for web push notifications

## Files Changed
- `backend/src/db.ts` - Fixed migration folder path
- `backend/drizzle.config.ts` - Updated to use relative paths
- `backend/migrations/0001_add_appointments_notifications.sql` - New migration file
- `backend/migrations/meta/_journal.json` - Updated migration journal
- `backend/migrations/meta/0001_snapshot.json` - Migration metadata
- `backend/src/shared/schema/appointments.ts` - Cleaned up schema definition

## Deployment Instructions

### 1. Apply the Migration to Production
The new migration file `migrations/0001_add_appointments_notifications.sql` needs to be applied to the production database.

**Option A: Automatic Migration (Recommended)**
The application will automatically run migrations on startup if the migration system is properly configured. The fix ensures migrations run from the correct folder.

**Option B: Manual Migration**
If needed, the migration can be applied manually:
```sql
-- From migrations/0001_add_appointments_notifications.sql
CREATE TABLE "appointments" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "client_id" integer NOT NULL,
  "service_id" integer,
  "scheduled_at" timestamp NOT NULL,
  "status" varchar(32),
  "created_at" timestamp DEFAULT now()
);

-- ... (plus other tables - see full migration file)
```

### 2. Deploy the Updated Code
Deploy the updated backend code that includes:
- Fixed migration configuration
- Updated schema definitions
- Migration files

### 3. Verification
After deployment, verify that:
1. The cron service starts without the "appointments does not exist" error
2. The migration was applied successfully
3. All new tables are created

## Expected Outcome
After applying this fix:
- ✅ Cron service will start successfully
- ✅ NotificationCronService.checkUpcomingAppointments() will work
- ✅ No more "relation 'appointments' does not exist" errors
- ✅ Notification system will be ready for use

## Verification Commands
To verify the fix worked in production:

```bash
# Check if tables exist
psql $DATABASE_URL -c "\dt appointments notifications notification_preferences push_subscriptions"

# Test cron service (should not error about missing appointments table)
npm start
```

## Rollback Plan
If issues occur, the migration can be rolled back by dropping the new tables:
```sql
DROP TABLE IF EXISTS push_subscriptions;
DROP TABLE IF EXISTS notification_preferences; 
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS appointments;
```

However, this should not be necessary as the changes are additive and don't modify existing tables.