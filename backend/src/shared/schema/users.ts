import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
  email: varchar('email', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  // Legal compliance fields
  termsAcceptedAt: timestamp('terms_accepted_at'),
  privacyPolicyAcceptedAt: timestamp('privacy_policy_accepted_at'),
  legalDisclaimerAcceptedAt: timestamp('legal_disclaimer_accepted_at'),
  dataProcessingConsent: boolean('data_processing_consent').default(false),
  marketingConsent: boolean('marketing_consent').default(false),
});

export type User = InferSelectModel<typeof users>;