import { pgTable, serial, varchar, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
  email: varchar('email', { length: 128 }).notNull(),
  password: varchar('password', { length: 255 }),
  userType: varchar('user_type', { length: 20 }).default('customer'),
  createdAt: timestamp('created_at').defaultNow(),
  // Legal compliance fields
  termsAcceptedAt: timestamp('terms_accepted_at'),
  privacyPolicyAcceptedAt: timestamp('privacy_policy_accepted_at'),
  legalDisclaimerAcceptedAt: timestamp('legal_disclaimer_accepted_at'),
  dataProcessingConsent: boolean('data_processing_consent').default(false),
  marketingConsent: boolean('marketing_consent').default(false),
  // MVP 3: Geolocation fields
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  address: varchar('address', { length: 512 }),
  city: varchar('city', { length: 128 }),
  province: varchar('province', { length: 128 }),
  postalCode: varchar('postal_code', { length: 10 }),
  locationUpdatedAt: timestamp('location_updated_at'),
});

export type User = InferSelectModel<typeof users>;