import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { users } from "../shared/schema/users.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerCredits } from "../shared/schema/providerCredits.js";
import { eq } from "drizzle-orm";
import { generateJWTToken, requireAuth } from "../middleware/auth.js";

const router = Router();

// -----------------------------
// REGISTER
// -----------------------------
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = "customer" } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Nombre inválido" });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [created] = await db.insert(users).values({
      name,
      email,
      password: hashed,
      role,
      createdAt: new Date(),
      isActive: true,
    }).returning();

    const token = generateJWTToken(created.id, created.email, created.role);

    res.json({
      message: "Registro exitoso",
      user: { id: created.id, name: created.name, email: created.email, role: created.role },
      token,
    });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// REGISTER PROVIDER
// -----------------------------
router.post("/register-provider", async (req: Request, res: Response) => {
  try {
    const { name, email, password, businessName, city, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    
    const [user] = await db.insert(users).values({
      id: userId,
      email,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      password: hashedPassword,
      userType: 'provider',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    const [provider] = await db.insert(serviceProviders).values({
      userId: user.id,
      businessName,
      city,
      phoneNumber: phone,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    await db.insert(providerCredits).values({
      providerId: provider.id,
      currentCredits: 10
    });
    
    res.status(201).json({ 
      message: 'Proveedor registrado',
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    console.error("Error register-provider:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// LOGIN
// -----------------------------
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });

    const userResult = await db.select().from(users).where(eq(users.email, email));

    if (userResult.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = userResult[0];

    if (!user.isActive)
      return res.status(403).json({ error: "Usuario desactivado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const token = generateJWTToken(user.id, user.email, user.role);

    res.json({
      message: "Inicio de sesión exitoso",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// GET CURRENT USER
// -----------------------------
router.get("/me", requireAuth, async (req: any, res: Response) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    if (user.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const u = user[0];

    res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// REFRESH TOKEN
// -----------------------------
router.post("/refresh", requireAuth, (req: any, res: Response) => {
  const token = generateJWTToken(req.user.id, req.user.email, req.user.role);
  res.json({ token });
});

// -----------------------------
// LOGOUT (JWT)
// -----------------------------
router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Logout exitoso (JWT invalidado en cliente)" });
});

export default router;
