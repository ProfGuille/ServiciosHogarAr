-- Migración: Tabla credit_packages para gestión de precios desde admin
-- Fecha: 2026-04-12

BEGIN;

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

-- Datos iniciales
INSERT INTO credit_packages (nombre, creditos, precio, destacado, orden) VALUES
  ('Básico',    5,  22000, FALSE, 1),
  ('Estándar', 10,  40000, TRUE,  2),
  ('Premium',  20,  70000, FALSE, 3);

-- Solo un paquete puede ser destacado
CREATE UNIQUE INDEX idx_credit_packages_destacado 
  ON credit_packages (destacado) 
  WHERE destacado = TRUE;

COMMIT;
