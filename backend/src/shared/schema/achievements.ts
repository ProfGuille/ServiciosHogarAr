import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),  // cambié a text para mayor flexibilidad
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
});

