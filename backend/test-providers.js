import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function test() {
  try {
    const result = await sql`SELECT COUNT(*) as total FROM service_providers`;
    console.log('✅ Total proveedores:', result[0].total);
    
    const sample = await sql`SELECT id, business_name, city FROM service_providers LIMIT 3`;
    console.log('\n📋 Muestra de proveedores:');
    sample.forEach(p => console.log(`  - ID ${p.id}: ${p.business_name} (${p.city})`));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
