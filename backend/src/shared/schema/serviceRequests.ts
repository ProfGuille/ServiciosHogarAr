import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clients } from "./clients";
import { services } from "./services";

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  serviceId: uuid("service_id").notNull().references(() => services.id),
  description: text("description"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
});

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  client: one(clients, {
    fields: [serviceRequests.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [serviceRequests.serviceId],
    references: [services.id],
  }),
}));

