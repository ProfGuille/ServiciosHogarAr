-- Database optimizations for ServiciosHogar new features
-- Run these migrations to optimize performance for location-based search and analytics

-- 1. Location-based search optimizations
-- Add composite index for location queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_providers_location 
ON service_providers (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for active providers with ratings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_providers_active_rating 
ON service_providers (is_active, average_rating DESC) 
WHERE is_active = true;

-- Add index for hourly rate filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_providers_hourly_rate 
ON service_providers (hourly_rate) 
WHERE is_active = true;

-- 2. Analytics optimizations
-- Add index for analytics events by date and type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_date_type 
ON analytics_events (created_at DESC, event_type);

-- Add index for credit purchases by date for revenue analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_purchases_date 
ON credit_purchases (created_at DESC);

-- Add index for service requests by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_date 
ON service_requests (created_at DESC);

-- 3. Reviews and social features optimizations
-- Add index for reviews by provider for quick retrieval
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_provider_date 
ON reviews (provider_id, created_at DESC);

-- Add index for helpful votes counting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_helpful_count 
ON reviews (helpful_count DESC) 
WHERE helpful_count > 0;

-- Add index for verified reviews
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_verified 
ON reviews (is_verified, created_at DESC) 
WHERE is_verified = true;

-- 4. Provider services optimizations
-- Add index for provider services lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_services_provider 
ON provider_services (provider_id);

-- Add index for services by category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_services_category 
ON provider_services (category_id) 
WHERE category_id IS NOT NULL;

-- 5. Push notifications optimizations
-- Add index for push subscriptions by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_push_subscriptions_user 
ON push_subscriptions (user_id) 
WHERE is_active = true;

-- 6. Performance improvements
-- Add partial index for online providers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_providers_online 
ON service_providers (last_seen_at DESC) 
WHERE is_online = true;

-- Add index for provider search by business name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_providers_business_search 
ON service_providers USING gin(to_tsvector('spanish', business_name)) 
WHERE is_active = true;

-- 7. Update table statistics for better query planning
ANALYZE service_providers;
ANALYZE analytics_events;
ANALYZE credit_purchases;
ANALYZE reviews;
ANALYZE provider_services;
ANALYZE push_subscriptions;

-- 8. Optional: Create materialized view for top providers (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_providers AS
SELECT 
  sp.id,
  sp.business_name,
  sp.city,
  sp.average_rating,
  sp.total_reviews,
  COUNT(DISTINCT sr.id) as total_requests,
  SUM(cp.amount) as total_revenue
FROM service_providers sp
LEFT JOIN service_requests sr ON sp.id = sr.provider_id
LEFT JOIN credit_purchases cp ON sr.id = cp.service_request_id
WHERE sp.is_active = true
GROUP BY sp.id, sp.business_name, sp.city, sp.average_rating, sp.total_reviews
ORDER BY total_revenue DESC NULLS LAST, sp.average_rating DESC NULLS LAST
LIMIT 100;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_providers_id 
ON mv_top_providers (id);

-- 9. Set up automatic refresh for materialized view (requires pg_cron extension)
-- SELECT cron.schedule('refresh-top-providers', '0 2 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_providers;');

-- 10. Connection pooling and performance settings recommendations
-- Add these to postgresql.conf:
/*
# Connection settings
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Query planner settings
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL settings for better write performance
wal_buffers = 16MB
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min

# Logging for monitoring
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Auto vacuum settings
autovacuum = on
autovacuum_analyze_scale_factor = 0.1
autovacuum_vacuum_scale_factor = 0.2
*/