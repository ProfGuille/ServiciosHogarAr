import { pgTable, serial, integer, varchar, doublePrecision, boolean, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  providerId: integer('provider_id'),
  clientId: integer('client_id'),
  serviceId: integer('service_id'),
  categoryId: integer('category_id'),
  customerId: integer('customer_id'),
  quotedPrice: doublePrecision('quoted_price'),
  createdAt: timestamp('created_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
  status: varchar('status', { length: 32 }),
  title: varchar('title', { length: 128 }),
  description: varchar('description', { length: 1024 }),
  estimatedBudget: doublePrecision('estimated_budget'),
  city: varchar('city', { length: 128 }),
  preferredDate: timestamp('preferred_date'),
  isUrgent: boolean('is_urgent').notNull().default(false),
});

export type ServiceRequest = InferSelectModel<typeof serviceRequests>;