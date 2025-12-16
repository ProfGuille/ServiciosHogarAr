import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import registerRoutes from "./routes/index.js";
import { runMigrations, isDatabaseAvailable } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------
// 1. VALIDACIÓN DE ENTORNO
// -----------------------------
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida. El backend no puede iniciar.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET no está definido. Usando fallback inseguro.");
}

// -----------------------------
// 2. SECURITY MIDDLEWARES
// -----------------------------
app.use(helmet());
app.use(compression());

// -----------------------------
// 3. CORS
// -----------------------------
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://servicioshogar.com.ar",
            "https://www.servicioshogar.com.ar",
          ]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -----------------------------
// 4. BODY PARSING
// -----------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -----------------------------
// 5. REQUEST LOGGING
// -----------------------------
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body) {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
    return originalSend.call(this, body);
  };

  next();
});

// -----------------------------
// 6. INFO & HEALTH ENDPOINTS
// -----------------------------
app.get("/api/info", (req, res) => {
  res.json({
    message: "Servicios Hogar API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  const dbStatus = isDatabaseAvailable() ? "connected" : "disconnected";

  res.status(dbStatus === "connected" ? 200 : 503).json({
    status: dbStatus === "connected" ? "ok" : "error",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
  });
});

// -----------------------------
// 7. REGISTER ROUTES
// -----------------------------
registerRoutes(app);

// -----------------------------
// 8. 404 HANDLER
// -----------------------------
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

// -----------------------------
// 9. ERROR HANDLER GLOBAL
// -----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message,
  });
});

// -----------------------------
// 10. START SERVER
// -----------------------------
async function start() {
  console.log("🔄 Ejecutando migraciones...");
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Error inicializando la aplicación:", err);
  process.exit(1);
});

