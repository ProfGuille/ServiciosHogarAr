import { db } from "./db.js";
import { languages } from "./shared/schema";

export async function testDb() {
  // Prueba seleccionando 1 registro de una tabla real
  await db.select().from(languages).limit(1);
  return true;
}