// backend/src/tools/diagnostico.ts

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db } from '../db';

// Cargar variables de entorno
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

function logSection(title: string) {
  console.log(`\n=== ${title.toUpperCase()} ===\n`);
}

function run(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error: any) {
    return `Error ejecutando "${command}": ${error.message}`;
  }
}

async function main() {
  logSection('REPOSITORIO GIT');
  console.log(run('git remote -v'));
  console.log(run('git branch --show-current'));
  console.log(run('git log -1 --oneline'));

  logSection('ESTADO DE ARCHIVOS');
  console.log(run('git status'));

  logSection('VARIABLES DE ENTORNO (.env)');
  const envContent = fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line.includes('RENDER') || line.includes('NEON') || line.includes('HOSTINGER'))
    .join('\n');
  console.log(envContent || 'No se encontraron referencias a Render, Neon o Hostinger');

  logSection('CONEXIÓN A BASE DE DATOS (NEON)');
  try {
    const result = await db.execute("SELECT NOW() as now;");
    console.log('Conexión exitosa. Hora actual en DB:', result.rows[0].now);
  } catch (e) {
    console.error('Error conectando a Neon:', e);
  }

  logSection('ENDPOINTS PRINCIPALES (localhost)');
  const endpoints = [
    'GET http://localhost:5000/api/messages/1',
    'GET http://localhost:5000/api/conversations/provider/1',
    'GET http://localhost:5000/api/providers/1',
    'GET http://localhost:5000/api/clients/1',
  ];
  for (const url of endpoints) {
    console.log(`\n>> ${url}`);
    console.log(run(`curl -s -X ${url.split(' ')[0]} ${url.split(' ')[1]}`));
  }

  logSection('INSTRUCCIONES PARA COLABORADORES');
  console.log(`
1. Clonar el repo: git clone https://github.com/ProfGuille/ServiciosHogarAr.git
2. Instalar dependencias: npm install
3. Crear .env basado en .env.example
4. Ejecutar backend: npm run dev
5. Verificar base de datos (Neon)
6. Frontend estático subido a Hostinger (ver README o dominio registrado)
`);
}

main();
