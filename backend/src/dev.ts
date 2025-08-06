import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes/index.js";
import { initializeWebSocket } from "./websocket.js";

console.log("Iniciando aplicación...");

const app = express();

app.use(cors());
app.use(express.json());

console.log("Registrando rutas...");
registerRoutes(app);

// Middleware para capturar errores y devolver JSON
app.use((err, req, res, next) => {
  console.error('Error en la ruta:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});

console.log("Inicializando WebSocket...");
initializeWebSocket(server);

console.log("Servidor iniciado correctamente.");

