// Cargar variables de entorno (local y producción)
import 'dotenv/config';
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes/index.js";
import { db, isDatabaseAvailable, runMigrations } from "./db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "./types/session.js"; // Import session type extensions

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Verificación de variables críticas
const requiredEnv = [
  'SESSION_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'DATABASE_URL'
];

const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.warn(`⚠️  Variables de entorno faltantes: ${missing.join(', ')}`);
  console.warn('⏰ El servidor funcionará en modo limitado.');
}

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

// Frontend serving disabled - frontend is deployed on Hostinger
// The backend now serves only as API
/*
// Frontend serving with multiple fallback paths optimized for Render deployment
const possibleFrontendPaths = [
  // Primary path for Render deployment (relative to compiled backend)
  path.resolve(__dirname, '../frontend-dist'),
  // Backup path for Render deployment (in case __dirname is different)
  path.resolve(process.cwd(), 'frontend-dist'),
  // Additional Render-specific paths based on observed structure
  path.resolve(__dirname, 'frontend-dist'),
  // Render environment paths (working from /opt/render/project/src/backend)
  path.resolve(__dirname, '../../frontend-dist'),
  path.resolve(process.cwd(), '../frontend-dist'),
  path.resolve(__dirname, '../../../frontend-dist'),
  // Development paths
  path.resolve(process.cwd(), 'backend/frontend-dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist')
];

let frontendPath: string | null = null;
let frontendDiagnostic: any = {};

console.log('📁 Environment diagnostic:');
console.log('  Working directory:', process.cwd());
console.log('  __dirname:', __dirname);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  __filename:', __filename);

// Find the first valid frontend path
for (const testPath of possibleFrontendPaths) {
  const pathExists = fs.existsSync(testPath);
  const indexExists = pathExists && fs.existsSync(path.join(testPath, 'index.html'));
  
  console.log(`🔍 Testing path: ${testPath}`);
  console.log(`  - Directory exists: ${pathExists}`);
  if (pathExists) {
    try {
      const files = fs.readdirSync(testPath);
      console.log(`  - Files count: ${files.length}`);
      console.log(`  - Files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
    } catch (err) {
      console.log(`  - Cannot read directory: ${err}`);
    }
  }
  console.log(`  - index.html exists: ${indexExists}`);
  
  if (pathExists && indexExists) {
    frontendPath = testPath;
    console.log('✅ Frontend found at:', frontendPath);
    break;
  } else {
    console.log('❌ Frontend not found at:', testPath);
  }
}

if (!frontendPath) {
  console.warn('⚠️  Frontend dist folder not found at any of the tested paths');
  console.warn('   Static files will not be served. This is normal during development or if frontend build failed.');
  
  // Additional debugging for production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Production debugging - listing current directory structure:');
    try {
      console.log('Current directory contents:', fs.readdirSync(process.cwd()));
      console.log('Parent directory contents:', fs.readdirSync(path.dirname(process.cwd())));
      if (fs.existsSync(path.join(__dirname, '..'))) {
        console.log('Backend parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));
      }
    } catch (err) {
      console.log('Cannot read directories for debugging:', err);
    }
  }
}

// Create comprehensive diagnostic information
frontendDiagnostic = {
  searchedPaths: possibleFrontendPaths.map(p => ({
    path: p,
    exists: fs.existsSync(p),
    hasIndex: fs.existsSync(path.join(p, 'index.html')),
    fileCount: fs.existsSync(p) ? (fs.readdirSync(p).length || 0) : 0
  })),
  selectedPath: frontendPath,
  workingDir: process.cwd(),
  __dirname,
  nodeEnv: process.env.NODE_ENV,
  deploymentSummary: null
};

// Try to load deployment summary and diagnostic if they exist
const summaryPath = path.resolve(process.cwd(), 'deployment-summary.json');
const diagnosticPath = path.resolve(__dirname, '../deployment-diagnostic.json');

if (fs.existsSync(summaryPath)) {
  try {
    const summaryContent = fs.readFileSync(summaryPath, 'utf8');
    frontendDiagnostic.deploymentSummary = JSON.parse(summaryContent);
    console.log('📋 Deployment summary loaded from:', summaryPath);
  } catch (error) {
    console.warn('⚠️ Failed to load deployment summary:', error);
  }
}

if (fs.existsSync(diagnosticPath)) {
  try {
    const diagnosticContent = fs.readFileSync(diagnosticPath, 'utf8');
    frontendDiagnostic.buildDiagnostic = JSON.parse(diagnosticContent);
    console.log('📋 Build diagnostic loaded from:', diagnosticPath);
  } catch (error) {
    console.warn('⚠️ Failed to load build diagnostic:', error);
  }
}

console.log('📊 Frontend diagnostic info:', JSON.stringify(frontendDiagnostic, null, 2));

// Check if frontend is available and serve it
if (frontendPath) {
  app.use(express.static(frontendPath));
  const indexPath = path.join(frontendPath, 'index.html');
  console.log('✅ Frontend static files configured successfully');
  console.log(`📄 Frontend served from: ${frontendPath}`);
  
  // List some files for verification
  try {
    const files = fs.readdirSync(frontendPath);
    console.log('📂 Frontend files:', files.slice(0, 10)); // Show first 10 files
  } catch (error) {
    console.warn('⚠️ Could not list frontend files:', error);
  }
} else {
  console.error('❌ No valid frontend path found');
  console.error('📊 Frontend diagnostic information:', frontendDiagnostic);
  
  // Create a comprehensive fallback route for missing frontend
  app.get('/', (req: Request, res: Response) => {
    res.status(503).json({
      error: 'Frontend not available',
      message: 'The frontend application is not built or deployed yet.',
      diagnostic: frontendDiagnostic,
      suggestions: [
        'Check if the build process completed successfully',
        'Verify deployment-summary.json for build details',
        'Run the deployment diagnostic script',
        'Check render deployment logs for build errors'
      ],
      buildCommands: {
        manual: 'cd frontend && npm ci && npm run build && cd ../backend && cp -r ../frontend/dist ./frontend-dist',
        script: './scripts/build-deployment.sh'
      }
    });
  });
}
*/

// Frontend serving configuration
console.log('📁 Configuring frontend serving...');

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

// Frontend serving configuration
const possibleFrontendPaths = [
  // Development paths (when running from repo root)
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  // Production paths (compiled backend)
  path.resolve(__dirname, '../frontend-dist'),
  path.resolve(process.cwd(), 'frontend-dist'),
  // Render deployment paths
  path.resolve(__dirname, 'frontend-dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist')
];

let frontendPath: string | null = null;

console.log('🔍 Searching for frontend build...');
console.log('  Working directory:', process.cwd());
console.log('  Backend __dirname:', __dirname);

// Find the first valid frontend path
for (const testPath of possibleFrontendPaths) {
  const pathExists = fs.existsSync(testPath);
  const indexExists = pathExists && fs.existsSync(path.join(testPath, 'index.html'));
  
  console.log(`  Testing: ${testPath}`);
  console.log(`    Directory exists: ${pathExists}`);
  console.log(`    index.html exists: ${indexExists}`);
  
  if (pathExists && indexExists) {
    frontendPath = testPath;
    console.log('✅ Frontend found at:', frontendPath);
    break;
  }
}

if (frontendPath) {
  // Serve static files from frontend build
  app.use(express.static(frontendPath));
  console.log('✅ Frontend static files served from:', frontendPath);
  
  // List some files for verification
  try {
    const files = fs.readdirSync(frontendPath);
    console.log('📂 Frontend files:', files.slice(0, 5).join(', ') + (files.length > 5 ? '...' : ''));
  } catch (error) {
    console.warn('⚠️ Could not list frontend files:', error);
  }
} else {
  console.warn('⚠️ Frontend build not found in any of the tested paths');
}

// Catch-all handler for non-API routes
app.get('*', (req: Request, res: Response) => {
  if (!frontendPath) {
    return res.status(503).json({ 
      error: 'Frontend not available',
      message: 'The frontend application is not built or deployed yet.',
      requestedPath: req.path,
      searchedPaths: possibleFrontendPaths,
      suggestions: [
        'Run: cd frontend && npm run build',
        'Check if frontend/dist/ directory exists',
        'Verify frontend build completed successfully'
      ]
    });
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  
  // Check if index.html exists before trying to serve it
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found at:', indexPath);
    return res.status(503).json({ 
      error: 'Frontend index.html not available', 
      message: 'The frontend application index file is missing.',
      path: indexPath,
      requestedPath: req.path
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
        // Import notification cron conditionally to avoid module loading errors
        const cronModule = await import('./cron/notificationCron.js');
        cronModule.notificationCron.start();
        console.log('✅ Notification cron jobs started successfully');
        console.log(`⏰ Notification cron jobs iniciados`);
      } catch (error: any) {
        console.error('❌ Error starting notification cron jobs:', error);
        console.warn('⏰ Notification cron jobs: ⚠️ Deshabilitados debido a errores');
        
        // Check if error is related to missing dependencies or schema issues
        if (error?.message?.includes('Cannot find module') || 
            error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
          console.warn('   This is likely due to missing dependencies or database schema misalignment.');
          console.warn('   Cron jobs will be retried after the next deployment.');
        }
      }
    } else {
      console.log(`⏰ Notification cron jobs: ⚠️ Deshabilitados (sin base de datos)`);
    }
    
    // Environment check
    const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
    const optionalEnvVars = ['SMTP_HOST', 'SMTP_USER', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'];
    
    const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    
    if (missingRequired.length > 0) {
      console.warn(`⚠️  Variables de entorno faltantes: ${missingRequired.join(', ')}`);
      console.warn(`   El servidor funciona en modo limitado. Verifica la configuración en Render.`);
    } else {
      console.log(`✅ Variables de entorno requeridas configuradas`);
    }
    
    if (missingOptional.length > 0) {
      console.log(`📧 Servicios opcionales no configurados: ${missingOptional.join(', ')}`);
      console.log(`   Email y notificaciones push funcionan en modo limitado.`);
    } else {
      console.log(`✅ Todas las variables de entorno configuradas (funcionalidad completa)`);
    }
    
    console.log(`🌐 Health check disponible en: http://localhost:${PORT}/api/health`);
  });
}

// Initialize the application
initializeApp().catch(error => {
  console.error('❌ Failed to initialize application:', error);
  process.exit(1);
});