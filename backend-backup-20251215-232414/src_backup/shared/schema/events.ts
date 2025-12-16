import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date', { withTimezone: true }),
});

