import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  text,
  numeric,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),

  customerId: varchar("customer_id").notNull(), // Firebase UID o string
  providerId: integer("provider_id"),

  categoryId: integer("category_id").notNull(),

  // Nuevo: servicio específico del proveedor
  serviceId: integer("service_id"),

  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),

  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),

  preferredDate: timestamp("preferred_date"),

  // Nuevo: fecha acordada final
  scheduledDate: timestamp("scheduled_date"),

  estimatedBudget: numeric("estimated_budget", { precision: 10, scale: 2 }),


