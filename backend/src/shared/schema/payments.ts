import { pgTable, serial, integer, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  serviceRequestId: integer('service_request_id').notNull(),
  customerId: varchar('customer_id').notNull(),
  providerId: integer('provider_id').notNull(),
  amount: numeric('amount').notNull(),
  platformFee: numeric('platform_fee').notNull(),
  providerAmount: numeric('provider_amount').notNull(),
  paymentMethod: varchar('payment_method').notNull(),
  bankAccountNumber: varchar('bank_account_number'),
  bankName: varchar('bank_name'),
  accountHolderName: varchar('account_holder_name'),
});

export type Payment = InferSelectModel<typeof payments>;
export type InsertPayment = typeof payments.$inferInsert;
