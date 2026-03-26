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
    const [totalUnlocks] = await sql`SELECT COUNT(*) as count FROM unlocked_leads`;
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

export default router;
