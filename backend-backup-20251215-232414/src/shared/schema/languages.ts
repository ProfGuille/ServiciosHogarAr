import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  code: varchar("code", { length: 10 }),
});

// Mejor práctica: exporta el tipo para inserts
export type InsertLanguage = typeof languages.$inferInsert;