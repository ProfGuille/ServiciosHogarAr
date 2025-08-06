// backend/src/shared/schema/serviceCategories.ts

import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { providerServices } from './providerServices';

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  providerServices: many(providerServices),
}));

