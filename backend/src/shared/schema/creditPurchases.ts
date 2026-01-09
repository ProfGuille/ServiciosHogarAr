import { pgTable, serial, integer, decimal, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const creditPurchases = pgTable('credit_purchases', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  credits: integer('credits').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  mercadopagoPaymentId: varchar('mercadopago_payment_id', { length: 255 }),
  status: varchar('status', { length: 32 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow()
});

export type CreditPurchase = InferSelectModel<typeof creditPurchases>;
