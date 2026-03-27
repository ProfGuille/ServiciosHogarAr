import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { neon } from "@neondatabase/serverless";

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// Middleware: solo admin
router.use(requireAuth);
router.use(requireRole("admin"));

// GET /api/admin/stats
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
router.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await sql`
      SELECT
        sr.id, sr.title, sr.description, sr.address, sr.city, sr.province,
        sr.neighborhood, sr.preferred_date, sr.estimated_budget, sr.status,
        sr.is_urgent, sr.customer_notes, sr.preferred_contact_methods,
        sr.customer_first_name, sr.customer_phone, sr.customer_email,
        sr.created_at, sr.category_id,
        c.name as category_name
      FROM service_requests sr
      LEFT JOIN categories c ON sr.category_id = c.id
      WHERE sr.id = ${id}
    `;
    if (router.patch(/providers/:id/verify, async (req, res) => {) return res.status(404).json({ error: "Solicitud no encontrada" });
    res.json({
      id: r.id,
      title: r.title,
      description: r.description,
      address: r.address,
      city: r.city,
      province: r.province,
      neighborhood: r.neighborhood,
      preferredDate: r.preferred_date,
      estimatedBudget: r.estimated_budget,
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
export default router;
