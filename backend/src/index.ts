import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes/index.js";
import { db, isDatabaseAvailable } from "./db.js";
import dotenv from "dotenv";
import path from "path";
import "./types/session.js"; // Import session type extensions

// Load environment variables (don't override existing ones)
dotenv.config({ 
  path: path.resolve(process.cwd(), 'backend/.env'),
  override: false // Don't override existing environment variables
});

const app = express();

// Trust proxy for correct IP addresses behind reverse proxy
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://servicioshogar.com.ar', 
        'https://www.servicioshogar.com.ar',
        'https://servicioshogar-backend-uje1.onrender.com' // Allow requests from render itself for testing
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
const PgSession = connectPgSimple(session);

// Only use database session store if database is available
const sessionConfig: any = {
  secret: process.env.SESSION_SECRET || 'servicioshogar-default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'servicioshogar.sid'
};

if (isDatabaseAvailable() && process.env.DATABASE_URL) {
  try {
    sessionConfig.store = new PgSession({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      tableName: 'session',
      createTableIfMissing: true,
    });
    console.log('✅ Using database session store');
  } catch (error) {
    console.warn('⚠️  Failed to initialize database session store, using memory store:', error);
  }
} else {
  console.warn('⚠️  Using memory session store (sessions will not persist)');
}

app.use(session(sessionConfig));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(body) {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
    return originalSend.call(this, body);
  };
  
  next();
});

// Root endpoint - welcome message for API
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Servicios Hogar API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      documentation: 'API endpoints available under /api/*'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: isDatabaseAvailable() ? 'connected' : 'disconnected',
        url_configured: !!process.env.DATABASE_URL
      },
      session_store: {
        type: isDatabaseAvailable() && process.env.DATABASE_URL ? 'database' : 'memory'
      },
      environment_variables: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        SESSION_SECRET: !!process.env.SESSION_SECRET,
        VAPID_PUBLIC_KEY: !!process.env.VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY: !!process.env.VAPID_PRIVATE_KEY,
        VAPID_EMAIL: !!process.env.VAPID_EMAIL
      }
    },
    server: {
      port: process.env.PORT || 3000,
      uptime: process.uptime()
    }
  };
  
  // Return 503 if critical services are down, 200 if server is functional
  const statusCode = healthStatus.services.database.status === 'disconnected' && 
                     process.env.NODE_ENV === 'production' ? 503 : 200;
  
  res.status(statusCode).json(healthStatus);
});

// Test endpoint for frontend connection
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Backend conectado correctamente',
    timestamp: new Date().toISOString(),
    session: req.session?.id || 'no-session'
  });
});

// Simple diagnostic endpoint that always works
app.get('/api/ping', (req: Request, res: Response) => {
  res.json({ 
    pong: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register all routes
try {
  registerRoutes(app);
} catch (error) {
  console.error('❌ Error registering routes:', error);
  console.warn('⚠️ Server will continue with limited route functionality');
  
  // Add basic fallback routes in case route registration fails
  app.get('/api/fallback-status', (req: Request, res: Response) => {
    res.json({ 
      error: 'Some routes failed to load',
      status: 'partial_functionality',
      timestamp: new Date().toISOString()
    });
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Database status
  if (isDatabaseAvailable()) {
    console.log(`🗄️ Base de datos: ✅ Conectada`);
  } else {
    console.log(`🗄️ Base de datos: ⚠️  No disponible (modo limitado)`);
    if (!process.env.DATABASE_URL) {
      console.log(`   Configura DATABASE_URL para funcionalidad completa`);
    }
  }
  
  // Session store status
  const sessionType = isDatabaseAvailable() && process.env.DATABASE_URL ? 'database' : 'memory';
  console.log(`🔐 Sesiones: ${sessionType === 'database' ? '✅' : '⚠️'} ${sessionType} store`);
  
  // Start notification cron jobs only if database is available
  if (isDatabaseAvailable()) {
    try {
      // Import notification cron conditionally
      import('./cron/notificationCron.js')
        .then(cronModule => {
          cronModule.notificationCron.start();
          console.log(`⏰ Notification cron jobs: ✅ Iniciados`);
        })
        .catch(error => {
          console.warn(`⏰ Notification cron jobs: ⚠️ Error al cargar:`, error);
        });
    } catch (error) {
      console.warn(`⏰ Notification cron jobs: ⚠️ Error al iniciar:`, error);
    }
  } else {
    console.log(`⏰ Notification cron jobs: ⚠️ Deshabilitados (sin base de datos)`);
  }
  
  // Environment check
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Variables de entorno faltantes: ${missingVars.join(', ')}`);
    console.warn(`   El servidor funciona en modo limitado. Verifica la configuración en Render.`);
  } else {
    console.log(`✅ Todas las variables de entorno configuradas`);
  }
  
  console.log(`🌐 Health check disponible en: http://localhost:${PORT}/api/health`);
});