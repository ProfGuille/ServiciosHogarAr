import { pgTable, integer, date } from 'drizzle-orm/pg-core';
import { serviceProviders } from './serviceProviders';
import { relations } from 'drizzle-orm';

export const providerMetrics = pgTable('provider_metrics', {
  providerId: integer('provider_id').primaryKey().references(() => serviceProviders.id),
  yearMonth: date('year_month').notNull(), // formato YYYY-MM-01
  searches: integer('searches').notNull(),
  profileViews: integer('profile_views').notNull(),
  contacts: integer('contacts').notNull(),
});

export const providerMetricsRelations = relations(providerMetrics, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerMetrics.providerId],
    references: [serviceProviders.id],
  }),
}));

