import WebSocket, { Server } from "ws";

const wss = new Server({ port: 8080 });

wss.on("connection", (ws: WebSocket) => {
  console.log("Nuevo cliente conectado");

  ws.on("message", (message: string) => {
    console.log(`Mensaje recibido: ${message}`);
    // Puedes manejar el mensaje recibido aquí
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

console.log("Servidor WebSocket escuchando en el puerto 8080");