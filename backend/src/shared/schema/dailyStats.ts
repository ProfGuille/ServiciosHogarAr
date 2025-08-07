import { pgTable, date, integer, text } from 'drizzle-orm/pg-core';

export const dailyStats = pgTable('daily_stats', {
  date: date('date').primaryKey(),
  totalUsers: integer('total_users').notNull(),
  totalServiceProviders: integer('total_service_providers').notNull(),
  totalReviews: integer('total_reviews').notNull(),
  totalSearches: integer('total_searches').notNull(),
  note: text('note'),
});