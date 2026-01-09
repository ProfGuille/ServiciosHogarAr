import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  profileImageUrl: varchar('profile_image_url', { length: 512 }),
  userType: varchar('user_type', { length: 50 }).default('customer'),
  password: varchar('password', { length: 255 }), // Agregamos esta columna que ya existe
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type User = InferSelectModel<typeof users>;
