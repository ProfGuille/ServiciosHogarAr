  eventType: varchar("event_type", { 
    enum: ["page_view", "service_search", "provider_view", "request_created", "message_sent", "payment_completed", "review_created"] 
  }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  metadata: jsonb("metadata"), // Additional event data
  createdAt: timestamp("created_at").defaultNow(),
});
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
