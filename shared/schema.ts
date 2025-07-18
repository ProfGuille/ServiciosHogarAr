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
  uniqueIndex,
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

// Analytics Events for Business Intelligence
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { 
    enum: ["page_view", "service_search", "provider_view", "request_created", "message_sent", "payment_completed", "review_created"] 
  }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  metadata: jsonb("metadata"), // Additional event data
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform KPIs aggregated daily
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().unique(),
  totalUsers: integer("total_users").default(0),
  newUsers: integer("new_users").default(0),
  totalProviders: integer("total_providers").default(0),
  newProviders: integer("new_providers").default(0),
  totalRequests: integer("total_requests").default(0),
  newRequests: integer("new_requests").default(0),
  completedRequests: integer("completed_requests").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  newRevenue: decimal("new_revenue", { precision: 10, scale: 2 }).default("0"),
  avgResponseTime: decimal("avg_response_time", { precision: 8, scale: 2 }), // in hours
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

// Provider Performance Metrics
export const providerMetrics = pgTable("provider_metrics", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  date: timestamp("date").notNull(),
  profileViews: integer("profile_views").default(0),
  requestsReceived: integer("requests_received").default(0),
  requestsAccepted: integer("requests_accepted").default(0),
  requestsCompleted: integer("requests_completed").default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }),
  responseTimeHours: decimal("response_time_hours", { precision: 8, scale: 2 }),
  creditsUsed: integer("credits_used").default(0),
  messagesCount: integer("messages_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// WordPress Integration Tables
export const wordpressContent = pgTable("wordpress_content", {
  id: serial("id").primaryKey(),
  wordpressId: integer("wordpress_id").unique(), // WordPress post/page ID
  contentType: varchar("content_type", { enum: ["post", "page", "service", "category"] }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: varchar("featured_image"),
  metaTitle: varchar("meta_title", { length: 160 }),
  metaDescription: varchar("meta_description", { length: 320 }),
  metaKeywords: text("meta_keywords"),
  canonicalUrl: varchar("canonical_url"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO Metadata for dynamic pages
export const seoMetadata = pgTable("seo_metadata", {
  id: serial("id").primaryKey(),
  pageType: varchar("page_type", { 
    enum: ["home", "services", "service_detail", "provider_profile", "category", "location"] 
  }).notNull(),
  identifier: varchar("identifier"), // Category ID, Provider ID, etc.
  title: varchar("title", { length: 160 }).notNull(),
  description: varchar("description", { length: 320 }).notNull(),
  keywords: text("keywords"),
  canonicalUrl: varchar("canonical_url"),
  ogTitle: varchar("og_title", { length: 160 }),
  ogDescription: varchar("og_description", { length: 320 }),
  ogImage: varchar("og_image"),
  structuredData: jsonb("structured_data"), // JSON-LD schema
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WordPress API Keys for secure communication
export const wordpressApiKeys = pgTable("wordpress_api_keys", {
  id: serial("id").primaryKey(),
  keyName: varchar("key_name", { length: 100 }).notNull(),
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  permissions: text("permissions").array(), // Array of allowed operations
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content Sync Log
export const contentSyncLog = pgTable("content_sync_log", {
  id: serial("id").primaryKey(),
  syncType: varchar("sync_type", { enum: ["import", "export", "update", "delete"] }).notNull(),
  contentType: varchar("content_type", { enum: ["post", "page", "service", "category", "provider"] }).notNull(),
  contentId: integer("content_id"),
  wordpressId: integer("wordpress_id"),
  status: varchar("status", { enum: ["pending", "success", "failed"] }).default("pending"),
  errorMessage: text("error_message"),
  syncData: jsonb("sync_data"), // Data that was synced
  createdAt: timestamp("created_at").defaultNow(),
});

// WordPress schema exports
export const insertWordPressContentSchema = createInsertSchema(wordpressContent);
export type InsertWordPressContent = z.infer<typeof insertWordPressContentSchema>;
export type WordPressContent = typeof wordpressContent.$inferSelect;

export const insertSEOMetadataSchema = createInsertSchema(seoMetadata);
export type InsertSEOMetadata = z.infer<typeof insertSEOMetadataSchema>;
export type SEOMetadata = typeof seoMetadata.$inferSelect;

export const insertWordPressApiKeySchema = createInsertSchema(wordpressApiKeys);
export type InsertWordPressApiKey = z.infer<typeof insertWordPressApiKeySchema>;
export type WordPressApiKey = typeof wordpressApiKeys.$inferSelect;

export const insertContentSyncLogSchema = createInsertSchema(contentSyncLog);
export type InsertContentSyncLog = z.infer<typeof insertContentSyncLogSchema>;
export type ContentSyncLog = typeof contentSyncLog.$inferSelect;

// Third-party Integration Tables
export const thirdPartyPartners = pgTable("third_party_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  website: varchar("website"),
  contactEmail: varchar("contact_email"),
  partnerType: varchar("partner_type", { 
    enum: ["technology", "marketing", "service", "payment", "analytics", "crm", "other"] 
  }).notNull(),
  status: varchar("status", { enum: ["active", "pending", "suspended", "terminated"] }).default("pending"),
  apiVersion: varchar("api_version", { length: 10 }).default("v1"),
  isVerified: boolean("is_verified").default(false),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  monthlyRequestLimit: integer("monthly_request_limit").default(10000),
  webhookUrl: varchar("webhook_url"),
  ipWhitelist: text("ip_whitelist").array(),
  allowedScopes: text("allowed_scopes").array(), // Array of permission scopes
  metadata: jsonb("metadata"), // Additional partner-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const partnerApiKeys = pgTable("partner_api_keys", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => thirdPartyPartners.id),
  keyName: varchar("key_name", { length: 100 }).notNull(),
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  apiSecret: varchar("api_secret", { length: 255 }), // For OAuth-style authentication
  keyType: varchar("key_type", { enum: ["api_key", "oauth", "jwt"] }).default("api_key"),
  scopes: text("scopes").array(), // Specific permissions for this key
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  requestCount: integer("request_count").default(0),
  monthlyRequestCount: integer("monthly_request_count").default(0),
  rateLimit: integer("rate_limit").default(100), // Requests per minute
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiRequestLogs = pgTable("api_request_logs", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => thirdPartyPartners.id),
  apiKeyId: integer("api_key_id").references(() => partnerApiKeys.id),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  method: varchar("method", { enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] }).notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // in milliseconds
  userAgent: varchar("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  requestSize: integer("request_size"), // in bytes
  responseSize: integer("response_size"), // in bytes
  errorMessage: text("error_message"),
  requestData: jsonb("request_data"), // For auditing purposes
  createdAt: timestamp("created_at").defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => thirdPartyPartners.id),
  eventType: varchar("event_type", { 
    enum: ["user.created", "provider.verified", "request.created", "request.completed", "payment.processed", "review.created"]
  }).notNull(),
  webhookUrl: varchar("webhook_url").notNull(),
  payload: jsonb("payload").notNull(),
  status: varchar("status", { enum: ["pending", "sent", "failed", "retrying"] }).default("pending"),
  httpStatus: integer("http_status"),
  responseBody: text("response_body"),
  attemptCount: integer("attempt_count").default(0),
  maxAttempts: integer("max_attempts").default(3),
  nextRetryAt: timestamp("next_retry_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partnerIntegrations = pgTable("partner_integrations", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => thirdPartyPartners.id),
  integrationType: varchar("integration_type", { 
    enum: ["webhook", "api_sync", "data_export", "sso", "payment_gateway", "analytics"] 
  }).notNull(),
  configData: jsonb("config_data"), // Integration-specific configuration
  isEnabled: boolean("is_enabled").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  syncFrequency: varchar("sync_frequency", { enum: ["real_time", "hourly", "daily", "weekly", "manual"] }).default("manual"),
  errorCount: integer("error_count").default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partnership analytics
export const partnerAnalytics = pgTable("partner_analytics", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => thirdPartyPartners.id),
  date: timestamp("date").notNull(),
  apiRequests: integer("api_requests").default(0),
  webhooksSent: integer("webhooks_sent").default(0),
  webhooksDelivered: integer("webhooks_delivered").default(0),
  dataExported: integer("data_exported").default(0), // Number of records
  errors: integer("errors").default(0),
  avgResponseTime: decimal("avg_response_time", { precision: 8, scale: 2 }),
  bandwidthUsed: integer("bandwidth_used").default(0), // in bytes
  createdAt: timestamp("created_at").defaultNow(),
});

// Third-party integration schemas
export const insertThirdPartyPartnerSchema = createInsertSchema(thirdPartyPartners);
export type InsertThirdPartyPartner = z.infer<typeof insertThirdPartyPartnerSchema>;
export type ThirdPartyPartner = typeof thirdPartyPartners.$inferSelect;

export const insertPartnerApiKeySchema = createInsertSchema(partnerApiKeys);
export type InsertPartnerApiKey = z.infer<typeof insertPartnerApiKeySchema>;
export type PartnerApiKey = typeof partnerApiKeys.$inferSelect;

export const insertWebhookEventSchema = createInsertSchema(webhookEvents);
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

export const insertPartnerIntegrationSchema = createInsertSchema(partnerIntegrations);
export type InsertPartnerIntegration = z.infer<typeof insertPartnerIntegrationSchema>;
export type PartnerIntegration = typeof partnerIntegrations.$inferSelect;

// Multi-language support tables
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 5 }).notNull().unique(), // es, en, pt-BR
  name: varchar("name", { length: 100 }).notNull(), // Español, English, Português
  nativeName: varchar("native_name", { length: 100 }).notNull(), // Español, English, Português
  flag: varchar("flag", { length: 10 }), // Flag emoji or icon
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 500 }).notNull(), // page.home.title, service.category.plumbing
  languageCode: varchar("language_code", { length: 5 }).notNull().references(() => languages.code),
  value: text("value").notNull(),
  context: varchar("context", { length: 200 }), // Additional context for translators
  isPlural: boolean("is_plural").default(false),
  pluralValue: text("plural_value"), // For plural forms
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint on key + language combination
  uniqueKeyLang: uniqueIndex("unique_key_lang").on(table.key, table.languageCode)
}));

export const localizedContent = pgTable("localized_content", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { 
    enum: ["service_category", "service_description", "provider_bio", "page_content", "email_template"] 
  }).notNull(),
  contentId: varchar("content_id", { length: 100 }).notNull(), // Reference to original content
  languageCode: varchar("language_code", { length: 5 }).notNull().references(() => languages.code),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  content: text("content"),
  metaTitle: varchar("meta_title", { length: 160 }),
  metaDescription: varchar("meta_description", { length: 320 }),
  keywords: text("keywords"),
  slug: varchar("slug", { length: 200 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint on content + language combination
  uniqueContentLang: uniqueIndex("unique_content_lang").on(table.contentType, table.contentId, table.languageCode)
}));

export const userLanguagePreferences = pgTable("user_language_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  languageCode: varchar("language_code", { length: 5 }).notNull().references(() => languages.code),
  isDefault: boolean("is_default").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint on user + language combination
  uniqueUserLang: uniqueIndex("unique_user_lang").on(table.userId, table.languageCode)
}));

// Multi-language schemas
export const insertLanguageSchema = createInsertSchema(languages);
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export const insertTranslationSchema = createInsertSchema(translations);
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export const insertLocalizedContentSchema = createInsertSchema(localizedContent);
export type InsertLocalizedContent = z.infer<typeof insertLocalizedContentSchema>;
export type LocalizedContent = typeof localizedContent.$inferSelect;

// Geofencing and location tables
export const serviceAreas = pgTable("service_areas", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  name: varchar("name", { length: 200 }).notNull(), // "Buenos Aires Norte", "CABA Zona Sur"
  centerLat: decimal("center_lat", { precision: 10, scale: 8 }).notNull(),
  centerLng: decimal("center_lng", { precision: 11, scale: 8 }).notNull(),
  radiusKm: decimal("radius_km", { precision: 6, scale: 2 }).notNull(), // Service radius in kilometers
  polygonCoords: jsonb("polygon_coords"), // Array of lat/lng points for complex shapes
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1), // Higher priority = preferred area
  maxDailyJobs: integer("max_daily_jobs").default(10),
  travelCostPerKm: decimal("travel_cost_per_km", { precision: 8, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const providerLocations = pgTable("provider_locations", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }), // GPS accuracy in meters
  timestamp: timestamp("timestamp").defaultNow(),
  isActive: boolean("is_active").default(true), // Current location
  locationSource: varchar("location_source", { 
    enum: ["gps", "manual", "estimated"] 
  }).default("gps"),
  address: varchar("address", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routeOptimizations = pgTable("route_optimizations", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  date: timestamp("date").notNull(),
  startLat: decimal("start_lat", { precision: 10, scale: 8 }).notNull(),
  startLng: decimal("start_lng", { precision: 11, scale: 8 }).notNull(),
  endLat: decimal("end_lat", { precision: 10, scale: 8 }),
  endLng: decimal("end_lng", { precision: 11, scale: 8 }),
  totalDistanceKm: decimal("total_distance_km", { precision: 8, scale: 2 }),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  actualDurationMinutes: integer("actual_duration_minutes"),
  fuelCostEstimate: decimal("fuel_cost_estimate", { precision: 8, scale: 2 }),
  tollCosts: decimal("toll_costs", { precision: 8, scale: 2 }).default("0.00"),
  optimizationAlgorithm: varchar("optimization_algorithm", { 
    enum: ["nearest_neighbor", "genetic", "dijkstra", "manual"] 
  }).default("nearest_neighbor"),
  waypoints: jsonb("waypoints"), // Array of service request locations in optimized order
  routeData: jsonb("route_data"), // Full route information from mapping service
  status: varchar("status", { 
    enum: ["planned", "in_progress", "completed", "cancelled"] 
  }).default("planned"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const geofences = pgTable("geofences", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // "Downtown Business District", "Residential Zone A"
  description: text("description"),
  centerLat: decimal("center_lat", { precision: 10, scale: 8 }).notNull(),
  centerLng: decimal("center_lng", { precision: 11, scale: 8 }).notNull(),
  radiusKm: decimal("radius_km", { precision: 6, scale: 2 }),
  polygonCoords: jsonb("polygon_coords"), // Array of lat/lng points for complex shapes
  geofenceType: varchar("geofence_type", { 
    enum: ["service_zone", "no_travel_zone", "high_priority", "restricted"] 
  }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locationEvents = pgTable("location_events", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  eventType: varchar("event_type", { 
    enum: ["enter_geofence", "exit_geofence", "arrive_job", "complete_job", "break_start", "break_end"] 
  }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  geofenceId: integer("geofence_id").references(() => geofences.id),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  metadata: jsonb("metadata"), // Additional event data
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Location and geofencing schemas
export const insertServiceAreaSchema = createInsertSchema(serviceAreas);
export type InsertServiceArea = z.infer<typeof insertServiceAreaSchema>;
export type ServiceArea = typeof serviceAreas.$inferSelect;

export const insertProviderLocationSchema = createInsertSchema(providerLocations);
export type InsertProviderLocation = z.infer<typeof insertProviderLocationSchema>;
export type ProviderLocation = typeof providerLocations.$inferSelect;

export const insertRouteOptimizationSchema = createInsertSchema(routeOptimizations);
export type InsertRouteOptimization = z.infer<typeof insertRouteOptimizationSchema>;
export type RouteOptimization = typeof routeOptimizations.$inferSelect;

export const insertGeofenceSchema = createInsertSchema(geofences);
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;
export type Geofence = typeof geofences.$inferSelect;

export const insertLocationEventSchema = createInsertSchema(locationEvents);
export type InsertLocationEvent = z.infer<typeof insertLocationEventSchema>;
export type LocationEvent = typeof locationEvents.$inferSelect;

// Achievement system
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { enum: ["customer", "provider", "platform", "special"] }).notNull(),
  type: varchar("type", { enum: ["milestone", "streak", "quality", "engagement", "loyalty"] }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(), // Icon name from lucide-react
  color: varchar("color", { length: 50 }).notNull(), // Tailwind color class
  criteria: jsonb("criteria").notNull(), // JSON object with achievement criteria
  points: integer("points").default(10),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  rarity: varchar("rarity", { enum: ["common", "uncommon", "rare", "epic", "legendary"] }).default("common"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0), // For progressive achievements
  progressMax: integer("progress_max").default(1), // Total required for achievement
  notified: boolean("notified").default(false),
}, (table) => [
  uniqueIndex("unique_user_achievement").on(table.userId, table.achievementId),
  index("idx_user_achievements_user").on(table.userId),
]);

export const achievementProgress = pgTable("achievement_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  metric: varchar("metric", { length: 50 }).notNull(), // e.g., "bookings_count", "reviews_given"
  value: integer("value").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  uniqueIndex("unique_user_achievement_metric").on(table.userId, table.achievementId, table.metric),
]);

// Achievement schemas
export const insertAchievementSchema = createInsertSchema(achievements);
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const insertAchievementProgressSchema = createInsertSchema(achievementProgress);
export type InsertAchievementProgress = z.infer<typeof insertAchievementProgressSchema>;
export type AchievementProgress = typeof achievementProgress.$inferSelect;

// Referral System
export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id", { length: 255 }).notNull().references(() => users.id),
  referredId: varchar("referred_id", { length: 255 }).notNull().references(() => users.id),
  referralCodeId: integer("referral_code_id").notNull().references(() => referralCodes.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, completed, expired
  rewardCredits: integer("reward_credits").default(0),
  rewardType: varchar("reward_type", { length: 50 }), // signup_bonus, first_purchase, milestone
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index().on(table.referredId),
  index().on(table.referrerId),
]);

export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // referrer_signup, referred_signup, referrer_purchase, referred_purchase
  creditAmount: integer("credit_amount").notNull(),
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referralStats = pgTable("referral_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id).unique(),
  totalReferrals: integer("total_referrals").default(0),
  successfulReferrals: integer("successful_referrals").default(0),
  totalCreditsEarned: integer("total_credits_earned").default(0),
  lastReferralAt: timestamp("last_referral_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReferralCodeSchema = createInsertSchema(referralCodes);
export const insertReferralSchema = createInsertSchema(referrals);
export const insertReferralRewardSchema = createInsertSchema(referralRewards);
export const insertReferralStatsSchema = createInsertSchema(referralStats);

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralStats = typeof referralStats.$inferSelect;
export type InsertReferralStats = z.infer<typeof insertReferralStatsSchema>;

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
  achievements: many(userAchievements),
  achievementProgress: many(achievementProgress),
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

// Analytics schemas
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export const insertDailyStatSchema = createInsertSchema(dailyStats);
export type InsertDailyStat = z.infer<typeof insertDailyStatSchema>;
export type DailyStat = typeof dailyStats.$inferSelect;

export const insertProviderMetricSchema = createInsertSchema(providerMetrics);
export type InsertProviderMetric = z.infer<typeof insertProviderMetricSchema>;
export type ProviderMetric = typeof providerMetrics.$inferSelect;

