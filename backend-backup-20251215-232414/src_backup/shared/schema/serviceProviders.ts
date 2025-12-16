import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const serviceProviders = pgTable('service_providers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  companyName: varchar('company_name', { length: 255 }),
  description: text('description'),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

