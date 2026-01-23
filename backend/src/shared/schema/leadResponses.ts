import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const leadResponses = pgTable('lead_responses', {
  id: serial('id').primaryKey(),
  serviceRequestId: integer('service_request_id').notNull(),
  providerId: integer('provider_id').notNull(),
  creditsUsed: integer('credits_used'),
  responseMessage: text('response_message'),
  quotedPrice: numeric('quoted_price'),
  respondedAt: timestamp('responded_at'),
  creditsSpent: integer('credits_spent'),
  unlockedAt: timestamp('unlocked_at')
});

export type LeadResponse = typeof leadResponses.$inferSelect;
export type InsertLeadResponse = typeof leadResponses.$inferInsert;
