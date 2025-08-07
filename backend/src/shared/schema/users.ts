import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
  email: varchar('email', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = InferSelectModel<typeof users>;