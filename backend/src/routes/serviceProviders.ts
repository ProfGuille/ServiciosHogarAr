import { Router } from "express";
import { sql } from "../db.js";
import { providersService } from "../services/providersService.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendAdminVerificationNotificationEmail } from "../services/resendEmailService.js";
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { eq } from "drizzle-orm";

const router = Router();

// -----------------------------
// Helpers
// -----------------------------
async function ensureOwnership(req, providerId) {
  console.log("ensureOwnership — role:", req.user.role, "userId:", req.user.id, "providerId param:", providerId);
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo los proveedores pueden realizar esta acción" };
  }
  const provider = await db.select({ id: serviceProviders.id, userId: serviceProviders.userId })
    .from(serviceProviders)
    .where(eq(serviceProviders.id, providerId))
    .limit(1);
  console.log("ensureOwnership — provider found:", provider);
  if (!provider.length || provider[0].userId !== req.user.id) {
    throw { status: 403, message: "No autorizado para modificar este perfil" };
  }
}

// -----------------------------
// Obtener servicios del proveedor (público)
// -----------------------------
router.get("/:id/services", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const services = await providersService.getServices(id);
    res.json(services);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar perfil (solo dueño)
// -----------------------------
router.patch("/:id", requireAuth, async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await providersService.updateProfile(providerId, req.body, (req as any).user?.id);
    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar ubicación (solo dueño)
// -----------------------------
router.patch("/:id/location", requireAuth, async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    await ensureOwnership(req, providerId);

    const { latitude, longitude } = req.body;

    const updated = await providersService.updateLocation(
      providerId,
      Number(latitude),
      Number(longitude)
    );

    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar estado online/offline (solo dueño)
// -----------------------------
router.patch("/:id/online", requireAuth, async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    await ensureOwnership(req, providerId);

    const updated = await providersService.updateOnlineStatus(
      providerId,
      Boolean(req.body.isOnline)
    );

    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Obtener proveedor por ID (público)
// -----------------------------
router.get("/:id", async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const provider = await providersService.getById(providerId);
    if (!provider) return res.status(404).json({ error: "Proveedor no encontrado" });

    // Sanitizar datos sensibles
    delete provider.phoneNumber;

    // Agregar ubicación real si existe
    const locRows = (await sql`
      SELECT latitude, longitude FROM provider_locations WHERE provider_id = ${providerId} LIMIT 1
    `) as any[];
    if (locRows[0]) {
      (provider as any).latitude = locRows[0].latitude;
      (provider as any).longitude = locRows[0].longitude;
    }
    res.json(provider);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// Búsqueda avanzada (DEPRECATED)
// -----------------------------
// Esta ruta debe ser reemplazada por /search/providers
router.get("/", async (req, res) => {
  res.status(410).json({
    error: "Este endpoint fue reemplazado por /api/search/providers",
  });
});


// POST /api/providers/:id/verification — proveedor solicita verificación
router.post("/:id/verification", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { personType, documentType, documentNumber, legalRepresentative, consentGiven } = req.body;

    // Validar que el proveedor le pertenece al usuario autenticado
    const [provider] = (await sql`
      SELECT id, user_id, business_name FROM service_providers WHERE id = ${id}
    `) as any[];
    if (!provider) return res.status(404).json({ error: "Proveedor no encontrado" });
    if (provider.user_id !== (req as any).user.id) return res.status(403).json({ error: "No autorizado" });

    // Validar campos obligatorios
    if (!personType || !documentType || !documentNumber) {
      return res.status(400).json({ error: "personType, documentType y documentNumber son obligatorios" });
    }
    if (!["fisica", "juridica"].includes(personType)) {
      return res.status(400).json({ error: "personType debe ser fisica o juridica" });
    }
    if (!["DNI", "CUIT"].includes(documentType)) {
      return res.status(400).json({ error: "documentType debe ser DNI o CUIT" });
    }
    if (personType === "juridica" && !legalRepresentative) {
      return res.status(400).json({ error: "legalRepresentative es obligatorio para personas juridicas" });
    }
    if (!consentGiven) {
      return res.status(400).json({ error: "Se requiere consentimiento expreso (consentGiven: true)" });
    }

    // Verificar si ya tiene una solicitud pendiente o aprobada
    const [existing] = (await sql`
      SELECT id, status FROM provider_verifications
      WHERE provider_id = ${id} AND status IN ('pending', 'approved')
    `) as any[];
    if (existing) {
      return res.status(409).json({
        error: existing.status === "approved"
          ? "Este proveedor ya está verificado"
          : "Ya existe una solicitud de verificacion pendiente"
      });
    }

    const [verification] = (await sql`
      INSERT INTO provider_verifications
        (provider_id, person_type, document_type, document_number, legal_representative, consent_given, consent_at)
      VALUES
        (${id}, ${personType}, ${documentType}, ${documentNumber}, ${legalRepresentative || null}, true, NOW())
      RETURNING id, status, created_at as "createdAt"
    `) as any[];

    // Notificar al admin por email (no bloquea la respuesta)
    sendAdminVerificationNotificationEmail(
      provider.business_name || `Proveedor ID ${id}`,
      documentType,
      documentNumber,
      personType
    ).catch(err => console.error("Error enviando email admin verificacion:", err));

    res.status(201).json(verification);
  } catch (error) {
    console.error("Error en POST /api/providers/:id/verification:", error);
    res.status(500).json({ error: "Error al crear solicitud de verificacion" });
  }
});

// GET /api/providers/:id/verification — proveedor consulta estado de su verificación
router.get("/:id/verification", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [provider] = (await sql`
      SELECT id, user_id FROM service_providers WHERE id = ${id}
    `) as any[];
    if (!provider) return res.status(404).json({ error: "Proveedor no encontrado" });
    if (provider.user_id !== (req as any).user.id) return res.status(403).json({ error: "No autorizado" });

    const [verification] = (await sql`
      SELECT id, person_type as "personType", document_type as "documentType",
        document_number as "documentNumber", legal_representative as "legalRepresentative",
        status, admin_notes as "adminNotes", reviewed_at as "reviewedAt",
        consent_given as "consentGiven", created_at as "createdAt"
      FROM provider_verifications
      WHERE provider_id = ${id}
      ORDER BY created_at DESC
      LIMIT 1
    `) as any[];

    if (!verification) return res.status(404).json({ error: "Sin solicitudes de verificacion" });
    res.json(verification);
  } catch (error) {
    console.error("Error en GET /api/providers/:id/verification:", error);
    res.status(500).json({ error: "Error al obtener verificacion" });
  }
});


// -----------------------------
// GET /api/providers/:id/reviews
// -----------------------------
router.get("/:id/reviews", async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.first_name AS reviewer_first_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.reviewer_id::varchar
      WHERE r.reviewee_id::varchar IN (
        SELECT user_id FROM service_providers WHERE id = ${providerId}
      )
      AND r.is_public = true
      ORDER BY r.created_at DESC
      LIMIT 20
    `;
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("Error en GET /api/providers/:id/reviews:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// GET /api/providers/:id/stats
// -----------------------------
router.get("/:id/stats", async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);

    const [sp] = (await sql`
      SELECT id, user_id, is_verified
      FROM service_providers
      WHERE id = ${providerId}
    `) as any[];
    if (!sp) return res.status(404).json({ error: "Proveedor no encontrado" });

    const [reviewStats] = (await sql`
      SELECT
        COUNT(*)::int AS total_reviews,
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS avg_rating
      FROM reviews
      WHERE reviewee_id = ${sp.user_id}
      AND is_public = true
    `) as any[];

    const [jobStats] = (await sql`
      SELECT
        COUNT(*)::int AS total_jobs,
        COUNT(*) FILTER (
          WHERE service_request_id IN (
            SELECT id FROM service_requests WHERE status = 'completed'
          )
        )::int AS completed_jobs
      FROM lead_responses
      WHERE provider_id = ${sp.id}
    `) as any[];

    res.json({
      averageRating: Number(reviewStats.avg_rating),
      totalReviews: Number(reviewStats.total_reviews),
      isVerified: sp.is_verified,
      totalJobs: Number(jobStats.total_jobs),
      completedJobs: Number(jobStats.completed_jobs),
    });
  } catch (err) {
    console.error("Error en GET /api/providers/:id/stats:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// -----------------------------------------------
// -----------------------------------------------
// GET /api/providers/:id/categories — categorías del proveedor
// -----------------------------------------------
router.get("/:id/categories", async (req, res) => {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const providerId = parseInt(req.params.id);
    if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });
    const rows = (await sql`
      SELECT sc.id, sc.name, sc.icon
      FROM provider_categories pc
      JOIN service_categories sc ON sc.id = pc.category_id
      WHERE pc.provider_id = ${providerId}
      ORDER BY sc.name
    `) as any[];
    res.json(rows);
  } catch (err) {
    console.error("Error GET /:id/categories:", err);
    res.status(500).json({ error: "Error interno" });
  }
});
// -----------------------------------------------
// GET /api/providers/reviews/recent — público
// -----------------------------------------------
router.get("/reviews/recent", async (req, res) => {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name AS reviewer_first_name,
        sp.business_name AS provider_business_name,
        sc.name AS category_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.reviewer_id::varchar
      LEFT JOIN service_providers sp ON sp.user_id = r.reviewee_id::varchar
      LEFT JOIN service_categories sc ON sc.id = sp.category_id
      WHERE r.is_public = true
        AND r.comment IS NOT NULL
        AND r.rating >= 4
      ORDER BY r.created_at DESC
      LIMIT 8
    `;
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /api/providers/reviews/recent:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;

