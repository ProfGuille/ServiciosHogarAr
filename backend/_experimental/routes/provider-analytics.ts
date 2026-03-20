import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { providersAnalyticsService } from "../services/providersAnalyticsService.js";

const router = express.Router();

// -----------------------------
// Helpers
// -----------------------------
function ensureProvider(req) {
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo los proveedores pueden acceder a esta información" };
  }
  if (!req.user.providerId || req.user.providerId <= 0) {
    throw { status: 403, message: "Proveedor no autenticado" };
  }
}

// -----------------------------
// Resumen rápido
// -----------------------------
router.get("/summary", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;

    const overview = await providersAnalyticsService.getOverview(providerId, 90);
    const activeServices = await providersAnalyticsService.getActiveServices(providerId);

    res.json({
      totalRevenue: overview.totalRevenue,
      totalBookings: overview.totalBookings,
      averageRating: overview.averageRating,
      activeServices,
    });
  } catch (err) {
    console.error("Error en /provider/analytics/summary:", err);
    const status = err.status || (err.message?.includes("inválido") ? 400 : 500);
    res.status(status).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Analytics completas
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;

    const rawDays = Number(req.query.timeRange);
    if (req.query.timeRange !== undefined && (isNaN(rawDays) || rawDays <= 0)) {
      return res.status(400).json({ error: "timeRange debe ser un número mayor a 0" });
    }

    const days = !isNaN(rawDays) && rawDays > 0 ? rawDays : 30;

    const overview = await providersAnalyticsService.getOverview(providerId, days);
    const revenueChart = await providersAnalyticsService.getRevenueChart(providerId, days);
    const servicePerformance = await providersAnalyticsService.getServicePerformance(providerId);
    const clientMetrics = await providersAnalyticsService.getClientMetrics(providerId);
    const monthlyTrends = await providersAnalyticsService.getMonthlyTrends(providerId);
    const activeServices = await providersAnalyticsService.getActiveServices(providerId);

    res.json({
      overview,
      revenueChart,
      servicePerformance,
      clientMetrics,
      monthlyTrends,
      activeServices,
    });
  } catch (err) {
    console.error("Error en /provider/analytics:", err);
    const status = err.status || (err.message?.includes("inválido") ? 400 : 500);
    res.status(status).json({ error: err.message || "Error interno del servidor" });
  }
});

export default router;

