import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";

export const locationEvents = pgTable('location_events', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  eventType: varchar('event_type', { length: 64 }),
  eventTime: varchar('event_time', { length: 32 }),
});