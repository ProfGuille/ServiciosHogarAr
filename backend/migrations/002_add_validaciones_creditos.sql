-- Migración: Validaciones críticas para sistema de créditos
-- Fecha: 2026-01-10
-- Objetivo: Prevenir doble acreditación y garantizar integridad transaccional
-- VERSIÓN CORREGIDA: Adaptada al esquema REAL del proyecto

BEGIN;

-- ============================================
-- 1. CONSTRAINT: Prevenir provider_id duplicados
-- ============================================
-- Garantiza que cada proveedor tenga UN SOLO registro de créditos
ALTER TABLE provider_credits
ADD CONSTRAINT provider_credits_provider_id_unique UNIQUE (provider_id);

-- ============================================
-- 2. CONSTRAINT: Prevenir payment_id duplicados
-- ============================================
-- Garantiza que un payment_id de Mercado Pago solo se use UNA vez
CREATE UNIQUE INDEX idx_credit_purchases_payment_id_unique
ON credit_purchases (mercadopago_payment_id)
WHERE mercadopago_payment_id IS NOT NULL 
  AND status = 'completed';

-- ============================================
-- 3. CONSTRAINT: Validar status permitidos
-- ============================================
ALTER TABLE credit_purchases
ADD CONSTRAINT check_purchase_status 
CHECK (status IN ('pending', 'completed', 'failed'));

-- ============================================
-- 4. CONSTRAINT: Créditos siempre no negativos
-- ============================================
ALTER TABLE provider_credits
ADD CONSTRAINT check_current_credits_positive 
CHECK (current_credits >= 0);

ALTER TABLE provider_credits
ADD CONSTRAINT check_total_purchased_positive 
CHECK (total_purchased >= 0);

ALTER TABLE provider_credits
ADD CONSTRAINT check_total_used_positive 
CHECK (total_used >= 0);

-- ============================================
-- 5. ÍNDICES para búsquedas rápidas
-- ============================================
-- Optimiza verificación de payment_id ya procesado
CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_id 
ON credit_purchases (mercadopago_payment_id)
WHERE mercadopago_payment_id IS NOT NULL;

-- Optimiza búsqueda por proveedor y status
CREATE INDEX IF NOT EXISTS idx_credit_purchases_provider_status 
ON credit_purchases (provider_id, status);

-- Optimiza búsqueda por status y fecha
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status_created 
ON credit_purchases (status, created_at);

-- ============================================
-- 6. FUNCIÓN: Acreditar créditos de forma atómica
-- ============================================
-- Esta función previene race conditions y garantiza idempotencia
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
    -- 1. Verificar si el payment_id ya fue acreditado
    SELECT COUNT(*) INTO v_existing_count
    FROM credit_purchases
    WHERE mercadopago_payment_id = p_payment_id
      AND status = 'completed';

    -- Si ya existe, retornar sin procesar (idempotencia)
    IF v_existing_count > 0 THEN
        SELECT current_credits INTO v_new_balance
        FROM provider_credits
        WHERE provider_id = p_provider_id;

        RETURN QUERY SELECT FALSE, v_new_balance, TRUE, 'Payment ID ya procesado'::TEXT;
        RETURN;
    END IF;

    -- 2. Verificar que la compra exista y esté pendiente
    SELECT status INTO v_purchase_status
    FROM credit_purchases
    WHERE id = p_purchase_id;

    IF v_purchase_status IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, FALSE, 'Compra no encontrada'::TEXT;
        RETURN;
    END IF;

    IF v_purchase_status = 'completed' THEN
        SELECT current_credits INTO v_new_balance
        FROM provider_credits
        WHERE provider_id = p_provider_id;

        RETURN QUERY SELECT FALSE, v_new_balance, TRUE, 'Compra ya completada'::TEXT;
        RETURN;
    END IF;

    -- 3. Actualizar o insertar en provider_credits (UPSERT atómico)
    INSERT INTO provider_credits (
        provider_id,
        current_credits,
        total_purchased,
        total_used,
        last_purchase_at,
        updated_at
    ) VALUES (
        p_provider_id,
        p_credits,
        p_credits,
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (provider_id) DO UPDATE SET
        current_credits = provider_credits.current_credits + p_credits,
        total_purchased = provider_credits.total_purchased + p_credits,
        last_purchase_at = NOW(),
        updated_at = NOW()
    RETURNING current_credits INTO v_new_balance;

    -- 4. Marcar la compra como completada
    UPDATE credit_purchases
    SET status = 'completed',
        mercadopago_payment_id = p_payment_id
    WHERE id = p_purchase_id;

    -- 5. Retornar éxito
    RETURN QUERY SELECT TRUE, v_new_balance, FALSE, 'Créditos acreditados exitosamente'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- Verificar constraint de provider_id único
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'provider_credits_provider_id_unique'
    ) THEN
        RAISE EXCEPTION 'Constraint provider_credits_provider_id_unique no existe';
    END IF;
    RAISE NOTICE 'OK: Constraint provider_id único verificado';
END $$;

-- Verificar índice único de payment_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_credit_purchases_payment_id_unique'
    ) THEN
        RAISE EXCEPTION 'Índice idx_credit_purchases_payment_id_unique no existe';
    END IF;
    RAISE NOTICE 'OK: Índice payment_id único verificado';
END $$;

-- Verificar función atómica
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'acreditar_creditos_atomico'
    ) THEN
        RAISE EXCEPTION 'Función acreditar_creditos_atomico no existe';
    END IF;
    RAISE NOTICE 'OK: Función atómica verificada';
END $$;

-- Verificar constraints de validación
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_purchase_status'
    ) THEN
        RAISE EXCEPTION 'Constraint check_purchase_status no existe';
    END IF;
    RAISE NOTICE 'OK: Constraint de status verificado';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK (solo para emergencias)
-- ============================================
-- Si necesitas revertir esta migración:
/*
BEGIN;

DROP FUNCTION IF EXISTS acreditar_creditos_atomico;
DROP INDEX IF EXISTS idx_credit_purchases_payment_id_unique;
DROP INDEX IF EXISTS idx_credit_purchases_payment_id;
DROP INDEX IF EXISTS idx_credit_purchases_provider_status;
DROP INDEX IF EXISTS idx_credit_purchases_status_created;
ALTER TABLE provider_credits DROP CONSTRAINT IF EXISTS provider_credits_provider_id_unique;
ALTER TABLE provider_credits DROP CONSTRAINT IF EXISTS check_current_credits_positive;
ALTER TABLE provider_credits DROP CONSTRAINT IF EXISTS check_total_purchased_positive;
ALTER TABLE provider_credits DROP CONSTRAINT IF EXISTS check_total_used_positive;
ALTER TABLE credit_purchases DROP CONSTRAINT IF EXISTS check_purchase_status;

COMMIT;
*/
