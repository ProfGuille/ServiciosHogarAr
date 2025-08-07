// Si en websocket.ts NO existe 'initializeWebSocket', elimina el import o crea la función y expórtala.
// Eliminando el import:
import express from "express";
// import { initializeWebSocket } from "./websocket.js"; // <-- Elimina esta línea

const app = express();

// ... tu lógica principal aquí