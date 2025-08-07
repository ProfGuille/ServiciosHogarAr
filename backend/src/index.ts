import express from "express";
// import { initializeWebSocket } from "./websocket.js"; // <-- Elimina esta línea si no existe

const app = express();

// ... tu lógica principal aquí (rutas, middlewares, etc.)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});