import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

// Tabla de respuestas de leads
export const leadResponses = pgTable('lead_responses', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').notNull(),
  response: varchar('response', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type LeadResponse = typeof leadResponses.$inferSelect;
export type InsertLeadResponse = typeof leadResponses.$inferInsert;