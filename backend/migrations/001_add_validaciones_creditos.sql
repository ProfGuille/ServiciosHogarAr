-- Migración: Validaciones críticas para sistema de créditos
-- Fecha: 2026-01-10
-- Objetivo: Prevenir doble acreditación y garantizar integridad transaccional

BEGIN;

-- ============================================
-- 1. CONSTRAINT: Balance siempre positivo
-- ============================================
ALTER TABLE users
ADD CONSTRAINT check_credits_positive 
CHECK (credits >= 0);

-- ============================================
-- 2. ÍNDICE ÚNICO: Prevenir duplicados por payment_id
-- ============================================
-- Esto garantiza que un mismo payment_id de Mercado Pago
-- solo pueda estar asociado a UNA transacción exitosa

CREATE UNIQUE INDEX idx_transactions_payment_id_unique
ON transactions (payment_id)
WHERE status = 'completed';

-- ============================================
-- 3. ÍNDICE para búsquedas rápidas
-- ============================================
-- Optimiza la consulta que verifica si un payment_id ya fue procesado
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id 
ON transactions (payment_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_status 
ON transactions (user_id, status);

-- ============================================
-- 4. FUNCIÓN: Acreditar créditos de forma atómica
-- ============================================
-- Esta función combina la inserción en transactions
-- y la actualización de credits en una sola operación atómica

CREATE OR REPLACE FUNCTION acreditar_creditos(
    p_user_id INTEGER,
    p_payment_id VARCHAR(255),
    p_amount DECIMAL(10,2),
    p_credits INTEGER,
    p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(
    transaction_id INTEGER,
    new_balance INTEGER,
    was_duplicate BOOLEAN
) AS $$
DECLARE
    v_transaction_id INTEGER;
    v_new_balance INTEGER;
    v_existing_count INTEGER;
BEGIN
    -- Verificar si el payment_id ya fue procesado
    SELECT COUNT(*) INTO v_existing_count
    FROM transactions
    WHERE payment_id = p_payment_id
      AND status = 'completed';

    -- Si ya existe, retornar sin procesar (idempotencia)
    IF v_existing_count > 0 THEN
        SELECT id, credits INTO v_transaction_id, v_new_balance
        FROM transactions
        WHERE payment_id = p_payment_id
          AND status = 'completed'
        LIMIT 1;

        RETURN QUERY SELECT v_transaction_id, v_new_balance, TRUE;
        RETURN;
    END IF;

    -- Insertar transacción
    INSERT INTO transactions (user_id, payment_id, amount, credits, status, metadata, created_at)
    VALUES (p_user_id, p_payment_id, p_amount, p_credits, 'completed', p_metadata, NOW())
    RETURNING id INTO v_transaction_id;

    -- Actualizar balance del usuario
    UPDATE users
    SET credits = credits + p_credits,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING credits INTO v_new_balance;

    -- Retornar resultado
    RETURN QUERY SELECT v_transaction_id, v_new_balance, FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
-- Queries para verificar que todo se aplicó correctamente

-- Verificar constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_credits_positive'
    ) THEN
        RAISE EXCEPTION 'Constraint check_credits_positive no existe';
    END IF;
END $$;

-- Verificar índice único
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_transactions_payment_id_unique'
    ) THEN
        RAISE EXCEPTION 'Índice idx_transactions_payment_id_unique no existe';
    END IF;
END $$;

-- Verificar función
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'acreditar_creditos'
    ) THEN
        RAISE EXCEPTION 'Función acreditar_creditos no existe';
    END IF;
END $$;

COMMIT;

-- ============================================
-- ROLLBACK (solo para emergencias)
-- ============================================
-- Si necesitas revertir esta migración:
/*
BEGIN;

DROP FUNCTION IF EXISTS acreditar_creditos;
DROP INDEX IF EXISTS idx_transactions_payment_id_unique;
DROP INDEX IF EXISTS idx_transactions_payment_id;
DROP INDEX IF EXISTS idx_transactions_user_status;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_credits_positive;

COMMIT;
*/
