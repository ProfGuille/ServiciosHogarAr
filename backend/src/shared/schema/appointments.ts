import { pgTable, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  clientId: integer('client_id').notNull(),
  serviceId: integer('service_id'), // <-- AGREGA ESTA LÍNEA
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: varchar('status', { length: 32 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Appointment = InferSelectModel<typeof appointments>;