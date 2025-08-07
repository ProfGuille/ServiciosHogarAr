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

// Mock data for categories 
const categories = [
  { id: 1, name: "Plomería" },
  { id: 2, name: "Electricidad" },
  { id: 3, name: "Pintura" },
  { id: 4, name: "Limpieza" },
  { id: 5, name: "Carpintería" },
  { id: 6, name: "Gasista" },
  { id: 7, name: "Albañilería" },
  { id: 8, name: "Aire Acondicionado" },
  { id: 9, name: "Jardinería" },
  { id: 10, name: "Cerrajería" }
];

// Mock data for service requests
const serviceRequests = [
  {
    id: 1,
    title: "Reparación de canilla que gotea",
    description: "Tengo una canilla de la cocina que gotea constantemente. Necesito que venga un plomero a repararla lo antes posible.",
    categoryId: 1,
    userId: 1,
    status: "pending",
    city: "Buenos Aires",
    estimatedBudget: 5000,
    isUrgent: true,
    createdAt: new Date("2024-01-15"),
    preferredDate: new Date("2024-01-17")
  },
  {
    id: 2,
    title: "Instalación de ventilador de techo",
    description: "Necesito instalar un ventilador de techo en el dormitorio principal. Ya tengo el ventilador, solo necesito la instalación.",
    categoryId: 2,
    userId: 1,
    status: "quoted",
    city: "Córdoba",
    estimatedBudget: 8000,
    isUrgent: false,
    createdAt: new Date("2024-01-10"),
    preferredDate: new Date("2024-01-20")
  }
];

// Mock data for providers
const providers = [
  {
    id: 1,
    businessName: "Plomería Martinez",
    city: "Buenos Aires",
    rating: 4.8,
    totalReviews: 127,
    isVerified: true,
    profileImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: 2,
    businessName: "Electricista Pro",
    city: "Buenos Aires", 
    rating: 4.9,
    totalReviews: 89,
    isVerified: true,
    profileImageUrl: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: 3,
    businessName: "Pintores Expertos",
    city: "Córdoba",
    rating: 4.7,
    totalReviews: 156,
    isVerified: true,
    profileImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  }
];

// Categories endpoint
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Service requests endpoints
app.get('/api/requests', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const { limit = 10 } = req.query;
    const userRequests = serviceRequests
      .filter(request => request.userId === session.userId)
      .slice(0, Number(limit));

    res.json(userRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/requests', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const {
      title,
      description,
      categoryId,
      city,
      estimatedBudget,
      isUrgent,
      preferredDate
    } = req.body;

    if (!title || !description || !categoryId || !city) {
      return res.status(400).json({ 
        error: 'Título, descripción, categoría y ciudad son obligatorios' 
      });
    }

    const newRequest = {
      id: Math.max(...serviceRequests.map(r => r.id), 0) + 1,
      title,
      description,
      categoryId: Number(categoryId),
      userId: session.userId,
      status: "pending",
      city,
      estimatedBudget: estimatedBudget ? Number(estimatedBudget) : null,
      isUrgent: Boolean(isUrgent),
      createdAt: new Date(),
      preferredDate: preferredDate ? new Date(preferredDate) : null
    };

    serviceRequests.push(newRequest);

    res.status(201).json({
      message: 'Solicitud creada exitosamente',
      request: newRequest
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Providers endpoint
app.get('/api/providers', (req, res) => {
  try {
    const { limit = 10, isVerified } = req.query;
    
    let filteredProviders = providers;
    if (isVerified !== undefined) {
      filteredProviders = providers.filter(p => p.isVerified === (isVerified === 'true'));
    }

    const result = filteredProviders.slice(0, Number(limit));
    res.json(result);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
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