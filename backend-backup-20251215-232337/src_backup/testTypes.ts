import { db } from './db.js';
import { serviceProviders } from './shared/schema.js';


async function test() {
  // Solo para ver qué propiedades acepta el insert
  const data = {
    // Pon valores de prueba simplificados
    userId: '123',
    businessName: 'Test',
    description: 'Desc',
    experienceYears: 1,
    serviceAreas: ['Zona1'],
    hourlyRate: 1000,
    phoneNumber: '123456',
    address: 'Dirección',
    city: 'Ciudad',
    province: 'Provincia',
    postalCode: '0000',
    isVerified: false,
    isActive: true,
  };

  // Aquí TypeScript indicará errores de tipo si hay propiedades mal
  const insert = db.insert(serviceProviders).values(data);
  console.log(insert);
}

test();

