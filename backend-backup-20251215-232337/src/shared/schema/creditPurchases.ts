import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const creditPurchases = pgTable('credit_purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  providerId: integer('provider_id').notNull(),
  amount: integer('amount').notNull(), // Campo agregado
  status: varchar('status', { length: 32 }), // Campo agregado
  createdAt: timestamp('created_at').defaultNow(),
  // ...otros campos que tengas...
});

export type CreditPurchase = InferSelectModel<typeof creditPurchases>;