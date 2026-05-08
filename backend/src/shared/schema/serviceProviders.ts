import { pgTable, serial, varchar, text, integer, decimal, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  businessName: varchar("business_name", { length: 255 }),
  description: text("description"),
  experienceYears: integer("experience_years"),
  serviceAreas: varchar("service_areas", { length: 255 }), // Simplified ARRAY as varchar
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  profileImageUrl: varchar("profile_image_url", { length: 512 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type ServiceProvider = InferSelectModel<typeof serviceProviders>;
