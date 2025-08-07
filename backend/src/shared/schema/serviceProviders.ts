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
});

export type Provider = InferSelectModel<typeof serviceProviders>;