import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { neon } from "@neondatabase/serverless";
import { sendVerificationResultEmail } from "../services/resendEmailService.js";

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// Middleware: solo admin
router.use(requireAuth);
router.use(requireRole("admin"));

// GET /api/admin/stats

router.get("/dashboard-summary", async (req, res) => {
  try {
    const [s, providers, requests, m, a] = await Promise.all([
      Promise.all([
        sql`SELECT COUNT(*) as count FROM users`,
        sql`SELECT COUNT(*) as count FROM service_providers`,
        sql`SELECT COUNT(*) as count FROM service_requests`,
        sql`SELECT COUNT(*) as count FROM lead_responses`,
      ]),
      sql`SELECT id, business_name, city, province, experience_years, is_verified, created_at FROM service_providers ORDER BY is_verified ASC, created_at DESC LIMIT 20`,
      sql`SELECT id, title, description, city, province, status, is_urgent, created_at FROM service_requests ORDER BY created_at DESC LIMIT 20`,
      Promise.all([
        sql`SELECT COUNT(*) FILTER (WHERE is_verified = true) as verified, COUNT(*) as total FROM service_providers`,
        sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_urgent = true) as urgent, COUNT(*) FILTER (WHERE status != 'cancelled') as active FROM service_requests`,
        sql`SELECT COUNT(DISTINCT service_request_id) as converted FROM lead_responses`,
      ]),
      Promise.all([
        sql`SELECT 'provider' as type, business_name as label, created_at FROM service_providers ORDER BY created_at DESC LIMIT 5`,
        sql`SELECT 'request' as type, title as label, created_at FROM service_requests ORDER BY created_at DESC LIMIT 5`,
      ]),
    ]);
    const tp = Number(m[0][0].total), tr = Number(m[1][0].total);
    const activity = [...a[0], ...a[1]]
      .sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())
      .slice(0, 8);
    res.json({
      stats: {
        totalUsers: Number(s[0][0].count),
        totalProviders: Number(s[1][0].count),
        totalRequests: Number(s[2][0].count),
        totalCompletedJobs: Number(s[3][0].count),
      },
      providers: providers.map((p: any) => ({
        id: p.id, businessName: p.business_name, city: p.city,
        province: p.province, experienceYears: p.experience_years,
        isVerified: p.is_verified, createdAt: p.created_at,
      })),
      requests,
      metrics: {
        verifiedPercent: tp > 0 ? Math.round(Number(m[0][0].verified) / tp * 100) : 0,
        verifiedCount: Number(m[0][0].verified), totalProviders: tp,
        conversionPercent: tr > 0 ? Math.round(Number(m[2][0].converted) / tr * 100) : 0,
        convertedRequests: Number(m[2][0].converted),
        urgentPercent: tr > 0 ? Math.round(Number(m[1][0].urgent) / tr * 100) : 0,
        urgentCount: Number(m[1][0].urgent),
        activePercent: tr > 0 ? Math.round(Number(m[1][0].active) / tr * 100) : 0,
        activeCount: Number(m[1][0].active), totalRequests: tr,
      },
      activity,
    });
  } catch (error) {
    console.error("Error en /api/admin/dashboard-summary:", error);
    res.status(500).json({ error: "Error al obtener resumen del dashboard" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users`;
    const [totalProviders] = await sql`SELECT COUNT(*) as count FROM service_providers`;
    const [totalRequests] = await sql`SELECT COUNT(*) as count FROM service_requests`;
    const [totalUnlocks] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    res.json({
      totalUsers: Number(totalUsers.count),
      totalProviders: Number(totalProviders.count),
      totalRequests: Number(totalRequests.count),
      totalCompletedJobs: Number(totalUnlocks.count),
    });
  } catch (error) {
    console.error("Error en /api/admin/stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// GET /api/admin/providers
router.get("/providers", async (req, res) => {
  try {
    const providers = await sql`
      SELECT id, business_name, city, province, experience_years, is_verified, created_at
      FROM service_providers
      ORDER BY is_verified ASC, created_at DESC
      LIMIT 20
    `;
    res.json(providers.map((p: any) => ({
      id: p.id,
      businessName: p.business_name,
      city: p.city,
      province: p.province,
      experienceYears: p.experience_years,
      isVerified: p.is_verified,
      createdAt: p.created_at,
    })));
  } catch (error) {
    console.error("Error en /api/admin/providers:", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

// GET /api/admin/requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await sql`
      SELECT id, title, description, city, province, status, is_urgent, created_at
      FROM service_requests
      ORDER BY created_at DESC
      LIMIT 20
    `;
    res.json(requests.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      city: r.city,
      province: r.province,
      status: r.status,
      isUrgent: r.is_urgent,
      createdAt: r.created_at,
    })));
  } catch (error) {
    console.error("Error en /api/admin/requests:", error);
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
});

// GET /api/admin/activity
router.get("/activity", async (req, res) => {
  try {
    const providers = await sql`
      SELECT 'provider' as type, business_name as label, created_at
      FROM service_providers ORDER BY created_at DESC LIMIT 5
    `;
    const requests = await sql`
      SELECT 'request' as type, title as label, created_at
      FROM service_requests ORDER BY created_at DESC LIMIT 5
    `;
    const combined = [...providers, ...requests]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
    res.json(combined);
  } catch (error) {
    console.error("Error en /api/admin/activity:", error);
    res.status(500).json({ error: "Error al obtener actividad" });
  }
});


// GET /api/admin/providers/:id
router.get("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [provider] = await sql`
      SELECT
        sp.id, sp.business_name, sp.description, sp.city, sp.province,
        sp.experience_years, sp.is_verified, sp.is_active, sp.rating,
        sp.total_reviews, sp.phone_number, sp.address, sp.hourly_rate,
        sp.coverage_radius_km, sp.created_at,
        u.email, u.first_name, u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = ${id}
    `;
    res.json({
      id: provider.id,
      businessName: provider.business_name,
      description: provider.description,
      city: provider.city,
      province: provider.province,
      experienceYears: provider.experience_years,
      isVerified: provider.is_verified,
      isActive: provider.is_active,
      rating: provider.rating,
      totalReviews: provider.total_reviews,
      phoneNumber: provider.phone_number,
      address: provider.address,
      hourlyRate: provider.hourly_rate,
      coverageRadiusKm: provider.coverage_radius_km,
      createdAt: provider.created_at,
      email: provider.email,
      firstName: provider.first_name,
      lastName: provider.last_name,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/providers/:id:", error);
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
});

// PATCH /api/admin/providers/:id/verify
router.patch("/providers/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await sql`
      UPDATE service_providers
      SET is_verified = NOT is_verified, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, is_verified
    `;
    res.json({ id: updated.id, isVerified: updated.is_verified });
  } catch (error) {
    console.error("Error en PATCH /api/admin/providers/:id/verify:", error);
    res.status(500).json({ error: "Error al verificar proveedor" });
  }
});

// GET /api/admin/requests/:id
router.get("/requests/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await sql`
      SELECT
        sr.id, sr.title, sr.description, sr.address, sr.city, sr.province,
        sr.neighborhood, sr.preferred_date, sr.status,
        sr.is_urgent, sr.customer_notes, sr.preferred_contact_methods,
        sr.customer_first_name, sr.customer_phone, sr.customer_email,
        sr.created_at, sr.category_id,
        c.name as category_name
      FROM service_requests sr
      LEFT JOIN service_categories c ON sr.category_id = c.id
      WHERE sr.id = ${id}
    `;
    if (!r) return res.status(404).json({ error: "Solicitud no encontrada" });
    res.json({
      id: r.id,
      title: r.title,
      description: r.description,
      address: r.address,
      city: r.city,
      province: r.province,
      neighborhood: r.neighborhood,
      preferredDate: r.preferred_date,
      status: r.status,
      isUrgent: r.is_urgent,
      customerNotes: r.customer_notes,
      preferredContactMethods: r.preferred_contact_methods,
      customerFirstName: r.customer_first_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      createdAt: r.created_at,
      categoryName: r.category_name,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/requests/:id:", error);
    res.status(500).json({ error: "Error al obtener solicitud" });
  }
});

// GET /api/admin/metrics
router.get("/metrics", async (req, res) => {
  try {
    const [verified] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE is_verified = true) as verified,
        COUNT(*) as total
      FROM service_providers
    `;
    const [requests] = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_urgent = true) as urgent,
        COUNT(*) FILTER (WHERE status != 'cancelled') as active
      FROM service_requests
    `;
    const [conversions] = await sql`
      SELECT COUNT(DISTINCT service_request_id) as converted
      FROM lead_responses
    `;
    const totalProviders = Number(verified.total);
    const totalRequests = Number(requests.total);
    res.json({
      verifiedPercent: totalProviders > 0 ? Math.round((Number(verified.verified) / totalProviders) * 100) : 0,
      verifiedCount: Number(verified.verified),
      totalProviders,
      conversionPercent: totalRequests > 0 ? Math.round((Number(conversions.converted) / totalRequests) * 100) : 0,
      convertedRequests: Number(conversions.converted),
      urgentPercent: totalRequests > 0 ? Math.round((Number(requests.urgent) / totalRequests) * 100) : 0,
      urgentCount: Number(requests.urgent),
      activePercent: totalRequests > 0 ? Math.round((Number(requests.active) / totalRequests) * 100) : 0,
      activeCount: Number(requests.active),
      totalRequests,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/metrics:", error);
    res.status(500).json({ error: "Error al obtener metricas" });
  }
});



// GET /api/admin/settings
router.get("/settings", async (_req, res) => {
  try {
    const rows = await sql`SELECT value FROM platform_settings WHERE key = 'analytics_start_date'`;
    res.json({ analyticsStartDate: rows[0]?.value ?? null });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/settings
router.patch("/settings", async (req, res) => {
  try {
    const { analyticsStartDate } = req.body;
    if (analyticsStartDate !== null && analyticsStartDate !== undefined) {
      // Validar formato fecha
      const d = new Date(analyticsStartDate);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "Fecha inválida" });
      await sql`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES ('analytics_start_date', ${analyticsStartDate}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${analyticsStartDate}, updated_at = NOW()
      `;
    } else {
      await sql`DELETE FROM platform_settings WHERE key = 'analytics_start_date'`;
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/analytics
router.get("/analytics", async (req, res) => {
  try {
    const settingRows = await sql`SELECT value FROM platform_settings WHERE key = 'analytics_start_date'`;
    const startDate = settingRows[0]?.value ?? '1970-01-01';
    const [users] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) as this_month,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now() - interval '1 month')
                           AND created_at < date_trunc('month', now())) as last_month,
        COUNT(*) as total
      FROM users
      WHERE created_at >= ${startDate}::date
    `;
    const [providers] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) as this_month,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now() - interval '1 month')
                           AND created_at < date_trunc('month', now())) as last_month,
        COUNT(*) as total
      FROM service_providers
      WHERE created_at >= ${startDate}::date
    `;
    const [requests] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) as this_month,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now() - interval '1 month')
                           AND created_at < date_trunc('month', now())) as last_month,
        COUNT(*) as total
      FROM service_requests
      WHERE created_at >= ${startDate}::date
    `;
    const [unlocks] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE unlocked_at >= date_trunc('month', now())) as this_month,
        COUNT(*) FILTER (WHERE unlocked_at >= date_trunc('month', now() - interval '1 month')
                           AND unlocked_at < date_trunc('month', now())) as last_month,
        COUNT(*) as total
      FROM lead_responses
      WHERE unlocked_at >= ${startDate}::date
    `;
    const calcDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    const thisMonthUsers = Number(users.this_month);
    const lastMonthUsers = Number(users.last_month);
    const thisMonthProviders = Number(providers.this_month);
    const lastMonthProviders = Number(providers.last_month);
    const thisMonthRequests = Number(requests.this_month);
    const lastMonthRequests = Number(requests.last_month);
    const thisMonthUnlocks = Number(unlocks.this_month);
    const lastMonthUnlocks = Number(unlocks.last_month);
    res.json({
      users: {
        thisMonth: thisMonthUsers,
        lastMonth: lastMonthUsers,
        total: Number(users.total),
        delta: calcDelta(thisMonthUsers, lastMonthUsers),
      },
      providers: {
        thisMonth: thisMonthProviders,
        lastMonth: lastMonthProviders,
        total: Number(providers.total),
        delta: calcDelta(thisMonthProviders, lastMonthProviders),
      },
      requests: {
        thisMonth: thisMonthRequests,
        lastMonth: lastMonthRequests,
        total: Number(requests.total),
        delta: calcDelta(thisMonthRequests, lastMonthRequests),
      },
      unlocks: {
        thisMonth: thisMonthUnlocks,
        lastMonth: lastMonthUnlocks,
        total: Number(unlocks.total),
        delta: calcDelta(thisMonthUnlocks, lastMonthUnlocks),
      },
    });
  } catch (error) {
    console.error("Error en GET /api/admin/analytics:", error);
    res.status(500).json({ error: "Error al obtener analytics" });
  }
});

// POST /api/admin/categories
router.post("/categories", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre requerido" });
    const [cat] = await sql`
      INSERT INTO service_categories (name, description, icon, is_active)
      VALUES (${name}, ${description || null}, ${icon || null}, true)
      RETURNING id, name, description, icon, is_active as "isActive", created_at as "createdAt"
    `;
    res.json(cat);
  } catch (error) {
    console.error("Error en POST /api/admin/categories:", error);
    res.status(500).json({ error: "Error al crear categoria" });
  }
});

// PATCH /api/admin/categories/:id
router.patch("/categories/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, isActive } = req.body;
    const [cat] = await sql`
      UPDATE service_categories
      SET
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description !== undefined ? description : null}, description),
        icon = COALESCE(${icon !== undefined ? icon : null}, icon),
        is_active = COALESCE(${isActive !== undefined ? isActive : null}, is_active)
      WHERE id = ${id}
      RETURNING id, name, description, icon, is_active as "isActive", created_at as "createdAt"
    `;
    if (!cat) return res.status(404).json({ error: "Categoria no encontrada" });
    res.json(cat);
  } catch (error) {
    console.error("Error en PATCH /api/admin/categories/:id:", error);
    res.status(500).json({ error: "Error al actualizar categoria" });
  }
});



// DELETE /api/admin/categories/:id
router.delete("/categories/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const [cat] = await sql`
      DELETE FROM service_categories WHERE id = ${id}
      RETURNING id
    `;
    if (!cat) return res.status(404).json({ error: "Categoria no encontrada" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/admin/categories/:id:", error);
    res.status(500).json({ error: "Error al eliminar categoria" });
  }
});
// GET /api/admin/identity-reviews — listar solicitudes de verificación
router.get("/identity-reviews", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const verifications = await sql`
      SELECT
        pv.id,
        pv.provider_id as "providerId",
        pv.person_type as "personType",
        pv.document_type as "documentType",
        pv.document_number as "documentNumber",
        pv.legal_representative as "legalRepresentative",
        pv.status,
        pv.admin_notes as "adminNotes",
        pv.reviewed_at as "reviewedAt",
        pv.consent_given as "consentGiven",
        pv.consent_at as "consentAt",
        pv.created_at as "createdAt",
        sp.business_name as "businessName",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email
      FROM provider_verifications pv
      JOIN service_providers sp ON sp.id = pv.provider_id
      JOIN users u ON u.id = sp.user_id
      ORDER BY
        CASE pv.status WHEN 'pending' THEN 0 WHEN 'rejected' THEN 1 ELSE 2 END,
        pv.created_at DESC
    `;
    res.json(verifications);
  } catch (error) {
    console.error("Error en GET /api/admin/identity-reviews:", error);
    res.status(500).json({ error: "Error al obtener verificaciones" });
  }
});

// PATCH /api/admin/identity-reviews/:id — aprobar o rechazar
router.patch("/identity-reviews/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status debe ser approved o rejected" });
    }
    const adminId = (req as any).user.id;

    const [verification] = await sql`
      UPDATE provider_verifications
      SET
        status = ${status},
        admin_notes = ${adminNotes || null},
        reviewed_by = ${adminId},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, provider_id as "providerId", status
    `;
    if (!verification) return res.status(404).json({ error: "Verificacion no encontrada" });

    if (status === "approved") {
      await sql`
        UPDATE service_providers
        SET is_verified = true, updated_at = NOW()
        WHERE id = ${verification.providerId}
      `;
    } else if (status === "rejected") {
      await sql`
        UPDATE service_providers
        SET is_verified = false, updated_at = NOW()
        WHERE id = ${verification.providerId}
      `;
    }

    // Notificar al proveedor por email
    const [providerInfo] = await sql`
      SELECT u.email, u.first_name, u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = ${verification.providerId}
    `;
    if (providerInfo) {
      const providerName = [providerInfo.first_name, providerInfo.last_name].filter(Boolean).join(" ") || "Profesional";
      sendVerificationResultEmail(providerInfo.email, providerName, status, adminNotes).catch(console.error);
    }
    res.json(verification);
  } catch (error) {
    console.error("Error en PATCH /api/admin/identity-reviews/:id:", error);
    res.status(500).json({ error: "Error al actualizar verificacion" });
  }
});


router.get("/profile-changes", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const changes = await sql`
      SELECT ppc.id, ppc.provider_id, ppc.field_name, ppc.old_value, ppc.new_value, ppc.changed_at,
             sp_u.first_name AS provider_first, sp_u.last_name AS provider_last, sp.business_name,
             cb_u.first_name AS changed_by_first, cb_u.last_name AS changed_by_last
      FROM provider_profile_changes ppc
      JOIN service_providers sp ON ppc.provider_id = sp.id
      JOIN users sp_u ON sp.user_id = sp_u.id
      LEFT JOIN users cb_u ON ppc.changed_by = cb_u.id
      ORDER BY ppc.changed_at DESC
      LIMIT 200
    `;
    res.json(changes);
  } catch (error) {
    console.error("Error en GET /api/admin/profile-changes:", error);
    res.status(500).json({ error: "Error al obtener auditoría" });
  }
});


// ============================================
// CREDIT PACKAGES — gestión de precios
// ============================================

router.get("/credit-packages", async (_req, res) => {
  try {
    const packages = await sql`SELECT id, nombre, creditos, precio, destacado, activo, orden FROM credit_packages ORDER BY orden`;
    res.json(packages);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/credit-packages/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { nombre, creditos, precio, destacado, activo } = req.body;

  // Validaciones
  if (nombre !== undefined && (typeof nombre !== "string" || nombre.trim().length === 0)) {
    return res.status(400).json({ error: "Nombre inválido" });
  }
  if (creditos !== undefined && (!Number.isInteger(creditos) || creditos <= 0)) {
    return res.status(400).json({ error: "Créditos debe ser entero positivo" });
  }
  if (precio !== undefined && (!Number.isInteger(precio) || precio <= 0)) {
    return res.status(400).json({ error: "Precio debe ser entero positivo" });
  }

  try {
    // Si se intenta marcar como destacado, desmarcar el anterior primero
    if (destacado === true) {
      await sql`UPDATE credit_packages SET destacado = FALSE WHERE destacado = TRUE`;
    }

    const [updated] = await sql`
      UPDATE credit_packages SET
        nombre    = COALESCE(${nombre ?? null}, nombre),
        creditos  = COALESCE(${creditos ?? null}, creditos),
        precio    = COALESCE(${precio ?? null}, precio),
        destacado = COALESCE(${destacado ?? null}, destacado),
        activo    = COALESCE(${activo ?? null}, activo),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, nombre, creditos, precio, destacado, activo, orden
    `;

    if (!updated) return res.status(404).json({ error: "Paquete no encontrado" });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// POST /api/admin/credit-packages
router.post("/credit-packages", async (req, res) => {
  const { nombre, creditos, precio, destacado } = req.body;
  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0)
    return res.status(400).json({ error: "Nombre requerido" });
  if (!Number.isInteger(creditos) || creditos <= 0)
    return res.status(400).json({ error: "Créditos debe ser entero positivo" });
  if (!Number.isInteger(precio) || precio <= 0)
    return res.status(400).json({ error: "Precio debe ser entero positivo" });
  try {
    if (destacado === true) {
      await sql`UPDATE credit_packages SET destacado = FALSE WHERE destacado = TRUE`;
    }
    const maxOrden = await sql`SELECT COALESCE(MAX(orden), 0) as max FROM credit_packages`;
    const nextOrden = (maxOrden[0]?.max ?? 0) + 1;
    const [created] = await sql`
      INSERT INTO credit_packages (nombre, creditos, precio, destacado, activo, orden)
      VALUES (${nombre.trim()}, ${creditos}, ${precio}, ${destacado ?? false}, true, ${nextOrden})
      RETURNING id, nombre, creditos, precio, destacado, activo, orden
    `;
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/credit-packages/:id
router.delete("/credit-packages/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  try {
    const [deleted] = await sql`DELETE FROM credit_packages WHERE id = ${id} RETURNING id`;
    if (!deleted) return res.status(404).json({ error: "Paquete no encontrado" });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
