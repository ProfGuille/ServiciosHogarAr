-- ============================================
-- SCHEMA COMPLETO ServiciosHogarAr → Supabase
-- Generado: 2026-06-14
-- Incluye solo migraciones confirmadas como aplicadas en producción
-- ============================================

-- ============================================
-- 0000: SCHEMA BASE
-- ============================================

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY NOT NULL,
  "email" varchar,
  "first_name" varchar,
  "last_name" varchar,
  "profile_image_url" varchar,
  "user_type" varchar DEFAULT 'customer' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar PRIMARY KEY NOT NULL,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);

CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");

CREATE TABLE IF NOT EXISTS "service_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "icon" varchar(50),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "service_providers" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "business_name" varchar(200),
  "description" text,
  "experience_years" integer,
  "service_areas" text[],
  "hourly_rate" numeric(10, 2),
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "rating" numeric(5, 1) DEFAULT '0',
  "total_reviews" integer DEFAULT 0,
  "profile_image_url" varchar,
  "phone_number" varchar(20),
  "address" text,
  "city" varchar(100),
  "province" varchar(100),
  "postal_code" varchar(10),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "service_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "service_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_id" varchar NOT NULL,
  "provider_id" integer,
  "category_id" integer NOT NULL,
  "title" varchar(200) NOT NULL,
  "description" text NOT NULL,
  "address" text NOT NULL,
  "city" varchar(100) NOT NULL,
  "province" varchar(100) NOT NULL,
  "preferred_date" timestamp,
  "estimated_budget" numeric(10, 2),
  "status" varchar DEFAULT 'pending' NOT NULL,
  "quoted_price" numeric(10, 2),
  "quoted_at" timestamp,
  "accepted_at" timestamp,
  "completed_at" timestamp,
  "is_urgent" boolean DEFAULT false,
  "customer_notes" text,
  "provider_notes" text,
  "payment_status" varchar DEFAULT 'pending',
  "stripe_payment_intent_id" varchar(255),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "service_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id"),
  CONSTRAINT "service_requests_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id"),
  CONSTRAINT "service_requests_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id")
);

CREATE TABLE IF NOT EXISTS "provider_credits" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "current_credits" integer DEFAULT 0,
  "total_purchased" integer DEFAULT 0,
  "total_used" integer DEFAULT 0,
  "last_purchase_at" timestamp,
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "provider_credits_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id")
);

CREATE TABLE IF NOT EXISTS "credit_purchases" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "credits" integer NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "payment_method" varchar,
  "mercadopago_payment_id" varchar,
  "status" varchar DEFAULT 'pending',
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "credit_purchases_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id")
);

CREATE TABLE IF NOT EXISTS "lead_responses" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_request_id" integer NOT NULL,
  "provider_id" integer NOT NULL,
  "credits_used" integer NOT NULL,
  "response_message" text,
  "quoted_price" numeric(10, 2),
  "responded_at" timestamp DEFAULT now(),
  "unlocked_at" timestamp DEFAULT now(),
  CONSTRAINT "lead_responses_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id"),
  CONSTRAINT "lead_responses_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id")
);

CREATE TABLE IF NOT EXISTS "provider_services" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "category_id" integer NOT NULL,
  "custom_service_name" varchar(200),
  "description" text,
  "base_price" numeric(10, 2),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "provider_services_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id"),
  CONSTRAINT "provider_services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id")
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_request_id" integer NOT NULL,
  "reviewer_id" varchar NOT NULL,
  "reviewee_id" varchar NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "is_public" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "reviews_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id"),
  CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id"),
  CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_request_id" integer NOT NULL,
  "customer_id" varchar NOT NULL,
  "provider_id" integer NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "platform_fee" numeric(10, 2) NOT NULL,
  "provider_amount" numeric(10, 2) NOT NULL,
  "payment_method" varchar NOT NULL,
  "bank_account_number" varchar,
  "bank_name" varchar,
  "account_holder_name" varchar,
  "transfer_reference" varchar,
  "cash_location" varchar,
  "cash_instructions" text,
  "stripe_payment_intent_id" varchar(255),
  "stripe_charge_id" varchar(255),
  "mercadopago_payment_id" varchar,
  "mercadopago_preference_id" varchar,
  "status" varchar DEFAULT 'pending',
  "currency" varchar(3) DEFAULT 'ars',
  "payment_proof" varchar,
  "paid_at" timestamp,
  "refunded_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "payments_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id"),
  CONSTRAINT "payments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id"),
  CONSTRAINT "payments_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id")
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_request_id" integer NOT NULL,
  "sender_id" varchar NOT NULL,
  "receiver_id" varchar NOT NULL,
  "content" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "messages_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id"),
  CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id"),
  CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_request_id" integer,
  "participant1_id" varchar NOT NULL,
  "participant2_id" varchar NOT NULL,
  "last_message_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "credit_purchases" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "credits" integer NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "payment_method" varchar,
  "mercadopago_payment_id" varchar,
  "status" varchar DEFAULT 'pending',
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_type" varchar(100) NOT NULL,
  "user_id" varchar,
  "provider_id" integer,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now()
);

-- ============================================
-- 0001: APPOINTMENTS + NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "client_id" integer NOT NULL,
  "service_id" integer,
  "scheduled_at" timestamp NOT NULL,
  "status" varchar(32),
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "appointments_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
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

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
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

-- ============================================
-- 002: CONSTRAINTS CRÉDITOS (solo los válidos)
-- ============================================

ALTER TABLE provider_credits
  ADD CONSTRAINT IF NOT EXISTS provider_credits_provider_id_unique UNIQUE (provider_id);

ALTER TABLE provider_credits
  ADD CONSTRAINT IF NOT EXISTS check_current_credits_positive CHECK (current_credits >= 0);

ALTER TABLE provider_credits
  ADD CONSTRAINT IF NOT EXISTS check_total_purchased_positive CHECK (total_purchased >= 0);

ALTER TABLE provider_credits
  ADD CONSTRAINT IF NOT EXISTS check_total_used_positive CHECK (total_used >= 0);

ALTER TABLE credit_purchases
  ADD CONSTRAINT IF NOT EXISTS check_purchase_status CHECK (status IN ('pending', 'completed', 'failed'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_purchases_payment_id_unique
  ON credit_purchases (mercadopago_payment_id)
  WHERE mercadopago_payment_id IS NOT NULL AND status = 'completed';

CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_id
  ON credit_purchases (mercadopago_payment_id)
  WHERE mercadopago_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_purchases_provider_status
  ON credit_purchases (provider_id, status);

-- ============================================
-- 002b: CAMPOS ADICIONALES service_requests
-- ============================================

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100),
  ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- ============================================
-- 003: CREDIT PACKAGES
-- ============================================

CREATE TABLE IF NOT EXISTS credit_packages (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  creditos INTEGER NOT NULL CHECK (creditos > 0),
  precio INTEGER NOT NULL CHECK (precio > 0),
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_packages_destacado
  ON credit_packages (destacado)
  WHERE destacado = TRUE;

INSERT INTO credit_packages (nombre, creditos, precio, destacado, orden) VALUES
  ('Básico',    5,  22000, FALSE, 1),
  ('Estándar', 10,  40000, TRUE,  2),
  ('Premium',  20,  70000, FALSE, 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- 004: ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(256),
  category VARCHAR(64) NOT NULL DEFAULT 'provider',
  points INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(64) NOT NULL DEFAULT 'Award',
  rarity VARCHAR(32) NOT NULL DEFAULT 'common',
  condition_type VARCHAR(64),
  condition_value INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER NOT NULL DEFAULT 0,
  progress_max INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS client_ratings (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  rating VARCHAR(32) NOT NULL CHECK (rating IN ('contact_made', 'no_response', 'invalid_request')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider_id, service_request_id)
);

INSERT INTO achievements (name, description, category, points, icon, rarity, condition_type, condition_value) VALUES
  ('Perfil Completo', 'Completaste tu perfil con foto, descripción, zona y categorías', 'provider', 100, 'UserCheck', 'common', 'profile_complete', 1),
  ('Verificado', 'Tu identidad fue verificada por el equipo', 'provider', 200, 'ShieldCheck', 'uncommon', 'identity_verified', 1),
  ('Primera Solicitud', 'Desbloqueaste tu primer lead', 'provider', 50, 'Unlock', 'common', 'unlocks_total', 1),
  ('Activo', '5 desbloqueos en los últimos 30 días', 'provider', 100, 'Zap', 'uncommon', 'unlocks_30days', 5),
  ('Profesional Frecuente', '20 desbloqueos en total', 'provider', 200, 'Target', 'rare', 'unlocks_total', 20),
  ('Bien Calificado', 'Rating mayor a 4.5 con al menos 5 reseñas', 'provider', 150, 'Star', 'rare', 'rating_min', 45),
  ('Top de su Zona', 'El más desbloqueado en tu categoría y ciudad', 'provider', 300, 'Trophy', 'epic', 'top_zone', 1),
  ('Veterano', '6 meses activo en la plataforma', 'provider', 100, 'Medal', 'uncommon', 'months_active', 6)
ON CONFLICT DO NOTHING;

-- ============================================
-- 005: LOCATION EN USERS
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- ============================================
-- 006: COVERAGE RADIUS (faltaba en la consolidación;
-- confirmado en shared/schema/serviceProviders.ts y en uso
-- real por admin.ts, serviceProviders.ts y providersService.ts)
-- ============================================

ALTER TABLE service_providers
  ADD COLUMN IF NOT EXISTS coverage_radius_km integer;

-- ============================================
-- TABLAS ADICIONALES (relevadas en schema/)
-- ============================================

CREATE TABLE IF NOT EXISTS "provider_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "category_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "provider_categories_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id"),
  CONSTRAINT "provider_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id"),
  UNIQUE("provider_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "mercadopago_webhooks" (
  "id" serial PRIMARY KEY NOT NULL,
  "payment_id" varchar NOT NULL,
  "status" varchar NOT NULL,
  "raw_data" jsonb,
  "processed" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "referral_codes" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" integer NOT NULL,
  "code" varchar(20) NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "referrals" (
  "id" serial PRIMARY KEY NOT NULL,
  "referrer_id" integer NOT NULL,
  "referred_user_id" varchar,
  "code" varchar(20) NOT NULL,
  "status" varchar DEFAULT 'pending',
  "created_at" timestamp DEFAULT now(),
  "completed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" varchar(100) NOT NULL UNIQUE,
  "value" text,
  "updated_at" timestamp DEFAULT now()
);

-- platform_settings: valor inicial requerido por admin.ts
INSERT INTO platform_settings (key, value) VALUES
  ('analytics_start_date', '2026-01-01')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCIÓN: acreditar_creditos_atomico
-- ============================================

CREATE OR REPLACE FUNCTION acreditar_creditos_atomico(
  p_provider_id INTEGER,
  p_purchase_id INTEGER,
  p_credits INTEGER,
  p_payment_id VARCHAR(255)
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  was_duplicate BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_new_balance INTEGER;
  v_existing_count INTEGER;
  v_purchase_status TEXT;
BEGIN
  SELECT COUNT(*) INTO v_existing_count
  FROM credit_purchases
  WHERE mercadopago_payment_id = p_payment_id AND status = 'completed';

  IF v_existing_count > 0 THEN
    SELECT current_credits INTO v_new_balance FROM provider_credits WHERE provider_id = p_provider_id;
    RETURN QUERY SELECT FALSE, v_new_balance, TRUE, 'Payment ID ya procesado'::TEXT;
    RETURN;
  END IF;

  SELECT status INTO v_purchase_status FROM credit_purchases WHERE id = p_purchase_id;

  IF v_purchase_status IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, FALSE, 'Compra no encontrada'::TEXT;
    RETURN;
  END IF;

  IF v_purchase_status = 'completed' THEN
    SELECT current_credits INTO v_new_balance FROM provider_credits WHERE provider_id = p_provider_id;
    RETURN QUERY SELECT FALSE, v_new_balance, TRUE, 'Compra ya completada'::TEXT;
    RETURN;
  END IF;

  INSERT INTO provider_credits (provider_id, current_credits, total_purchased, total_used, last_purchase_at, updated_at)
  VALUES (p_provider_id, p_credits, p_credits, 0, NOW(), NOW())
  ON CONFLICT (provider_id) DO UPDATE SET
    current_credits = provider_credits.current_credits + p_credits,
    total_purchased = provider_credits.total_purchased + p_credits,
    last_purchase_at = NOW(),
    updated_at = NOW()
  RETURNING current_credits INTO v_new_balance;

  UPDATE credit_purchases SET status = 'completed', mercadopago_payment_id = p_payment_id WHERE id = p_purchase_id;

  RETURN QUERY SELECT TRUE, v_new_balance, FALSE, 'Créditos acreditados exitosamente'::TEXT;
END;
$$ LANGUAGE plpgsql;
