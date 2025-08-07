import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { users } from '../shared/schema/index.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const router = Router();

// Middleware to check authentication
export function requireAuth(req: any, res: Response, next: Function) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Debe iniciar sesión.' });
}

// Get current user (for useAuth hook)
router.get('/user', async (req: any, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      termsAcceptedAt: users.termsAcceptedAt,
      privacyPolicyAcceptedAt: users.privacyPolicyAcceptedAt,
      legalDisclaimerAcceptedAt: users.legalDisclaimerAcceptedAt,
      dataProcessingConsent: users.dataProcessingConsent,
      marketingConsent: users.marketingConsent
    }).from(users).where(eq(users.id, req.session.userId));

    if (user.length === 0) {
      // Clear invalid session
      req.session.destroy();
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      ...user[0],
      userType: 'customer' // Default role, can be enhanced later
    });

  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login endpoint
router.post('/login', async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son obligatorios' 
      });
    }

    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, email));
    
    if (userResult.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const user = userResult[0];

    // Check password
    if (!user.password) {
      return res.status(401).json({ 
        error: 'Cuenta no configurada correctamente' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    // Log successful login
    console.log('Login exitoso:', {
      userId: user.id,
      email: user.email,
      loginAt: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        userType: 'customer' // Default role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Logout endpoint
router.post('/logout', (req: any, res: Response) => {
  if (req.session) {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).json({ error: 'Error al cerrar sesión' });
      }
      
      res.clearCookie('servicioshogar.sid');
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  } else {
    res.json({ message: 'No hay sesión activa' });
  }
});

// Check if user is authenticated (utility endpoint)
router.get('/check', (req: any, res: Response) => {
  const isAuthenticated = !!(req.session && req.session.userId);
  res.json({ 
    isAuthenticated,
    userId: isAuthenticated ? req.session.userId : null
  });
});

export default router;