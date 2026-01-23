import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function apply() {
  console.log('🔧 Aplicando campos nuevos...');
  
  try {
    await sql`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100)`;
    await sql`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`;
    await sql`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`;
    await sql`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100)`;
    
    await sql`ALTER TABLE lead_responses ADD COLUMN IF NOT EXISTS provider_id INTEGER`;
    await sql`ALTER TABLE lead_responses ADD COLUMN IF NOT EXISTS credits_spent INTEGER DEFAULT 1`;
    await sql`ALTER TABLE lead_responses ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP DEFAULT NOW()`;
    
    console.log('✅ Columnas agregadas');
  } catch (err) {
    console.log('⚠️', err.message);
  }
}

apply();
