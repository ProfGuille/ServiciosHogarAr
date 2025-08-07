import { relations } from "drizzle-orm";
import { clients } from "../clients";
import { appointments } from "../appointments";
import { serviceRequests } from "../serviceRequests";
import { conversations } from "../conversations";

export const clientsRelations = relations(clients, ({ many }) => ({
  appointments: many(appointments),
  serviceRequests: many(serviceRequests),
  conversations: many(conversations),
}));

