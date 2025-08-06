import { pgTable, text } from "drizzle-orm/pg-core";
import { languages } from "./languages";
import { relations } from "drizzle-orm";

export const translations = pgTable("translations", {
  key: text("key").notNull(),
  lang: text("lang").notNull().references(() => languages.code),
  value: text("value").notNull(),
});

export const translationsRelations = relations(translations, ({ one }) => ({
  language: one(languages, {
    fields: [translations.lang],
    references: [languages.code],
  }),
}));

