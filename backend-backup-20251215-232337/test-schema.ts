import { db } from './src/db.js'; // Asegurate que la ruta sea correcta
import { serviceCategories } from './shared/schema'; // Ajustá si la ruta es distinta

async function test() {
  try {
    const resultado = await db.select().from(serviceCategories).limit(1);
    console.log("✅ Consulta exitosa:");
    console.log(resultado);
  } catch (error) {
    console.error("❌ Error al consultar serviceCategories:");
    console.error(error);
  }
}

test();

