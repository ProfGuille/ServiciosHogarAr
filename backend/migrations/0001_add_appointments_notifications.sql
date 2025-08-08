-- Add appointments table
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"service_id" integer,
	"scheduled_at" timestamp NOT NULL,
	"status" varchar(32),
	"created_at" timestamp DEFAULT now()
);

-- Add notifications table  
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"entity_type" varchar(50),
	"entity_id" integer,
	"action_url" varchar(512),
	"push_sent" boolean DEFAULT false,
	"push_sent_at" timestamp,
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp
);

-- Add notification preferences table
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_booking_confirmation" boolean DEFAULT true,
	"email_booking_reminder" boolean DEFAULT true,
	"email_new_message" boolean DEFAULT true,
	"email_payment_update" boolean DEFAULT true,
	"email_marketing" boolean DEFAULT false,
	"push_booking_confirmation" boolean DEFAULT true,
	"push_booking_reminder" boolean DEFAULT true,
	"push_new_message" boolean DEFAULT true,
	"push_payment_update" boolean DEFAULT true,
	"do_not_disturb" boolean DEFAULT false,
	"do_not_disturb_start" varchar(5) DEFAULT '22:00',
	"do_not_disturb_end" varchar(5) DEFAULT '08:00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add push subscriptions table
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh_key" text NOT NULL,
	"auth_key" text NOT NULL,
	"user_agent" varchar(512),
	"created_at" timestamp DEFAULT now(),
	"last_used_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);

-- Add foreign key constraints for appointments
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;

-- Note: Not adding FK constraint for client_id since users table has varchar IDs but appointments uses integer
-- This will be handled at the application level

-- Add foreign key constraints for notifications
-- Note: Not adding FK constraint for user_id since users table has varchar IDs but notifications uses integer
-- This will be handled at the application level

-- Add foreign key constraints for notification preferences
-- Note: Not adding FK constraint for user_id since users table has varchar IDs but preferences uses integer
-- This will be handled at the application level

-- Add foreign key constraints for push subscriptions
-- Note: Not adding FK constraint for user_id since users table has varchar IDs but subscriptions uses integer
-- This will be handled at the application level