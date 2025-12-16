import { pgTable, serial, integer, varchar, boolean, jsonb } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'), // <-- AGREGADO para relaciones
  name: varchar('name', { length: 128 }).notNull(),
  description: varchar('description', { length: 256 }),
  isActive: boolean('is_active').notNull().default(true),
  criteria: jsonb('criteria'),
});