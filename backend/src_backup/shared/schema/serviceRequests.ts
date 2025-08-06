import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { services } from "./services";

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  description: text("description"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
});

