# Migration Guide - ServiciosHogar.com.ar

## 🔄 Database Migration Procedures

### Overview
This guide covers all migration procedures for the ServiciosHogar.com.ar platform, including database schema updates, data migrations, application updates, and platform migrations.

## 📊 Database Schema Migrations

### Migration System (Drizzle ORM)

#### Current Migration Setup
- **ORM**: Drizzle ORM with TypeScript
- **Database**: PostgreSQL (Neon hosting)
- **Migration Files**: Located in `backend/migrations/`
- **Configuration**: `backend/drizzle.config.ts`

#### Migration Commands
```bash
# Generate new migration
cd backend
npm run db:generate

# Run pending migrations
npm run db:migrate

# Check migration status
npm run db:status

# Rollback last migration (if supported)
npm run db:rollback
```

### Schema Evolution History

#### Current Schema Version: v3.0
**Tables:**
- `users` - User accounts (clients and providers)
- `services` - Available service types
- `providers` - Provider profiles and information
- `providerServices` - Services offered by providers
- `bookings` - Service reservations
- `reviews` - Customer reviews and ratings
- `payments` - Payment transactions
- `messages` - Communication between users

#### Migration Path from v2.0 to v3.0
```sql
-- Added provider services relationship
CREATE TABLE provider_services (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES providers(id),
  service_id INTEGER REFERENCES services(id),
  price DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced reviews table
ALTER TABLE reviews ADD COLUMN response TEXT;
ALTER TABLE reviews ADD COLUMN response_date TIMESTAMP;

-- Added messaging system
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  recipient_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Future Migration Planning

#### ID Type Migration (Integer to UUID)
**When to Execute**: When platform scales to 1M+ users
**Impact**: High - requires application-wide changes

**Migration Strategy:**
1. **Phase 1**: Add UUID columns alongside existing integer IDs
2. **Phase 2**: Update application to use UUID for new records
3. **Phase 3**: Migrate existing data to UUID
4. **Phase 4**: Remove integer ID columns

```sql
-- Phase 1: Add UUID columns
ALTER TABLE users ADD COLUMN uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE providers ADD COLUMN uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE bookings ADD COLUMN uuid UUID DEFAULT gen_random_uuid();

-- Phase 2: Create indexes
CREATE UNIQUE INDEX idx_users_uuid ON users(uuid);
CREATE UNIQUE INDEX idx_providers_uuid ON providers(uuid);
CREATE UNIQUE INDEX idx_bookings_uuid ON bookings(uuid);

-- Phase 3: Data migration script needed
-- Phase 4: Drop integer columns and rename UUID columns
```

## 🚀 Application Code Migrations

### Backend API Migrations

#### Version 2.0 to 3.0 Migration Steps

**1. Dependencies Update**
```bash
cd backend
npm update drizzle-orm
npm update @neondatabase/serverless
npm install zod@latest
```

**2. Schema File Updates**
```typescript
// backend/src/db/schema.ts
// Updated provider services relation
export const providerServices = pgTable('provider_services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => providers.id),
  serviceId: integer('service_id').references(() => services.id),
  price: decimal('price', { precision: 10, scale: 2 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**3. API Route Updates**
```typescript
// New routes added
app.get('/api/providers/:id/services', getProviderServices);
app.post('/api/providers/:id/services', addProviderService);
app.put('/api/providers/:id/services/:serviceId', updateProviderService);
```

**4. Validation Schema Updates**
```typescript
// backend/src/validation/schemas.ts
export const providerServiceSchema = z.object({
  serviceId: z.number(),
  price: z.number().positive(),
  description: z.string().min(10),
});
```

### Frontend Application Migrations

#### React/TypeScript Updates

**1. Component Migrations**
```bash
cd frontend
npm update react react-dom
npm update @types/react @types/react-dom
npm update vite @vitejs/plugin-react
```

**2. Type Definition Updates**
```typescript
// frontend/src/types/index.ts
export interface ProviderService {
  id: number;
  providerId: number;
  serviceId: number;
  price: number;
  description: string;
  service: Service;
}
```

**3. API Client Updates**
```typescript
// frontend/src/lib/api.ts
export const providerServicesApi = {
  getByProvider: (providerId: number) => 
    apiClient.get(`/providers/${providerId}/services`),
  
  create: (providerId: number, data: CreateProviderServiceData) =>
    apiClient.post(`/providers/${providerId}/services`, data),
    
  update: (providerId: number, serviceId: number, data: UpdateProviderServiceData) =>
    apiClient.put(`/providers/${providerId}/services/${serviceId}`, data),
};
```

## 🏗️ Infrastructure Migrations

### Hosting Platform Migrations

#### Current Infrastructure
- **Frontend**: Hostinger (Apache/PHP hosting)
- **Backend**: Render (Node.js hosting)
- **Database**: Neon (PostgreSQL hosting)
- **CDN**: Cloudflare (optional)

#### Migration to Alternative Platforms

**Option 1: Vercel + PlanetScale Migration**
```bash
# Frontend to Vercel
npm install -g vercel
vercel login
vercel --prod

# Database to PlanetScale
# Export data from Neon
pg_dump $DATABASE_URL > backup.sql

# Import to PlanetScale
# Follow PlanetScale migration guide
```

**Option 2: AWS Full Migration**
```bash
# Frontend to S3 + CloudFront
aws s3 sync dist/ s3://servicioshogar-frontend
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

# Backend to EC2 or Lambda
# Database to RDS
```

### Environment Configuration Migration

#### Environment Variables Mapping
```bash
# Development to Staging
cp .env.development .env.staging
# Edit staging-specific values

# Staging to Production
cp .env.staging .env.production
# Edit production-specific values
```

#### Configuration Files
```yaml
# backend/render.yaml (Render deployment)
services:
  - type: web
    name: servicioshogar-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NODE_ENV
        value: production
```

## 📦 Data Migration Procedures

### User Data Migration

#### Export User Data
```sql
-- Export all users
COPY users TO '/tmp/users_backup.csv' DELIMITER ',' CSV HEADER;

-- Export user relationships
COPY (
  SELECT u.id, u.email, u.name, p.id as provider_id
  FROM users u
  LEFT JOIN providers p ON u.id = p.user_id
) TO '/tmp/user_provider_mapping.csv' DELIMITER ',' CSV HEADER;
```

#### Import User Data
```sql
-- Import users
COPY users FROM '/tmp/users_backup.csv' DELIMITER ',' CSV HEADER;

-- Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM providers;
```

### Service Data Migration

#### Migrate Service Categories
```sql
-- Update service categories
UPDATE services SET category = 'CLEANING' WHERE category = 'Limpieza';
UPDATE services SET category = 'PLUMBING' WHERE category = 'Plomería';
UPDATE services SET category = 'ELECTRICAL' WHERE category = 'Electricidad';
UPDATE services SET category = 'GARDENING' WHERE category = 'Jardinería';
UPDATE services SET category = 'PAINTING' WHERE category = 'Pintura';
UPDATE services SET category = 'REPAIRS' WHERE category = 'Reparaciones';
```

#### Migrate Provider Services
```sql
-- Create provider service relationships
INSERT INTO provider_services (provider_id, service_id, price, description)
SELECT 
  p.id as provider_id,
  s.id as service_id,
  CASE s.category
    WHEN 'CLEANING' THEN 2500.00
    WHEN 'PLUMBING' THEN 3500.00
    WHEN 'ELECTRICAL' THEN 4000.00
    ELSE 3000.00
  END as price,
  'Servicio profesional de ' || s.name as description
FROM providers p
CROSS JOIN services s
WHERE p.category = s.category;
```

### Booking Data Migration

#### Historical Booking Migration
```sql
-- Migrate booking status enum
ALTER TYPE booking_status RENAME TO booking_status_old;
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE bookings ALTER COLUMN status TYPE booking_status USING status::text::booking_status;
DROP TYPE booking_status_old;
```

## 🔧 Configuration Migrations

### Environment Configuration Updates

#### Backend Environment Migration
```bash
# Old environment variables (v2.0)
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=development

# New environment variables (v3.0)
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=https://servicioshogar.com.ar
EMAIL_SERVICE_API_KEY=your-email-key
```

#### Frontend Environment Migration
```bash
# Old environment variables (v2.0)
VITE_API_URL=http://localhost:5000

# New environment variables (v3.0)
VITE_API_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_ANALYTICS_ID=GA_TRACKING_ID
VITE_PAYMENT_PUBLIC_KEY=MP_PUBLIC_KEY
```

### Build Configuration Updates

#### Vite Configuration Migration
```typescript
// vite.config.ts (v2.0 to v3.0)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'zod'],
        },
      },
    },
  },
});
```

## 🧪 Migration Testing Procedures

### Pre-Migration Testing

#### Database Backup Verification
```bash
# Create backup
pg_dump $DATABASE_URL > pre_migration_backup.sql

# Verify backup integrity
pg_restore --list pre_migration_backup.sql | head -20

# Test restore on staging
createdb staging_test
psql staging_test < pre_migration_backup.sql
```

#### Application Testing
```bash
# Run test suite before migration
npm run test:unit
npm run test:integration
npm run test:e2e

# Performance benchmarks
npm run test:performance
```

### Post-Migration Testing

#### Data Integrity Verification
```sql
-- Verify user count
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'providers', COUNT(*) FROM providers
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;

-- Verify relationships
SELECT COUNT(*) as orphaned_providers 
FROM providers p 
LEFT JOIN users u ON p.user_id = u.id 
WHERE u.id IS NULL;
```

#### API Testing
```bash
# Test critical endpoints
curl -X GET https://servicioshogar.com.ar/api/health
curl -X GET https://servicioshogar.com.ar/api/services
curl -X POST https://servicioshogar.com.ar/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

#### Frontend Testing
```bash
# Build and test frontend
npm run build
npm run preview

# Visual regression testing
npm run test:visual

# E2E testing
npm run test:e2e:production
```

## 🚨 Migration Rollback Procedures

### Database Rollback

#### Automatic Rollback
```bash
# If migration fails
npm run db:rollback

# Verify rollback success
npm run db:status
```

#### Manual Rollback
```sql
-- Manual rollback steps
BEGIN;

-- Drop new tables/columns
DROP TABLE IF EXISTS new_table;
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;

-- Restore from backup if needed
-- pg_restore --clean --if-exists -d database_name backup.sql

COMMIT;
```

### Application Rollback

#### Git-based Rollback
```bash
# Rollback to previous version
git log --oneline -10
git reset --hard commit_hash

# Rebuild and redeploy
npm run build
npm run deploy
```

#### Infrastructure Rollback
```bash
# Rollback Render deployment
# Use Render dashboard to rollback to previous deployment

# Rollback Hostinger files
# Upload previous version files via hPanel
```

## 📋 Migration Checklist

### Pre-Migration Checklist
- [ ] Full database backup created
- [ ] Code repository tagged with current version
- [ ] Staging environment tested
- [ ] Team notification sent
- [ ] Maintenance page prepared
- [ ] Rollback procedures verified
- [ ] Migration scripts tested

### During Migration Checklist
- [ ] Maintenance mode enabled
- [ ] Database backup verified
- [ ] Schema migrations executed
- [ ] Data migrations completed
- [ ] Application code deployed
- [ ] Configuration updated
- [ ] Services restarted

### Post-Migration Checklist
- [ ] Database integrity verified
- [ ] Application functionality tested
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] User authentication working
- [ ] Payment processing functional
- [ ] Performance monitoring active
- [ ] Maintenance mode disabled
- [ ] Team notification sent

## 📞 Migration Support

### Emergency Contacts
- **Database Issues**: dba@servicioshogar.com.ar
- **Application Issues**: dev@servicioshogar.com.ar
- **Infrastructure Issues**: ops@servicioshogar.com.ar
- **Business Impact**: admin@servicioshogar.com.ar

### Migration Documentation
- **Migration History**: Keep detailed logs of all migrations
- **Version Control**: Tag all releases and migrations
- **Documentation Updates**: Update all relevant documentation
- **Team Training**: Ensure team understands new features/changes

---

**Migration procedures should be reviewed and tested quarterly to ensure reliability and minimize risk.**