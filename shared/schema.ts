import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { enum: ["customer", "provider", "admin"] }).notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional Credits System
export const providerCredits = pgTable("provider_credits", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  currentCredits: integer("current_credits").default(0),
  totalPurchased: integer("total_purchased").default(0),
  totalUsed: integer("total_used").default(0),
  lastPurchaseAt: timestamp("last_purchase_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit Purchases
export const creditPurchases = pgTable("credit_purchases", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  credits: integer("credits").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method"),
  mercadopagoPaymentId: varchar("mercadopago_payment_id"),
  status: varchar("status", { enum: ["pending", "completed", "failed"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead Responses (when provider uses credits to respond)
export const leadResponses = pgTable("lead_responses", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  creditsUsed: integer("credits_used").notNull(),
  responseMessage: text("response_message"),
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }),
  respondedAt: timestamp("responded_at").defaultNow(),
});

// Service providers
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name", { length: 200 }),
  description: text("description"),
  experienceYears: integer("experience_years"),
  serviceAreas: text("service_areas").array(), // Array of location strings
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider services (many-to-many between providers and categories)
export const providerServices = pgTable("provider_services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  categoryId: integer("category_id").notNull().references(() => serviceCategories.id),
  customServiceName: varchar("custom_service_name", { length: 200 }),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service requests/bookings
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => serviceProviders.id),
  categoryId: integer("category_id").notNull().references(() => serviceCategories.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  preferredDate: timestamp("preferred_date"),
  estimatedBudget: decimal("estimated_budget", { precision: 10, scale: 2 }),
  status: varchar("status", { 
    enum: ["pending", "quoted", "accepted", "in_progress", "completed", "cancelled"] 
  }).notNull().default("pending"),
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }),
  quotedAt: timestamp("quoted_at"),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  isUrgent: boolean("is_urgent").default(false),
  customerNotes: text("customer_notes"),
  providerNotes: text("provider_notes"),
  paymentStatus: varchar("payment_status", { 
    enum: ["pending", "processing", "paid", "failed", "refunded"] 
  }).default("pending"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  providerAmount: decimal("provider_amount", { precision: 10, scale: 2 }).notNull(),
  // Payment method
  paymentMethod: varchar("payment_method", { 
    enum: ["bank_transfer", "cash", "stripe", "mercadopago"] 
  }).notNull(),
  // Bank transfer fields
  bankAccountNumber: varchar("bank_account_number"),
  bankName: varchar("bank_name"),
  accountHolderName: varchar("account_holder_name"),
  transferReference: varchar("transfer_reference"),
  // Cash payment fields
  cashLocation: varchar("cash_location"),
  cashInstructions: text("cash_instructions"),
  // Stripe fields (optional)
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  // Mercado Pago fields
  mercadopagoPaymentId: varchar("mercadopago_payment_id"),
  mercadopagoPreferenceId: varchar("mercadopago_preference_id"),
  status: varchar("status", { 
    enum: ["pending", "processing", "succeeded", "failed", "canceled", "refunded"] 
  }).default("pending"),
  currency: varchar("currency", { length: 3 }).default("ars"),
  paymentProof: varchar("payment_proof"), // File path for transfer receipts
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message Conversations (to group messages by conversation)
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  customerUnreadCount: integer("customer_unread_count").default(0),
  providerUnreadCount: integer("provider_unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages between customers and providers
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", { enum: ["text", "image", "file"] }).default("text"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  serviceProvider: one(serviceProviders, {
    fields: [users.id],
    references: [serviceProviders.userId],
  }),
  serviceRequests: many(serviceRequests),
  sentMessages: many(messages),
  customerConversations: many(conversations, { relationName: "CustomerConversations" }),
  providerConversations: many(conversations, { relationName: "ProviderConversations" }),
  givenReviews: many(reviews, { relationName: "GivenReviews" }),
  receivedReviews: many(reviews, { relationName: "ReceivedReviews" }),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  services: many(providerServices),
  serviceRequests: many(serviceRequests),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  providerServices: many(providerServices),
  serviceRequests: many(serviceRequests),
}));

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerServices.providerId],
    references: [serviceProviders.id],
  }),
  category: one(serviceCategories, {
    fields: [providerServices.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  customer: one(users, {
    fields: [serviceRequests.customerId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [serviceRequests.providerId],
    references: [serviceProviders.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceRequests.categoryId],
    references: [serviceCategories.id],
  }),
  conversations: many(conversations),
  reviews: many(reviews),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [payments.serviceRequestId],
    references: [serviceRequests.id],
  }),
  customer: one(users, {
    fields: [payments.customerId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [payments.providerId],
    references: [serviceProviders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [reviews.serviceRequestId],
    references: [serviceRequests.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  customer: one(users, {
    fields: [conversations.customerId],
    references: [users.id],
  }),
  provider: one(users, {
    fields: [conversations.providerId],
    references: [users.id],
  }),
  serviceRequest: one(serviceRequests, {
    fields: [conversations.serviceRequestId],
    references: [serviceRequests.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Zod schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertServiceCategorySchema = createInsertSchema(serviceCategories);
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;

export const insertServiceProviderSchema = createInsertSchema(serviceProviders);
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;

export const insertProviderServiceSchema = createInsertSchema(providerServices);
export type InsertProviderService = z.infer<typeof insertProviderServiceSchema>;
export type ProviderService = typeof providerServices.$inferSelect;

export const insertServiceRequestSchema = createInsertSchema(serviceRequests);
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews);
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments);
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const insertConversationSchema = createInsertSchema(conversations);
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

