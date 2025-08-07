import { relations } from "drizzle-orm";
import { appointments } from "../appointments";
import { clients } from "../clients";
import { services } from "../services";

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