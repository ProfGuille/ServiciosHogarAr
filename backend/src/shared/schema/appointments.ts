import { pgTable, serial, integer, timestamp, varchar, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients';
import { services } from './services';

/**
 * appointments: citas o turnos solicitados por clientes para un servicio específico
 */
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  appointmentDate: timestamp('appointment_date', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // Ej: pending, confirmed, cancelled
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Relaciones: cada turno pertenece a un cliente y a un servicio
 */
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

