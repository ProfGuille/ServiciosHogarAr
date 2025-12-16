import { decimal, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  address: text('address').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull().$type<number>(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull().$type<number>(),
});