import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }),
  email: varchar("email", { length: 128 }),
  // Agrega los campos que quieras
});