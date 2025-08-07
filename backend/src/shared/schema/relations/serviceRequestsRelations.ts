import { relations } from "drizzle-orm";
import { serviceRequests } from "../serviceRequests";
import { clients } from "../clients";   // Debes tener este archivo
import { services } from "../services"; // Debes tener este archivo

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