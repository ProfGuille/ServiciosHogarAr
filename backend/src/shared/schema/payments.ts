import { pgTable, serial, integer, doublePrecision, varchar, timestamp } from "drizzle-orm/pg-core";

// Tabla de pagos
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  amount: doublePrecision('amount').notNull(),
  currency: varchar('currency', { length: 8 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;