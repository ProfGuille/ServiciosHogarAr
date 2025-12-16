import { 
  pgTable, serial, integer, varchar, boolean, doublePrecision, 
  text, decimal, timestamp, jsonb, index, uniqueIndex 
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { InferSelectModel } from "drizzle-orm";

export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  businessName: varchar("business_name", { length: 128 }),
  businessDescription: text("business_description"),
  description: varchar("description", { length: 1024 }),

  city: varchar("city", { length: 128 }),
  province: varchar("province", { length: 128 }),

  hourlyRate: doublePrecision("hourly_rate").notNull().default(0),

  averageRating: decimal("average_rating", { precision: 3, scale: 2 })
    .notNull()
    .default("0"),

  totalReviews: integer("total_reviews").notNull().default(0),

  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),

  experienceYears: integer("experience_years").notNull().default(0),
  credits: integer("credits").notNull().default(0),

  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: varchar("address", { length: 512 }),
  postalCode: varchar("postal_code", { length: 10 }),
  serviceRadius: integer("service_radius").notNull().default(10),

  phone: varchar("phone", { length: 32 }),
  website: varchar("website", { length: 256 }),

  businessHours: jsonb("business_hours"),

  isOnline: boolean("is_online").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at"),
  lastActive: timestamp("last_active"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdx: index("provider_user_idx").on(table.userId),
    geoIdx: index("provider_geo_idx").on(table.latitude, table.longitude),
    uniqueUser: uniqueIndex("provider_user_unique").on(table.userId),
  };
});

export type Provider = InferSelectModel<typeof serviceProviders>;

