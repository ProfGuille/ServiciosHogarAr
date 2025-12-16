import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

// Tabla de referrals
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').notNull(),
  refereeId: integer('referee_id').notNull(),
  code: varchar('code', { length: 32 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tipos para selección e inserción
export type Referral = InferSelectModel<typeof referrals>;
export type InsertReferral = typeof referrals.$inferInsert;