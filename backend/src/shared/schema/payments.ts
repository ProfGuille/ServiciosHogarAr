import { integer, pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { appointments } from './appointments';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').notNull().references(() => appointments.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().$type<number>(),
  method: text('method').notNull(),
  status: text('status').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }).defaultNow().notNull(),
});

