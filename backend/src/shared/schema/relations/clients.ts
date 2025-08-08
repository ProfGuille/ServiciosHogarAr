import { relations } from "drizzle-orm";
import { clients } from "../clients.js";
import { appointments } from "../appointments.js";
import { serviceRequests } from "../serviceRequests.js";
import { conversations } from "../conversations.js";

export const clientsRelations = relations(clients, ({ many }) => ({
  appointments: many(appointments),
  serviceRequests: many(serviceRequests),
  conversations: many(conversations),
}));

