import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

