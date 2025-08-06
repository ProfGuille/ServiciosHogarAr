import { pgTable, serial, integer, varchar, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { serviceProviders } from './serviceProviders';
import { serviceCategories } from './serviceCategories';

export const providerServices = pgTable('provider_services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => serviceProviders.id).notNull(),
  categoryId: integer('category_id').references(() => serviceCategories.id).notNull(),
  customServiceName: varchar('custom_service_name', { length: 200 }),
  description: text('description'),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerServices.providerId],
    references: [serviceProviders.id],
  }),
  category: one(serviceCategories, {
    fields: [providerServices.categoryId],
    references: [serviceCategories.id],
  }),
}));

