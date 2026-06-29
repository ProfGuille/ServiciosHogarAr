import { relations } from "drizzle-orm";
import { users } from "../users.js";
import { analyticsEvents } from "../analyticsEvents.js";

export const usersRelations = relations(users, ({ many }) => ({
  analyticsEvents: many(analyticsEvents),
}));

