import { relations } from "drizzle-orm";
import { analyticsEvents } from "../analyticsEvents";
import { users } from "../users";

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));