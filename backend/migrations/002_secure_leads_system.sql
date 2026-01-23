-- MIGRACIÓN 002: Sistema de Leads Seguro
-- Fecha: 2026-01-13
-- Objetivo: Proteger datos del cliente + sistema de desbloqueo con créditos

-- ============================================
-- PASO 1: Mantener dirección pero agregar zona
-- ============================================

-- La columna 'address' YA EXISTE (dirección completa del cliente)
-- Agregamos 'neighborhood' para zona general (auto-generada desde address)

ALTER TABLE service_requests 
  ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- NOTA: neighborhood se auto-completará con geocoding o input manual
-- Ejemplo: address="Av Santa Fe 1234" → neighborhood="Palermo"

-- ============================================
-- PASO 2: Agregar campos de cliente seguros
-- ============================================

-- Agregar nombre (solo nombre de pila, sin apellido)
ALTER TABLE service_requests 
  ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100);

-- Agregar teléfono/WhatsApp
ALTER TABLE service_requests 
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- Agregar email opcional
ALTER TABLE service_requests 
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- ============================================
-- PASO 3: Refactorizar lead_responses para desbloqueos
-- ============================================

-- Agregar provider_id (quién desbloqueó)
ALTER TABLE lead_responses 
  ADD COLUMN IF NOT EXISTS provider_id INTEGER NOT NULL DEFAULT 0;

-- Agregar créditos gastados
ALTER TABLE lead_responses 
  ADD COLUMN IF NOT EXISTS credits_spent INTEGER NOT NULL DEFAULT 1;

-- Agregar timestamp de desbloqueo
ALTER TABLE lead_responses 
  ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP DEFAULT NOW();

-- Cambiar 'response' a opcional (no siempre hay respuesta al desbloquear)
ALTER TABLE lead_responses 
  ALTER COLUMN response DROP NOT NULL;

-- ============================================
-- PASO 4: Constraints de seguridad
-- ============================================

-- Evitar que un proveedor pague dos veces por el mismo lead
ALTER TABLE lead_responses 
  ADD CONSTRAINT unique_provider_lead 
  UNIQUE(lead_id, provider_id);

-- FK a service_requests (lead_id)
ALTER TABLE lead_responses 
  ADD CONSTRAINT fk_lead_responses_service_request
  FOREIGN KEY (lead_id) 
  REFERENCES service_requests(id) 
  ON DELETE CASCADE;

-- FK a service_providers (provider_id)
ALTER TABLE lead_responses 
  ADD CONSTRAINT fk_lead_responses_provider
  FOREIGN KEY (provider_id) 
  REFERENCES service_providers(id) 
  ON DELETE CASCADE;

-- ============================================
-- PASO 5: Índices para performance
-- ============================================

-- Búsqueda rápida de leads por proveedor
CREATE INDEX IF NOT EXISTS idx_lead_responses_provider 
  ON lead_responses(provider_id);

-- Búsqueda rápida de leads por request
CREATE INDEX IF NOT EXISTS idx_lead_responses_lead 
  ON lead_responses(lead_id);

-- Leads disponibles por zona
CREATE INDEX IF NOT EXISTS idx_service_requests_location 
  ON service_requests(city, province);

-- Leads por categoría
CREATE INDEX IF NOT EXISTS idx_service_requests_category 
  ON service_requests(category_id);

-- ============================================
-- PASO 6: Validación de datos
-- ============================================

-- Solo estados válidos
ALTER TABLE service_requests 
  ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'));

-- Créditos siempre positivos
ALTER TABLE lead_responses 
  ADD CONSTRAINT check_credits_positive 
  CHECK (credits_spent > 0);

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- Ver estructura final de service_requests
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'service_requests';

-- Ver estructura final de lead_responses
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'lead_responses';

-- Ver constraints aplicados
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name IN ('service_requests', 'lead_responses');
