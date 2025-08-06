import { decimal, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  address: text('address').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull().$type<number>(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull().$type<number>(),
});

export const locationsRelations = relations(locations, ({ one }) => ({
  user: one(users, {
    fields: [locations.userId],
    references: [users.id],
  }),
}));
