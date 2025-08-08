import { pgTable, integer, varchar, text, boolean, timestamp, decimal, json } from 'drizzle-orm/pg-core';

// Provider Services table
export const providerServices = pgTable('provider_services', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  providerId: integer('provider_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  categoryId: integer('category_id').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Provider Availability table
export const providerAvailability = pgTable('provider_availability', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  providerId: integer('provider_id').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:mm format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:mm format
  isRecurring: boolean('is_recurring').default(true),
  specificDate: varchar('specific_date', { length: 10 }), // YYYY-MM-DD for non-recurring
  maxBookings: integer('max_bookings').default(1),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Appointments table (enhanced)
export const appointments = pgTable('appointments', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  providerId: integer('provider_id').notNull(),
  clientId: integer('client_id').notNull(),
  serviceId: integer('service_id'),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  appointmentDate: varchar('appointment_date', { length: 10 }).notNull(), // YYYY-MM-DD
  appointmentTime: varchar('appointment_time', { length: 5 }).notNull(), // HH:mm
  duration: integer('duration').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, confirmed, completed, cancelled
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientEmail: varchar('client_email', { length: 255 }).notNull(),
  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  city: varchar('city', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Client Notes table (for VIP status and provider notes)
export const clientNotes = pgTable('client_notes', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  providerId: integer('provider_id').notNull(),
  clientId: integer('client_id').notNull(),
  notes: text('notes'),
  isVip: boolean('is_vip').default(false),
  preferences: json('preferences'), // Store client preferences as JSON
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Reviews table (enhanced)
export const reviews = pgTable('reviews', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  appointmentId: integer('appointment_id').notNull(),
  providerId: integer('provider_id').notNull(),
  clientId: integer('client_id').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  isPublic: boolean('is_public').default(true),
  response: text('response'), // Provider response to review
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Provider Statistics table (for caching analytics)
export const providerStats = pgTable('provider_stats', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  providerId: integer('provider_id').notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  totalBookings: integer('total_bookings').default(0),
  completedBookings: integer('completed_bookings').default(0),
  cancelledBookings: integer('cancelled_bookings').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
  newClients: integer('new_clients').default(0),
  returningClients: integer('returning_clients').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Service Performance table (for analytics)
export const servicePerformance = pgTable('service_performance', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  providerId: integer('provider_id').notNull(),
  serviceId: integer('service_id').notNull(),
  month: varchar('month', { length: 7 }).notNull(), // YYYY-MM
  bookings: integer('bookings').default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0'),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
  averageResponseTime: integer('average_response_time'), // in hours
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Service Categories (if not exists)
export const serviceCategories = pgTable('service_categories', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Business Hours template (for quick setup)
export const businessHoursTemplates = pgTable('business_hours_templates', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  schedule: json('schedule'), // Store the complete schedule as JSON
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow()
});