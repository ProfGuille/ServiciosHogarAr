import { pgTable, serial, integer, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // booking, message, payment, reminder, system
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
  // Metadata for different notification types
  entityType: varchar('entity_type', { length: 50 }), // service_request, message, payment
  entityId: integer('entity_id'),
  actionUrl: varchar('action_url', { length: 512 }), // Deep link URL
  // Push notification settings
  pushSent: boolean('push_sent').default(false),
  pushSentAt: timestamp('push_sent_at'),
  emailSent: boolean('email_sent').default(false),
  emailSentAt: timestamp('email_sent_at'),
});

export type Notification = InferSelectModel<typeof notifications>;
export type InsertNotification = typeof notifications.$inferInsert;

// User notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  // Email preferences
  emailBookingConfirmation: boolean('email_booking_confirmation').default(true),
  emailBookingReminder: boolean('email_booking_reminder').default(true),
  emailNewMessage: boolean('email_new_message').default(true),
  emailPaymentUpdate: boolean('email_payment_update').default(true),
  emailMarketing: boolean('email_marketing').default(false),
  // Push notification preferences
  pushBookingConfirmation: boolean('push_booking_confirmation').default(true),
  pushBookingReminder: boolean('push_booking_reminder').default(true),
  pushNewMessage: boolean('push_new_message').default(true),
  pushPaymentUpdate: boolean('push_payment_update').default(true),
  // General settings
  doNotDisturb: boolean('do_not_disturb').default(false),
  doNotDisturbStart: varchar('do_not_disturb_start', { length: 5 }).default('22:00'),
  doNotDisturbEnd: varchar('do_not_disturb_end', { length: 5 }).default('08:00'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type NotificationPreferences = InferSelectModel<typeof notificationPreferences>;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;