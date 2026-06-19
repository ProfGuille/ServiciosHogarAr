
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const adminEmail = process.env.ADMIN_EMAIL!;
const adminPass = process.env.ADMIN_PASS!;
const circaireEmail = process.env.CIRCAIRE_EMAIL!;
const circairePass = process.env.CIRCAIRE_PASS!;

if (!adminEmail || !adminPass || !circaireEmail || !circairePass) {
  console.error('Faltan variables. Usar: ADMIN_EMAIL=... ADMIN_PASS=... CIRCAIRE_EMAIL=... CIRCAIRE_PASS=... tsx src/seeders/gen-seed-users.ts');
  process.exit(1);
}

const adminId = nanoid();
const circaireUserId = nanoid();
const adminHash = await bcrypt.hash(adminPass, 10);
const circaireHash = await bcrypt.hash(circairePass, 10);

console.log(`-- ============================================================
-- SEED USUARIOS + CIRCAIRE  (pegar en Supabase SQL Editor)
-- ============================================================

INSERT INTO users (id, email, first_name, last_name, user_type, password, created_at, updated_at) VALUES
  ('${adminId}', '${adminEmail}', 'Admin', 'ServiciosHogar', 'admin', '${adminHash}', NOW(), NOW()),
  ('${circaireUserId}', '${circaireEmail}', 'CIRCAIRE', 'Aire', 'provider', '${circaireHash}', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO service_providers (user_id, business_name, description, city, province, is_active, is_verified, rating, total_reviews, created_at, updated_at)
VALUES ('${circaireUserId}', 'CIRCAIRE', 'Instalación, mantenimiento y reparación de equipos de aire acondicionado.', 'Buenos Aires', 'Buenos Aires', true, false, 0, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO provider_categories (provider_id, category_id, created_at)
VALUES (
  (SELECT id FROM service_providers WHERE user_id = '${circaireUserId}' LIMIT 1),
  (SELECT id FROM service_categories WHERE name = 'Técnico de Aire' LIMIT 1),
  NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO provider_credits (provider_id, current_credits, total_purchased, total_used, updated_at)
VALUES (
  (SELECT id FROM service_providers WHERE user_id = '${circaireUserId}' LIMIT 1),
  20, 20, 0, NOW()
) ON CONFLICT (provider_id) DO NOTHING;`);
