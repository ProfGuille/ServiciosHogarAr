import { pgTable, serial, varchar, text, integer, timestamp, numeric } from 'drizzle-orm/pg-core';
import { serviceProviders } from './serviceProviders';
import { categories } from './categories';

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => serviceProviders.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }), // mejor para precios con decimales
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

