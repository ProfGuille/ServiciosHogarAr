import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

// Import route modules for search functionality
import searchRoutes from './routes/search.js';
import searchSuggestionsRoutes from './routes/search-suggestions.js';
import categoriesRoutes from './routes/categories.js';

const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// In-memory session store (for development only)
const sessions = new Map();

// Simulate users table (replace with actual database later)
const users = [
  {
    id: 1,
    name: "Usuario Demo",
    email: "demo@servicioshogar.com.ar",
    password: "$2b$12$RfpT4xqIbJyW4QHe/yDEfuXlC6m58X6GJ69XyqTdIJBHSmE03EoYO", // "password123"
    userType: "customer",
    createdAt: new Date(),
    termsAcceptedAt: new Date(),
    privacyPolicyAcceptedAt: new Date(),
    legalDisclaimerAcceptedAt: new Date(),
    dataProcessingConsent: true,
    marketingConsent: false,
  }
];

// Provider accounts with credit management
const providers = [
  {
    id: 1,
    name: "Plomero Profesional",
    email: "proveedor@servicioshogar.com.ar",
    password: "$2b$12$RfpT4xqIbJyW4QHe/yDEfuXlC6m58X6GJ69XyqTdIJBHSmE03EoYO", // "password123"
    userType: "provider",
    businessName: "Servicios de Plomería Buenos Aires",
    city: "Buenos Aires",
    serviceCategories: [1], // Plomería
    credits: 50,
    isVerified: true,
    phone: "+54 11 1234-5678",
    averageRating: 4.8,
    totalReviews: 25,
    createdAt: new Date(),
    termsAcceptedAt: new Date(),
    privacyPolicyAcceptedAt: new Date(),
    legalDisclaimerAcceptedAt: new Date(),
    dataProcessingConsent: true,
    marketingConsent: false,
  }
];

// Credit transactions for audit
const creditTransactions: any[] = [];

// Leads purchased by providers (provider has paid to access client contact)
const purchasedLeads: any[] = [];

// Helper function to generate session ID
function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

// Root endpoint - welcome message for API
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend conectado correctamente', timestamp: new Date().toISOString() });
});

// Mount search and category routes for core functionality
app.use('/api/search', searchRoutes);
app.use('/api/search-suggestions', searchSuggestionsRoutes);
app.use('/api/categories', categoriesRoutes);

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Find user in customers first
    let user: any = users.find(u => u.email === email);
    let userType = 'customer';
    
    // If not found in customers, check providers
    if (!user) {
      user = providers.find(p => p.email === email);
      userType = 'provider';
    }

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
    sessions.set(sessionId, { 
      userId: user.id, 
      userEmail: user.email, 
      userType 
    });

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
        userType,
        createdAt: user.createdAt,
        ...(userType === 'provider' && user.businessName && {
          businessName: user.businessName,
          city: user.city,
          credits: user.credits,
          isVerified: user.isVerified,
          serviceCategories: (user as any).serviceCategories
        })
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

    // Find user based on type stored in session
    let user: any;
    if (session.userType === 'provider') {
      user = providers.find(p => p.id === session.userId);
    } else {
      user = users.find(u => u.id === session.userId);
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: session.userType,
      createdAt: user.createdAt,
      ...(session.userType === 'provider' && user.businessName && {
        businessName: user.businessName,
        city: user.city,
        credits: user.credits,
        isVerified: user.isVerified,
        serviceCategories: (user as any).serviceCategories
      })
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
      userType: "customer" as const,
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

// Provider registration endpoint
app.post('/api/auth/register-provider', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      city,
      phone,
      serviceCategories,
      termsAccepted,
      privacyAccepted,
      legalDisclaimerAccepted,
      dataProcessingConsent,
      marketingConsent
    } = req.body;

    // Validation
    if (!name || !email || !password || !businessName || !city || !phone || !serviceCategories?.length) {
      return res.status(400).json({ 
        error: 'Nombre, email, contraseña, nombre del negocio, ciudad, teléfono y categorías de servicio son obligatorios' 
      });
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

    // Check if provider already exists
    if (providers.find(p => p.email === email) || users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Ya existe un usuario con este email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create provider with initial 10 credits
    const newProvider = {
      id: providers.length + 1,
      name,
      email,
      password: hashedPassword,
      userType: "provider",
      businessName,
      city,
      phone,
      serviceCategories: serviceCategories.map((id: string) => Number(id)),
      credits: 10, // Initial free credits
      isVerified: false, // Needs admin verification
      averageRating: 0, // New provider starts with 0 rating
      totalReviews: 0, // New provider starts with 0 reviews
      createdAt: new Date(),
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      legalDisclaimerAcceptedAt: new Date(),
      dataProcessingConsent,
      marketingConsent: marketingConsent || false,
    };

    providers.push(newProvider);

    // Log initial credit transaction
    creditTransactions.push({
      id: creditTransactions.length + 1,
      providerId: newProvider.id,
      type: 'welcome_bonus',
      credits: 10,
      description: 'Créditos de bienvenida',
      createdAt: new Date()
    });

    console.log('New provider registered:', {
      providerId: newProvider.id,
      email: newProvider.email,
      businessName: newProvider.businessName,
      city: newProvider.city,
      serviceCategories: newProvider.serviceCategories,
      acceptedAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Proveedor registrado exitosamente',
      provider: {
        id: newProvider.id,
        name: newProvider.name,
        email: newProvider.email,
        businessName: newProvider.businessName,
        city: newProvider.city,
        serviceCategories: newProvider.serviceCategories,
        credits: newProvider.credits,
        isVerified: newProvider.isVerified,
        createdAt: newProvider.createdAt,
        termsAcceptedAt: newProvider.termsAcceptedAt,
        privacyPolicyAcceptedAt: newProvider.privacyPolicyAcceptedAt,
        legalDisclaimerAcceptedAt: newProvider.legalDisclaimerAcceptedAt,
        dataProcessingConsent: newProvider.dataProcessingConsent,
        marketingConsent: newProvider.marketingConsent
      }
    });

  } catch (error) {
    console.error('Error al registrar proveedor:', error);
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
      estimatedBudget: estimatedBudget ? Number(estimatedBudget) : 0,
      isUrgent: Boolean(isUrgent),
      createdAt: new Date(),
      preferredDate: preferredDate ? new Date(preferredDate) : new Date(),
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

// Provider credit system endpoints
app.get('/api/provider/available-requests', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session || session.userType !== 'provider') {
      return res.status(401).json({ error: 'Acceso solo para proveedores' });
    }

    const provider = providers.find(p => p.id === session.userId);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Filter requests by provider's service categories and exclude already purchased
    const availableRequests = serviceRequests
      .filter(request => 
        provider.serviceCategories.includes(request.categoryId) &&
        request.status === 'pending' &&
        !purchasedLeads.some(lead => lead.providerId === provider.id && lead.requestId === request.id)
      )
      .map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        categoryId: request.categoryId,
        city: request.city,
        estimatedBudget: request.estimatedBudget,
        isUrgent: request.isUrgent,
        createdAt: request.createdAt,
        preferredDate: request.preferredDate,
        creditCost: 5 // Cost in credits to access this lead
      }));

    res.json(availableRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/provider/purchase-lead/:requestId', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session || session.userType !== 'provider') {
      return res.status(401).json({ error: 'Acceso solo para proveedores' });
    }

    const provider = providers.find(p => p.id === session.userId);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const requestId = Number(req.params.requestId);
    const serviceRequest = serviceRequests.find(r => r.id === requestId);
    
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Check if provider already purchased this lead
    const alreadyPurchased = purchasedLeads.some(
      lead => lead.providerId === provider.id && lead.requestId === requestId
    );

    if (alreadyPurchased) {
      return res.status(400).json({ error: 'Ya has comprado acceso a esta solicitud' });
    }

    const creditCost = 5;
    
    if (provider.credits < creditCost) {
      return res.status(400).json({ 
        error: 'Créditos insuficientes',
        required: creditCost,
        available: provider.credits
      });
    }

    // Deduct credits
    provider.credits -= creditCost;

    // Record purchase
    const purchase = {
      id: purchasedLeads.length + 1,
      providerId: provider.id,
      requestId: requestId,
      creditCost: creditCost,
      purchasedAt: new Date()
    };
    purchasedLeads.push(purchase);

    // Log credit transaction
    creditTransactions.push({
      id: creditTransactions.length + 1,
      providerId: provider.id,
      type: 'lead_purchase',
      credits: -creditCost,
      description: `Compra de contacto: ${serviceRequest.title}`,
      createdAt: new Date()
    });

    // Get client contact information
    const client = users.find(u => u.id === serviceRequest.userId);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({
      message: 'Contacto comprado exitosamente',
      purchase,
      clientContact: {
        name: client.name,
        email: client.email,
        // Note: In production, phone would come from client profile
        phone: "+54 11 xxxx-xxxx" // Placeholder
      },
      serviceRequest: {
        id: serviceRequest.id,
        title: serviceRequest.title,
        description: serviceRequest.description,
        city: serviceRequest.city,
        estimatedBudget: serviceRequest.estimatedBudget,
        isUrgent: serviceRequest.isUrgent,
        preferredDate: serviceRequest.preferredDate
      },
      remainingCredits: provider.credits
    });

  } catch (error) {
    console.error('Error al comprar contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/provider/my-purchases', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session || session.userType !== 'provider') {
      return res.status(401).json({ error: 'Acceso solo para proveedores' });
    }

    const provider = providers.find(p => p.id === session.userId);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Get provider's purchased leads with full details
    const myPurchases = purchasedLeads
      .filter(purchase => purchase.providerId === provider.id)
      .map(purchase => {
        const serviceRequest = serviceRequests.find(r => r.id === purchase.requestId);
        if (!serviceRequest) return null;
        
        const client = users.find(u => u.id === serviceRequest.userId);
        if (!client) return null;
        
        return {
          ...purchase,
          serviceRequest: {
            id: serviceRequest.id,
            title: serviceRequest.title,
            description: serviceRequest.description,
            city: serviceRequest.city,
            estimatedBudget: serviceRequest.estimatedBudget,
            isUrgent: serviceRequest.isUrgent,
            preferredDate: serviceRequest.preferredDate,
            status: serviceRequest.status
          },
          clientContact: {
            name: client.name,
            email: client.email,
            phone: "+54 11 xxxx-xxxx" // Placeholder
          }
        };
      })
      .filter(purchase => purchase !== null);

    res.json(myPurchases);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/provider/credit-history', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const session = sessions.get(sessionId);
    if (!session || session.userType !== 'provider') {
      return res.status(401).json({ error: 'Acceso solo para proveedores' });
    }

    const provider = providers.find(p => p.id === session.userId);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const history = creditTransactions
      .filter(transaction => transaction.providerId === provider.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      currentCredits: provider.credits,
      transactions: history
    });
  } catch (error) {
    console.error('Error al obtener historial de créditos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================
// AI MATCHING SYSTEM - Post MVP 3 Feature
// ============================================

/**
 * POST /api/ai/find-matches
 * Smart Provider-Client Matching Algorithm
 */
app.post('/api/ai/find-matches', (req, res) => {
  try {
    const { 
      categoryId, 
      city, 
      latitude, 
      longitude, 
      estimatedBudget, 
      isUrgent = false,
      maxResults = 5 
    } = req.body;

    if (!categoryId || !city) {
      return res.status(400).json({ 
        error: 'Category ID and city are required' 
      });
    }

    // Filter providers by category and availability
    const eligibleProviders = providers.filter(provider => 
      provider.serviceCategories.includes(parseInt(categoryId)) && 
      provider.credits >= 1 && 
      provider.isVerified
    );

    // Calculate AI match scores
    const matches = eligibleProviders.map(provider => {
      const matchScore = calculateAIMatchScore(provider, {
        categoryId: parseInt(categoryId),
        city,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
        isUrgent: Boolean(isUrgent)
      });
      
      return {
        providerId: provider.id,
        provider: {
          id: provider.id,
          businessName: provider.businessName,
          city: provider.city,
          phone: provider.phone,
          isVerified: provider.isVerified,
          averageRating: provider.averageRating || 4.5,
          completedJobs: provider.totalReviews || 0
        },
        matchScore: matchScore.totalScore,
        distance: matchScore.distance,
        estimatedResponseTime: matchScore.estimatedResponseTime,
        recommendationReason: matchScore.recommendationReason,
        breakdown: matchScore.breakdown
      };
    });

    // Sort by match score and limit results
    const sortedMatches = matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(maxResults));

    // Get category info
    const category = categories.find(cat => cat.id === parseInt(categoryId));

    res.json({
      success: true,
      data: {
        requestInfo: {
          categoryId: parseInt(categoryId),
          categoryName: category?.name || 'Unknown',
          city,
          isUrgent,
          totalProviders: providers.length,
          matchingProviders: sortedMatches.length
        },
        matches: sortedMatches
      }
    });

  } catch (error) {
    console.error('Error in AI matching:', error);
    res.status(500).json({ 
      error: 'Error finding matches',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai/match-stats
 * Get AI matching system statistics
 */
app.get('/api/ai/match-stats', (req, res) => {
  try {
    const totalProviders = providers.length;
    const verifiedProviders = providers.filter(p => p.isVerified).length;
    const activeProviders = providers.filter(p => p.isVerified && p.credits >= 1).length;

    res.json({
      success: true,
      data: {
        totalProviders,
        verifiedProviders,
        activeProviders,
        matchingAlgorithm: {
          version: "1.0",
          description: "Smart AI-powered provider-client matching",
          factors: [
            { name: "Category Match", weight: "25%" },
            { name: "Location", weight: "20%" },
            { name: "Quality Score", weight: "20%" },
            { name: "Availability", weight: "15%" },
            { name: "Response Time", weight: "10%" },
            { name: "Credits", weight: "10%" }
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error getting match stats:', error);
    res.status(500).json({ 
      error: 'Error getting statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * AI Matching Score Calculation Function
 * Intelligent algorithm that scores provider-client compatibility
 */
function calculateAIMatchScore(provider: any, request: any) {
  const breakdown = {
    categoryMatch: 0,
    locationScore: 0,
    qualityScore: 0,
    availabilityScore: 0,
    responseScore: 0,
    creditsScore: 0
  };

  // Category Match (25% weight)
  if (provider.serviceCategories.includes(request.categoryId)) {
    breakdown.categoryMatch = 100;
  }

  // Location Score (20% weight)
  if (request.city && provider.city) {
    if (request.city.toLowerCase() === provider.city.toLowerCase()) {
      breakdown.locationScore = 90;
    } else {
      breakdown.locationScore = 50; // Different city
    }
  } else {
    breakdown.locationScore = 70; // Default
  }

  // Quality Score (20% weight)
  let qualityScore = 0;
  if (provider.isVerified) qualityScore += 30;
  
  const rating = provider.averageRating || 4.5;
  qualityScore += (rating / 5) * 50;
  
  const jobs = provider.totalReviews || 0;
  if (jobs >= 50) qualityScore += 20;
  else if (jobs >= 20) qualityScore += 15;
  else if (jobs >= 5) qualityScore += 10;
  else qualityScore += 5;
  
  breakdown.qualityScore = Math.min(qualityScore, 100);

  // Availability Score (15% weight)
  breakdown.availabilityScore = request.isUrgent ? 70 : 80; // Assume generally available

  // Response Score (10% weight)
  breakdown.responseScore = 75; // Default good response time

  // Credits Score (10% weight)
  if (provider.credits >= 20) breakdown.creditsScore = 100;
  else if (provider.credits >= 10) breakdown.creditsScore = 80;
  else if (provider.credits >= 5) breakdown.creditsScore = 60;
  else breakdown.creditsScore = 40;

  // Calculate weighted total score
  const totalScore = 
    breakdown.categoryMatch * 0.25 +
    breakdown.locationScore * 0.20 +
    breakdown.qualityScore * 0.20 +
    breakdown.availabilityScore * 0.15 +
    breakdown.responseScore * 0.10 +
    breakdown.creditsScore * 0.10;

  // Generate recommendation reason
  const reasons = [];
  if (breakdown.qualityScore >= 80) reasons.push("⭐ Excelente calificación");
  if (breakdown.locationScore >= 80) reasons.push("📍 Muy cerca de ti");
  if (breakdown.responseScore >= 80) reasons.push("⚡ Respuesta rápida");
  if (provider.isVerified) reasons.push("🛡️ Profesional verificado");
  if (reasons.length === 0) reasons.push("🔧 Especialista en el servicio");

  return {
    totalScore: Math.round(totalScore),
    breakdown,
    distance: 0, // Would calculate with real coordinates
    estimatedResponseTime: "En 4 horas",
    recommendationReason: reasons.slice(0, 2).join(" • ")
  };
}

// ============================================
// END AI MATCHING SYSTEM
// ============================================

// Serve frontend static files
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build files
app.use(express.static(path.join(__dirname, '../frontend-dist')));

// Handle React Router (serve index.html for all non-API routes)
app.get('*', (req, res) => {
  // Don't handle API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  
  res.sendFile(path.join(__dirname, '../frontend-dist/index.html'));
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 Entorno: development (simple version)`);
  console.log(`👤 Usuario demo: demo@servicioshogar.com.ar / password123`);
});