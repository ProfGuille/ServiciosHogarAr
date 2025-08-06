import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { translations } from './translations';

export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
});

export const languagesRelations = relations(languages, ({ many }) => ({
  translations: many(translations),
}));

