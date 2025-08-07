import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// In-memory session store (for development only)
const sessions = new Map();

// Simulate users table (replace with actual database later)
const users = [
  {
    id: 1,
    name: "Usuario Demo",
    email: "demo@servicioshogar.com.ar",
    password: "$2b$12$RfpT4xqIbJyW4QHe/yDEfuXlC6m58X6GJ69XyqTdIJBHSmE03EoYO", // "password123"
    createdAt: new Date(),
    termsAcceptedAt: new Date(),
    privacyPolicyAcceptedAt: new Date(),
    legalDisclaimerAcceptedAt: new Date(),
    dataProcessingConsent: true,
    marketingConsent: false,
  }
];

// Helper function to generate session ID
function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend conectado correctamente', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Create session
    const sessionId = generateSessionId();
    sessions.set(sessionId, { userId: user.id, userEmail: user.email });

    // Set cookie
    res.cookie('sessionId', sessionId, { 
      httpOnly: true, 
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        userType: 'customer'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/user', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const user = users.find(u => u.id === session.userId);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      userType: 'customer'
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.clearCookie('sessionId');
  res.json({ message: 'Sesión cerrada exitosamente' });
});

// User registration endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      termsAccepted,
      privacyAccepted,
      legalDisclaimerAccepted,
      dataProcessingConsent,
      marketingConsent
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Email no válido' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    if (!termsAccepted || !privacyAccepted || !legalDisclaimerAccepted || !dataProcessingConsent) {
      return res.status(400).json({ error: 'Debe aceptar todos los términos legales obligatorios' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Ya existe un usuario con este email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      legalDisclaimerAcceptedAt: new Date(),
      dataProcessingConsent,
      marketingConsent: marketingConsent || false,
    };

    users.push(newUser);

    console.log('New user registered:', {
      userId: newUser.id,
      email: newUser.email,
      acceptedAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        termsAcceptedAt: newUser.termsAcceptedAt,
        privacyPolicyAcceptedAt: newUser.privacyPolicyAcceptedAt,
        legalDisclaimerAcceptedAt: newUser.legalDisclaimerAcceptedAt,
        dataProcessingConsent: newUser.dataProcessingConsent,
        marketingConsent: newUser.marketingConsent
      }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Legal compliance endpoints
app.get('/api/users/legal-data/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.find(u => u.id === parseInt(userId));
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Datos personales y consentimientos según Ley 25.326',
      personalData: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        termsAcceptedAt: user.termsAcceptedAt,
        privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt,
        legalDisclaimerAcceptedAt: user.legalDisclaimerAcceptedAt,
        dataProcessingConsent: user.dataProcessingConsent,
        marketingConsent: user.marketingConsent
      },
      legalRights: {
        access: 'Derecho de acceso a datos personales',
        rectification: 'Derecho de rectificación de datos erróneos',
        cancellation: 'Derecho de supresión/cancelación de datos',
        opposition: 'Derecho de oposición al tratamiento'
      },
      contact: 'privacidad@servicioshogar.com.ar'
    });

  } catch (error) {
    console.error('Error al obtener datos legales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/users/marketing-consent/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { marketingConsent } = req.body;
    
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.marketingConsent = marketingConsent;

    console.log('Marketing consent updated:', {
      userId,
      newConsent: marketingConsent,
      updatedAt: new Date().toISOString(),
    });

    res.json({ 
      message: `Consentimiento de marketing ${marketingConsent ? 'otorgado' : 'retirado'} exitosamente` 
    });

  } catch (error) {
    console.error('Error al actualizar consentimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 Entorno: development (simple version)`);
  console.log(`👤 Usuario demo: demo@servicioshogar.com.ar / password123`);
});