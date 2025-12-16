import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";

// Preferencias de idioma por usuario
export const userLanguagePreferences = pgTable('user_language_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  languageCode: varchar('language_code', { length: 8 }).notNull(),
});

export type UserLanguagePreference = typeof userLanguagePreferences.$inferSelect;
export type InsertUserLanguagePreference = typeof userLanguagePreferences.$inferInsert;