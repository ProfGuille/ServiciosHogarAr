import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes/index.js";
import { db, isDatabaseAvailable, runMigrations } from "./db.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "./types/session.js"; // Import session type extensions

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from the frontend dist folder
const frontendPath = path.resolve(__dirname, '../frontend-dist');
console.log('📁 Frontend path resolved to:', frontendPath);
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Provide detailed diagnostic information
const diagnosticInfo = {
  frontendPath,
  exists: fs.existsSync(frontendPath),
  workingDir: process.cwd(),
  __dirname,
  nodeEnv: process.env.NODE_ENV,
  parentDir: path.resolve(__dirname, '..'),
  parentDirExists: fs.existsSync(path.resolve(__dirname, '..')),
  parentDirContents: fs.existsSync(path.resolve(__dirname, '..')) 
    ? fs.readdirSync(path.resolve(__dirname, '..')) 
    : []
};

console.log('📊 Frontend diagnostic info:', JSON.stringify(diagnosticInfo, null, 2));

// Check if frontend dist folder exists before serving
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  const indexExists = fs.existsSync(path.join(frontendPath, 'index.html'));
  console.log('✅ Frontend static files configured successfully');
  console.log(`📄 index.html exists: ${indexExists}`);
  
  if (indexExists) {
    const files = fs.readdirSync(frontendPath);
    console.log('📂 Frontend files:', files.slice(0, 10)); // Show first 10 files
  }
} else {
  console.error('❌ Frontend dist folder not found at:', frontendPath);
  console.error('📊 Diagnostic information:', diagnosticInfo);
  
  // Create a simple fallback route for missing frontend
  app.get('/', (req: Request, res: Response) => {
    res.status(503).json({
      error: 'Frontend not available',
      message: 'The frontend application is not built or deployed yet. Please build the frontend first.',
      path: frontendPath,
      instructions: 'Run: cd frontend && npm install && npm run build',
      diagnostic: diagnosticInfo,
      buildCommand: 'cd frontend && npm ci && npm run build && cd ../backend && cp -r ../frontend/dist ./frontend-dist'
    });
  });
}

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

// API info endpoint - moved from root to /api/info
app.get('/api/info', (req: Request, res: Response) => {
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

// Catch-all handler: send back the frontend's index.html for any non-API routes
// This enables client-side routing
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.resolve(frontendPath, 'index.html');
  
  // Check if index.html exists before trying to serve it
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Error serving index.html: File not found at', indexPath);
    console.error('📊 Frontend diagnostic info:', {
      frontendPath,
      indexPath,
      frontendExists: fs.existsSync(frontendPath),
      frontendContents: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : [],
      requestPath: req.path
    });
    
    return res.status(503).json({ 
      error: 'Frontend not available', 
      message: 'The frontend application is not built yet. Please build the frontend first.',
      path: indexPath,
      frontendPath,
      requestedPath: req.path,
      instructions: 'Run: cd frontend && npm ci && npm run build && cd ../backend && cp -r ../frontend/dist ./frontend-dist',
      diagnostic: {
        frontendPathExists: fs.existsSync(frontendPath),
        indexPathExists: fs.existsSync(indexPath),
        workingDir: process.cwd(),
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).json({ 
        error: 'Error interno del servidor', 
        message: 'No se pudo cargar la aplicación',
        path: indexPath,
        details: err.message
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

// Async initialization function
async function initializeApp() {
  // Run database migrations first if database is available
  if (isDatabaseAvailable()) {
    console.log('🔄 Running database migrations...');
    try {
      const migrationSuccess = await runMigrations();
      if (migrationSuccess) {
        console.log('✅ Database migrations completed successfully');
      } else {
        console.warn('⚠️  Database migrations failed, continuing with existing schema');
      }
    } catch (error) {
      console.error('❌ Error running migrations:', error);
      console.warn('⚠️  Continuing without migrations, some features may not work');
    }
  }
  
  // Start the server
  app.listen(PORT, async () => {
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
    
    // Start notification cron jobs only if database is available and migrations were successful
    if (isDatabaseAvailable()) {
      try {
        console.log('🚀 Starting notification cron jobs...');
        // Import notification cron conditionally
        const cronModule = await import('./cron/notificationCron.js');
        cronModule.notificationCron.start();
        console.log('✅ Notification cron jobs started successfully');
        console.log(`⏰ Notification cron jobs iniciados`);
      } catch (error) {
        console.error('❌ Error starting notification cron jobs:', error);
        console.warn('⏰ Notification cron jobs: ⚠️ Deshabilitados debido a errores');
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
}

// Initialize the application
initializeApp().catch(error => {
  console.error('❌ Failed to initialize application:', error);
  process.exit(1);
});