import { pgTable, serial, varchar, text, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id"),
  providerId: integer("provider_id"),
  categoryId: integer("category_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  preferredDate: timestamp("preferred_date"),
  status: varchar("status").notNull().default("pending"),
  quotedPrice: numeric("quoted_price"),
  quotedAt: timestamp("quoted_at"),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  isUrgent: boolean("is_urgent").default(false),
  customerNotes: text("customer_notes"),
  providerNotes: text("provider_notes"),
  paymentStatus: varchar("payment_status"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Campos para sistema de leads
  customerFirstName: varchar("customer_first_name", { length: 100 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  preferredContactMethods: text("preferred_contact_methods"),
  telegramUsername: varchar("telegram_username", { length: 100 }),
  estimatedBudget: numeric("estimated_budget"),
  adminNotifiedAt: timestamp("admin_notified_at"),
});

export type ServiceRequest = InferSelectModel<typeof serviceRequests>;
