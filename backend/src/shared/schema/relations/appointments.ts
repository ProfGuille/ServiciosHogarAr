import { relations } from "drizzle-orm";
import { appointments } from "../appointments.js";
import { clients } from "../clients.js";
import { services } from "../services.js";

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));