import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { users } from "../shared/schema/users.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerCredits } from "../shared/schema/providerCredits.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq, sql } from "drizzle-orm";
import { generateJWTToken, requireAuth } from "../middleware/auth.js";
import { neon } from "@neondatabase/serverless";
const neonSql = neon(process.env.DATABASE_URL!);
import { sendPasswordResetEmail, sendCustomerWelcomeEmail, sendProviderWelcomeEmail } from "../services/resendEmailService.js";

const sqlDirect = neon(process.env.DATABASE_URL!);

const router = Router();

// -----------------------------
// REGISTER
// -----------------------------

// --------------------------
// Helper: registrar referido
// --------------------------
async function processReferral(referralCode: string | undefined, newUserId: string) {
  if (!referralCode) return;
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const codes = (await sql`
      SELECT id, user_id FROM referral_codes
      WHERE code = ${referralCode}
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `) as any[];
    if (!codes.length || codes[0].user_id === newUserId) return;
    const code = codes[0];
    await sql`
      INSERT INTO referrals (referrer_id, referred_id, referral_code_id, status, created_at)
      VALUES (${code.user_id}, ${newUserId}, ${code.id}, 'completed', NOW())
      ON CONFLICT DO NOTHING
    `;
    await sql`
      INSERT INTO referral_stats (user_id, total_referrals, successful_referrals, total_credits_earned, last_referral_at, updated_at)
      VALUES (${code.user_id}, 1, 1, 1, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        total_referrals = referral_stats.total_referrals + 1,
        successful_referrals = referral_stats.successful_referrals + 1,
        total_credits_earned = referral_stats.total_credits_earned + 1,
        last_referral_at = NOW(),
        updated_at = NOW()
    `;
    // +1 crédito al referente si es proveedor
    const referrerProviders = (await sql`
      SELECT id FROM service_providers WHERE user_id = ${code.user_id} LIMIT 1
    `) as any[];
    if (referrerProviders.length > 0) {
      const { providerCreditsService } = await import("../services/providerCreditsService.js");
      await providerCreditsService.addCredits(referrerProviders[0].id, 1);
      console.log(`✅ Referido exitoso: +1 crédito al proveedor ${referrerProviders[0].id}`);
    }
  } catch (e) {
    console.error("Error procesando referido:", e);
  }
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Nombre inválido" });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" });
    }

    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userId = crypto.randomUUID();
    const [created] = await db.insert(users).values({
      id: userId,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      email,
      phone: req.body.phone || null,
      password: hashed,
      userType: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    const token = generateJWTToken(created.id, created.email, created.userType);
    const marketingConsent = req.body.marketingConsent ?? false;
    await neonSql`UPDATE users SET marketing_consent = ${marketingConsent} WHERE id = ${created.id}`;
    await processReferral(req.body.referralCode, created.id);
    sendCustomerWelcomeEmail(created.email, created.firstName);

    res.json({
      message: "Registro exitoso",
      user: { id: created.id, firstName: created.firstName, lastName: created.lastName, email: created.email, userType: created.userType },
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
    
    console.log("=== REGISTER PROVIDER START ===");
    console.log("Input:", { name, email, businessName, city, phone });
    
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    
    console.log("Generated userId:", userId);
    
    // PASO 1: Crear user
    console.log("Insertando user...");
    const [user] = await db.insert(users).values({
      id: userId,
      email,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      profileImageUrl: null,
      password: hashedPassword,
      userType: 'provider',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("User creado:", user.id);
    
    // PASO 2: Crear service_provider
    console.log("Insertando service_provider...");
    const [provider] = await db.insert(serviceProviders).values({
      userId: user.id,
      businessName,
      city,
      phoneNumber: phone,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("Provider creado:", provider.id);
    
    // PASO 3: Crear créditos
    console.log("Insertando provider_credits...");
    await db.insert(providerCredits).values({
      providerId: provider.id,
      currentCredits: 10
    });
    
    // PASO 4: Guardar categorías seleccionadas
    const { serviceCategories } = req.body;
    if (serviceCategories && Array.isArray(serviceCategories) && serviceCategories.length > 0) {
        for (const catId2 of serviceCategories) {
        await db.execute(
          sql`INSERT INTO provider_categories (provider_id, category_id, created_at)
          VALUES (${provider.id}, ${parseInt(catId2)}, NOW())
          ON CONFLICT DO NOTHING`
        );
      }
      console.log("Categorías guardadas:", serviceCategories.length);
    }

    console.log("=== REGISTER PROVIDER SUCCESS ===");
    await processReferral(req.body.referralCode, user.id);
    sendProviderWelcomeEmail(user.email, user.firstName, businessName);
    res.status(201).json({ 
      message: 'Proveedor registrado',
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    console.error("=== REGISTER PROVIDER ERROR ===");
    console.error("Error completo:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.message?.includes("unique") || error.message?.includes("duplicate") || error.code === "23505") {
      return res.status(400).json({ error: "Ya existe una cuenta registrada con ese email" });
    }
    res.status(500).json({ error: "Error al registrar. Verificá que todos los campos sean correctos." });
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
    
    if (!user.password)
      return res.status(401).json({ error: "Credenciales inválidas" });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });
    
    const token = generateJWTToken(user.id, user.email, user.userType);

    let providerId = null;
    if (user.userType === "provider") {
      const provider = await db.select({ id: serviceProviders.id })
        .from(serviceProviders)
        .where(eq(serviceProviders.userId, user.id))
        .limit(1);
      if (provider.length > 0) providerId = provider[0].id;
    }

    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        ...(providerId !== null && { providerId }),
      },
      token,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/me", requireAuth, async (req: any, res: Response) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    if (user.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const u = user[0];

    let providerId = null;
    if (u.userType === "provider") {
      const provider = await db.select({ id: serviceProviders.id })
        .from(serviceProviders)
        .where(eq(serviceProviders.userId, u.id))
        .limit(1);
      if (provider.length > 0) providerId = provider[0].id;
    }

    res.json({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      userType: u.userType,
      createdAt: u.createdAt,
      ...(providerId !== null && { providerId }),
    });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// -----------------------------
// PATCH /profile — editar nombre/apellido
// -----------------------------
router.patch("/profile", requireAuth, async (req: any, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: "Nombre y apellido son requeridos" });
    }
    await db.update(users)
      .set({ firstName: firstName.trim(), lastName: lastName.trim() })
      .where(eq(users.id, req.user.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en PATCH /profile:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// -----------------------------
// PATCH /profile — editar nombre/apellido
// -----------------------------
router.patch("/profile", requireAuth, async (req: any, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: "Nombre y apellido son requeridos" });
    }
    await db.update(users)
      .set({ firstName: firstName.trim(), lastName: lastName.trim() })
      .where(eq(users.id, req.user.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en PATCH /profile:", err);
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


// -----------------------------
// FORGOT PASSWORD
// -----------------------------
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@"))
      return res.status(400).json({ error: "Email inválido" });

    const result = await sqlDirect`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (result.length === 0)
      return res.json({ message: "Si el email existe, recibirás un link en breve." });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await sqlDirect`
      UPDATE users
      SET reset_token = ${token}, reset_token_expires = ${expires}
      WHERE email = ${email}
    `;

    await sendPasswordResetEmail(email, token);

    res.json({ message: "Si el email existe, recibirás un link en breve." });
  } catch (err) {
    console.error("Error en forgot-password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// RESET PASSWORD
// -----------------------------
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token) return res.status(400).json({ error: "Token inválido" });
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const result = await sqlDirect`
      SELECT id, reset_token_expires
      FROM users
      WHERE reset_token = ${token}
      LIMIT 1
    `;

    if (result.length === 0)
      return res.status(400).json({ error: "Token inválido o expirado" });

    const user = result[0];
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date())
      return res.status(400).json({ error: "Token inválido o expirado" });

    const hashed = await bcrypt.hash(password, 10);

    await sqlDirect`
      UPDATE users
      SET password = ${hashed}, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en reset-password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
