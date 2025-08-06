import { db } from './db.js';
import { serviceProviders, users } from './shared/schema.js';
import { eq, or } from 'drizzle-orm';

async function cleanup() {
  try {
    await db.delete(serviceProviders).where(
      or(
        eq(serviceProviders.userId, '123'),
        eq(serviceProviders.userId, '8211c5f8-e115-473d-9080-cbaa4019a0ba')
      )
    );
    await db.delete(users).where(
      or(
        eq(users.id, '123'),
        eq(users.id, '8211c5f8-e115-473d-9080-cbaa4019a0ba')
      )
    );

    console.log('Datos de prueba eliminados.');
  } catch (error) {
    console.error('Error al limpiar:', error);
  }
}

cleanup();

