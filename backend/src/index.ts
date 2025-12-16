import 'dotenv/config';
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes/index.js";
import { db, isDatabaseAvailable, runMigrations } from "./db.js";
import { fileURLToPath } from "url";
import path from "path";
import "./types/session.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Check required environment variables
const requiredEnv = [
  'SESSION_SECRET',
  'DATABASE_URL'
];

const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  console.warn('⏰ Server running in limited mode.');
}

// Trust proxy (Render)
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://servicioshogar.com.ar',
        'https://www.servicioshogar.com.ar'
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sessions
const PgSession = connectPgSimple(session);

const sessionConfig: any = {
  secret: process.env.SESSION_SECRET || 'servicioshogar-default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'servicioshogar.sid'
};

if (isDatabaseAvailable() && process.env.DATABASE_URL) {
  try {
    sessionConfig.store = new PgSession({
      conObject: { connectionString: process.env.DATABASE_URL },
      tableName: 'session',
      createTableIfMissing: true
    });
    console.log('✅ Using database session store');
  } catch (error) {
    console.warn('⚠️  Failed to initialize database session store, using memory store:', error);
  }
} else {
  console.warn('⚠️  Using memory session store (sessions will not persist)');
}

app.use(session(sessionConfig));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body) {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
    return originalSend.call(this, body);
  };

  next();
});

// API info
app.get('/api/info', (req: Request, res: Response) => {
  res.json({
    message: 'Servicios Hogar API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: isDatabaseAvailable() ? 'connected' : 'disconnected',
        url_configured: !!process.env.DATABASE_URL
      }
    }
  };

  const statusCode =
    healthStatus.services.database.status === 'disconnected' &&
    process.env.NODE_ENV === 'production'
      ? 503
      : 200;

  res.status(statusCode).json(healthStatus);
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({
    message: 'Backend conectado correctamente',
    timestamp: new Date().toISOString(),
    session: req.session?.id || 'no-session'
  });
});

// Ping
app.get('/api/ping', (req: Request, res: Response) => {
  res.json({
    pong: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// User language preference
app.post('/api/user-language-preference', (req: Request, res: Response) => {
  try {
    const { languageCode } = req.body;

    if (req.session && (req.session as any).userId) {
      console.log(`User ${(req.session as any).userId} set language to ${languageCode}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving language preference:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Register routes
try {
  registerRoutes(app);
} catch (error) {
  console.error('❌ Error registering routes:', error);
}

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 for API
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Root
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Servicios Hogar API',
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

async function initializeApp() {
  if (isDatabaseAvailable()) {
    console.log('🔄 Running database migrations...');
    try {
      await runMigrations();
    } catch (error) {
      console.error('❌ Error running migrations:', error);
    }
  }

  app.listen(PORT, async () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  });
}

initializeApp().catch(error => {
  console.error('❌ Failed to initialize application:', error);
  process.exit(1);
});

