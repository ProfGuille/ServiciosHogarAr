import dotenv from "dotenv";
dotenv.config();

import { pool } from "./db";

async function testConnection() {
  try {
    // Ejecutamos una consulta simple para probar la conexión
    const result = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa, hora actual:", result.rows[0]);
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
  } finally {
    await pool.end(); // Cerramos la conexión
  }
}

testConnection();

