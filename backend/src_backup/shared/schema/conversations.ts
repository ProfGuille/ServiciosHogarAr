import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  participantOneId: integer('participant_one_id').notNull().references(() => users.id),
  participantTwoId: integer('participant_two_id').notNull().references(() => users.id),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
});

export const conversationsRelations = relations(conversations, ({ one }) => ({
  participantOne: one(users, {
    fields: [conversations.participantOneId],
    references: [users.id],
  }),
  participantTwo: one(users, {
    fields: [conversations.participantTwoId],
    references: [users.id],
  }),
}));

