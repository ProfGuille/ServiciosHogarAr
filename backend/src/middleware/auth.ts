import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { users } from "../shared/schema/users.js";
import { eq } from "drizzle-orm";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name?: string;
        role: "customer" | "provider" | "admin";
        providerId?: number;
        customerId?: number;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// -----------------------------
// AUTH MIDDLEWARE PRINCIPAL
// -----------------------------
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Validar expiración manualmente
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: "Token expirado" });
    }

    // Buscar usuario
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userRow.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = userRow[0];

    // Validar que el usuario esté activo
    if (user.isActive === false) {
      return res.status(403).json({ error: "Usuario desactivado" });
    }

    // Construir req.user
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: decoded.role ?? "customer",
      providerId: user.providerId ?? undefined,
      customerId: user.customerId ?? undefined,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
}

// -----------------------------
// OPTIONAL AUTH
// -----------------------------
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userRow.length > 0) {
      const user = userRow[0];
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: decoded.role ?? "customer",
        providerId: user.providerId ?? undefined,
        customerId: user.customerId ?? undefined,
      };
    }

    next();
  } catch {
    next(); // Silent fail
  }
}

// -----------------------------
// ROLE-BASED AUTH
// -----------------------------
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    next();
  };
}

// -----------------------------
// JWT GENERATOR
// -----------------------------
export function generateJWTToken(
  userId: number,
  email: string,
  role: string = "customer"
): string {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

