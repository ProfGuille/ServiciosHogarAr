// backend/apply-migration.js
// Ejecuta la migración 002_secure_leads_system.sql

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function applyMigration() {
  try {
    console.log('📦 Aplicando migración 002_secure_leads_system...\n');

    const migration = fs.readFileSync('./migrations/002_secure_leads_system.sql', 'utf8');
    
    // Ejecutar migración completa
    await sql(migration);

    console.log('✅ Migración aplicada exitosamente\n');

    // Verificar cambios
    console.log('🔍 Verificando estructura de service_requests...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'service_requests' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Columnas de service_requests:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n🔍 Verificando constraints de lead_responses...');
    const constraints = await sql`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'lead_responses'
    `;
    
    console.log('\n🔒 Constraints de lead_responses:');
    constraints.forEach(c => {
      console.log(`  - ${c.constraint_name}: ${c.constraint_type}`);
    });

    console.log('\n✅ Todo OK - Sistema de leads seguro aplicado');

  } catch (error) {
    console.error('❌ Error aplicando migración:', error.message);
    process.exit(1);
  }
}

applyMigration();
