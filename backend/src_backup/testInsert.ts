import { insertUserProviderAndServicesTest } from './storage.js';

async function run() {
  try {
    await insertUserProviderAndServicesTest();
    console.log('Inserción de prueba completada');
  } catch (error) {
    console.error('Error en inserción test:', error);
  }
}

run();

