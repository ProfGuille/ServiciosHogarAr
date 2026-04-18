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
