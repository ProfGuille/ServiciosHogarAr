import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
});

export type Category = InferSelectModel<typeof categories>;