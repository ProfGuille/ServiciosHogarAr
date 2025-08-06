import express from "express";
import cors from "cors";
// import dotenv from "dotenv";  <-- comentada para evitar doble carga

import { registerRoutes } from "./routes/index.js";
import { initializeWebSocket } from "./websocket.js";

// dotenv.config();  <-- comentar o eliminar esta línea

const app = express();

app.use(cors());
app.use(express.json());

// Registro de rutas
registerRoutes(app);

// Arranque del servidor HTTP
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});

// Inicialización del WebSocket
const webSocketManager = initializeWebSocket(server);

