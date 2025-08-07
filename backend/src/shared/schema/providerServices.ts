import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerServices = pgTable('provider_services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  serviceName: varchar('service_name', { length: 128 }),
  customServiceName: varchar('custom_service_name', { length: 128 }),
  categoryId: integer('category_id'),
});

export type ProviderService = InferSelectModel<typeof providerServices>;