import { pgTable, serial, integer, varchar, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const serviceProviders = pgTable('service_providers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  businessName: varchar('business_name', { length: 128 }),
  description: varchar('description', { length: 1024 }),
  city: varchar('city', { length: 128 }),
  province: varchar('province', { length: 128 }),
  hourlyRate: doublePrecision('hourly_rate').notNull().default(0),
  rating: doublePrecision('rating').notNull().default(0),
  totalReviews: integer('total_reviews').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
  experienceYears: integer('experience_years').notNull().default(0),
  // MVP 3: Enhanced location and business info
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  address: varchar('address', { length: 512 }),
  postalCode: varchar('postal_code', { length: 10 }),
  serviceRadius: integer('service_radius').default(10), // km radius
  phone: varchar('phone', { length: 20 }),
  website: varchar('website', { length: 256 }),
  businessHours: varchar('business_hours', { length: 512 }), // JSON string
  isOnline: boolean('is_online').default(false), // For chat status
  lastSeenAt: timestamp('last_seen_at'),
});

export type Provider = InferSelectModel<typeof serviceProviders>;