import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
  description: varchar('description', { length: 1024 }),
  categoryId: integer('category_id'), // <--- AGREGADO para relaciones
});

export type Service = InferSelectModel<typeof services>;
export type InsertService = InferInsertModel<typeof services>;