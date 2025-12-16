// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { users } from '../shared/schema/index.js';
import { eq } from 'drizzle-orm';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name?: string;
        role?: string;
      };
    }
  }
}

// Session-based auth (existing)
export function requireAuth(req: any, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    // Add user info to request for convenience
    req.user = {
      id: req.session.userId,
      email: req.session.userEmail
    };
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Debe iniciar sesión.' });
}

// JWT-based auth (for WebSocket and API)
export async function requireJWTAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user from database
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Add user to request
    req.user = {
      id: userResult[0].id,
      email: userResult[0].email,
      name: userResult[0].name || undefined,
      role: decoded.role || 'client'
    };

    next();
  } catch (error) {
    console.error('JWT Auth error:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Generate JWT token
export function generateJWTToken(userId: number, email: string, role: string = 'client'): string {
  return jwt.sign(
    { 
      userId, 
      email, 
      role,
      iat: Date.now() / 1000
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
}

// Optional auth - doesn't fail if no token
export async function optionalJWTAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (userResult.length > 0) {
        req.user = {
          id: userResult[0].id,
          email: userResult[0].email,
          name: userResult[0].name || undefined,
          role: decoded.role || 'client'
        };
      }
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
}