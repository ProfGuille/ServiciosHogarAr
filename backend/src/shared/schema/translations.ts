import { pgTable, serial, integer, varchar, text } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 128 }).notNull(),
  languageId: integer('language_id').notNull(),
  value: text('value').notNull(),
  // Si usabas languageCode, agrégalo como opcional:
  languageCode: varchar('language_code', { length: 8 }), // <-- Campo agregado (opcional)
  // ...otros campos que tengas...
});

export type Translation = InferSelectModel<typeof translations>;