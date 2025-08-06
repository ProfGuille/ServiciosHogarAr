import { pgTable, serial, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients';

export const creditPurchases = pgTable('credit_purchases', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  creditsPurchased: integer('credits_purchased').notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow(),
});

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
  client: one(clients, {
    fields: [creditPurchases.clientId],
    references: [clients.id],
  }),
}));

