-- Crear tabla provider_categories
CREATE TABLE IF NOT EXISTS provider_categories (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_provider_category UNIQUE(provider_id, category_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_provider_categories_category_id ON provider_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_categories_provider_id ON provider_categories(provider_id);

-- Insertar datos de ejemplo (relacionar algunos proveedores con categorías)
-- Estos son ejemplos - ajustar según tus proveedores reales
INSERT INTO provider_categories (provider_id, category_id) 
VALUES 
  (1, 11),  -- Proveedor 1 con Plomería
  (2, 1),   -- Proveedor 2 con Electricidad
  (3, 5)    -- Proveedor 3 con otra categoría
ON CONFLICT (provider_id, category_id) DO NOTHING;
