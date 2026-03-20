import { Router } from "express";
import { db } from "../db.js";
import { users } from "../shared/schema/users.js";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// -----------------------------
// GET CURRENT USER PROFILE
// -----------------------------
router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        marketingConsent: users.marketingConsent,
        dataProcessingConsent: users.dataProcessingConsent,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Error en /users/me:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// UPDATE MARKETING CONSENT
// -----------------------------
router.put("/marketing-consent", requireAuth, async (req: any, res) => {
  try {
    const { marketingConsent } = req.body;

    await db
      .update(users)
      .set({ marketingConsent })
      .where(eq(users.id, req.user.id));

    console.log("Marketing consent updated:", {
      userId: req.user.id,
      newConsent: marketingConsent,
      updatedAt: new Date().toISOString(),
      ipAddress: req.ip,
    });

    res.json({
      message: `Consentimiento de marketing ${
        marketingConsent ? "otorgado" : "retirado"
      } exitosamente`,
    });
  } catch (err) {
    console.error("Error al actualizar consentimiento:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// LEGAL DATA (ARCO RIGHTS)
// -----------------------------
router.get("/legal-data", requireAuth, async (req: any, res) => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        termsAcceptedAt: users.termsAcceptedAt,
        privacyPolicyAcceptedAt: users.privacyPolicyAcceptedAt,
        legalDisclaimerAcceptedAt: users.legalDisclaimerAcceptedAt,
        dataProcessingConsent: users.dataProcessingConsent,
        marketingConsent: users.marketingConsent,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Datos personales y consentimientos según Ley 25.326",
      personalData: result[0],
      legalRights: {
        access: "Derecho de acceso a datos personales",
        rectification: "Derecho de rectificación de datos erróneos",
        cancellation: "Derecho de supresión/cancelación de datos",
        opposition: "Derecho de oposición al tratamiento",
      },
      contact: "privacidad@servicioshogar.com.ar",
    });
  } catch (err) {
    console.error("Error al obtener datos legales:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// ADMIN: LIST USERS
// -----------------------------
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(50);

    res.json(result);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

