import { pgTable, serial, integer, timestamp, varchar, text } from 'drizzle-orm/pg-core';

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  appointmentDate: timestamp('appointment_date').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // ej. 'pending', 'confirmed', 'cancelled'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

