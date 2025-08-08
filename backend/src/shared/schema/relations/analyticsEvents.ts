import { relations } from "drizzle-orm";
import { analyticsEvents } from "../analyticsEvents.js";
import { users } from "../users.js";

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));