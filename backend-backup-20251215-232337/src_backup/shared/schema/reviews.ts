import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { appointments } from './appointments';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').notNull().references(() => appointments.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
});
