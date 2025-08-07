const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

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
    createdAt: new Date(),
    termsAcceptedAt: new Date(),
    privacyPolicyAcceptedAt: new Date(),
    legalDisclaimerAcceptedAt: new Date(),
    dataProcessingConsent: true,
    marketingConsent: false,
  }
];

// Credit transactions for audit
const creditTransactions = [];

// Leads purchased by providers (provider has paid to access client contact)
const purchasedLeads = [];

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

// Categories data
const categories = [
  { id: 1, name: "Plomería" },
  { id: 2, name: "Electricidad" },
  { id: 3, name: "Carpintería" },
  { id: 4, name: "Pintura" },
  { id: 5, name: "Limpieza" },
  { id: 6, name: "Jardinería" },
  { id: 7, name: "Techado" },
  { id: 8, name: "Aire Acondicionado" },
  { id: 9, name: "Cerrajería" },
  { id: 10, name: "Albañilería" }
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
    status: "pending",
    city: "Buenos Aires",
    estimatedBudget: 8000,
    isUrgent: false,
    createdAt: new Date("2024-01-16"),
    preferredDate: new Date("2024-01-20")
  }
];

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Find user in customers first
    let user = users.find(u => u.email === email);
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
        ...(userType === 'provider' && {
          businessName: user.businessName,
          city: user.city,
          credits: user.credits,
          isVerified: user.isVerified,
          serviceCategories: user.serviceCategories
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
    let user;
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
      ...(session.userType === 'provider' && {
        businessName: user.businessName,
        city: user.city,
        credits: user.credits,
        isVerified: user.isVerified,
        serviceCategories: user.serviceCategories
      })
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
        const client = users.find(u => u.id === serviceRequest.userId);
        
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
      });

    res.json(myPurchases);
  } catch (error) {
    console.error('Error al obtener compras:', error);
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
  console.log(`🔧 Proveedor demo: proveedor@servicioshogar.com.ar / password123`);
});