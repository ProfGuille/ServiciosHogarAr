import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import registerRoutes from "./routes/index.js";
import { runMigrations, sql as dbSql } from "./db.js";
import { sendAdminStalePendingRequestsEmail, sendClientReviewReminderEmail } from "./services/resendEmailService.js";


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
// 2. CORS MANUAL CON LOGS
// -----------------------------
const allowedOrigins = process.env.NODE_ENV === "production"
  ? ["https://servicioshogar.com.ar", "https://www.servicioshogar.com.ar"]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log("🔍 CORS Debug:");
  console.log("  - Origin header:", origin);
  console.log("  - Method:", req.method);
  console.log("  - Path:", req.path);
  console.log("  - Allowed origins:", allowedOrigins);
  
  if (origin && allowedOrigins.includes(origin)) {
    console.log("  ✅ Origin permitido, agregando headers CORS");
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    console.log("  ❌ Origin NO permitido o undefined");
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  if (req.method === "OPTIONS") {
    console.log("  📋 Respondiendo a preflight OPTIONS");
    return res.sendStatus(204);
  }
  
  next();
});

// -----------------------------
// 3. SECURITY MIDDLEWARES
// -----------------------------
app.use(helmet());
app.use(compression());

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

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// -----------------------------
// 7. REGISTER ROUTES
// -----------------------------
app.use("/api", registerRoutes);
// Rutas de testing de email

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
  //   await runMigrations();

async function checkStalePendingRequests() {
  try {
    await dbSql`
      ALTER TABLE service_requests
      ADD COLUMN IF NOT EXISTS admin_notified_at TIMESTAMPTZ
    `;
    const stale = await dbSql`
      SELECT id, title, city, province, is_urgent, created_at
      FROM service_requests
      WHERE status = 'pending'
        AND admin_notified_at IS NULL
        AND (
          (is_urgent = true  AND created_at < NOW() - INTERVAL '12 hours')
          OR
          (is_urgent = false AND created_at < NOW() - INTERVAL '24 hours')
        )
    ` as any[];
    if (stale.length > 0) {
      await sendAdminStalePendingRequestsEmail(stale.map((r: any) => ({
        id: r.id, title: r.title, city: r.city,
        province: r.province, isUrgent: r.is_urgent, createdAt: r.created_at
      })));
      const ids = stale.map((r: any) => r.id);
      for (const id of ids) {
        await dbSql`UPDATE service_requests SET admin_notified_at = NOW() WHERE id = ${id}`;
      }
      console.log(`📧 Alerta admin enviada: ${stale.length} solicitudes sin respuesta`);
    }
  } catch (err) {
    console.error("❌ Error en job solicitudes pendientes:", err);
  }
}
async function checkReviewReminders() {
  try {
    await dbSql`
      ALTER TABLE lead_responses
      ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ
    `;
    const pending = await dbSql`
      SELECT
        lr.id as lead_response_id,
        sr.title,
        u.email,
        u.first_name
      FROM lead_responses lr
      JOIN service_requests sr ON sr.id = lr.service_request_id
      JOIN users u ON u.id = sr.user_id
      WHERE lr.unlocked_at < NOW() - INTERVAL '48 hours'
        AND lr.reminder_sent_at IS NULL
        AND sr.status = 'in_progress'
    ` as any[];

    for (const row of pending) {
      if (!row.email) continue;
      await sendClientReviewReminderEmail(
        row.email,
        row.first_name || 'Cliente',
        row.title
      );
      await dbSql`
        UPDATE lead_responses
        SET reminder_sent_at = NOW()
        WHERE id = ${row.lead_response_id}
      `;
    }
    if (pending.length > 0) {
      console.log(`📧 Recordatorios reseña enviados: ${pending.length}`);
    }
  } catch (err) {
    console.error("❌ Error en job recordatorios reseña:", err);
  }
}

setInterval(checkStalePendingRequests, 60 * 60 * 1000);
setTimeout(checkStalePendingRequests, 10000);
setInterval(checkReviewReminders, 60 * 60 * 1000);
setTimeout(checkReviewReminders, 20000);

  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Error inicializando la aplicación:", err);
  process.exit(1);
});
