import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  eventDate: timestamp('event_date'),
});

// No relaciones definidas actualmente, porque esta tabla parece independiente.

