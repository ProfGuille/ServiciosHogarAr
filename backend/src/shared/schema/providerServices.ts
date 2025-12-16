import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerServices = pgTable("provider_services", {
  id: serial("id").primaryKey(),

  providerId: integer("provider_id").notNull(),

  // Nombre base del servicio (ej: "Plomería", "Electricidad")
  serviceName: varchar("service_name", { length: 128 }).notNull(),

  // Nombre personalizado del proveedor (ej: "Instalación de termotanque")
  customServiceName: varchar("custom_service_name", { length: 128 }),

  // Categoría (FK a categories)
  categoryId: integer("category_id").notNull(),

  // Precio del servicio
  price: integer("price").notNull(),

  // Descripción del servicio
  description: text("description"),

  // Duración estimada en minutos
  durationMinutes: integer("duration_minutes").notNull(),

  // Estado del servicio
  isActive: boolean("is_active").notNull().default(true),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ProviderService = InferSelectModel<typeof providerServices>;

