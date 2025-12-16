import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => serviceProviders.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  price: integer('price'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

