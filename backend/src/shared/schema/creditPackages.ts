import { pgTable, serial, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const creditPackages = pgTable('credit_packages', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 50 }).notNull(),
  creditos: integer('creditos').notNull(),
  precio: integer('precio').notNull(),
  destacado: boolean('destacado').notNull().default(false),
  activo: boolean('activo').notNull().default(true),
  orden: integer('orden').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type CreditPackage = InferSelectModel<typeof creditPackages>;
export type InsertCreditPackage = typeof creditPackages.$inferInsert;
