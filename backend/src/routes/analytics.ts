import { Router } from "express";
import { db } from "../db";
import { analytics } from "../shared/schema/analytics";
import { analyticsEvents } from "../shared/schema/analyticsEvents";
import { serviceProviders } from "../shared/schema/serviceProviders";
import { serviceRequests } from "../shared/schema/serviceRequests";
import { creditPurchases } from "../shared/schema/creditPurchases";
import { eq, sql, desc, asc, and, gte, lte } from "drizzle-orm";

const router = Router();

// Get comprehensive dashboard metrics
router.get("/dashboard", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Date filters
    const dateFilter = startDate && endDate 
      ? and(
          gte(analyticsEvents.createdAt, new Date(startDate as string)),
          lte(analyticsEvents.createdAt, new Date(endDate as string))
        )
      : undefined;

    // Basic metrics
    const totalProviders = await db.select({ count: sql<number>`count(*)` })
      .from(serviceProviders);
    
    const verifiedProviders = await db.select({ count: sql<number>`count(*)` })
      .from(serviceProviders)
      .where(eq(serviceProviders.isVerified, true));

    const totalRequests = await db.select({ count: sql<number>`count(*)` })
      .from(serviceRequests);

    // Revenue analytics
    const revenueData = await db.select({
      month: sql<string>`DATE_TRUNC('month', ${creditPurchases.createdAt})`,
      revenue: sql<number>`SUM(${creditPurchases.amount})`,
      transactions: sql<number>`COUNT(*)`
    })
    .from(creditPurchases)
    .where(dateFilter)
    .groupBy(sql`DATE_TRUNC('month', ${creditPurchases.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${creditPurchases.createdAt})`);

    // User activity analytics
    const userActivity = await db.select({
      event: analyticsEvents.eventType,
      count: sql<number>`COUNT(*)`
    })
    .from(analyticsEvents)
    .where(dateFilter)
    .groupBy(analyticsEvents.eventType)
    .orderBy(desc(sql`COUNT(*)`));

    // Top performing providers
    const topProviders = await db.select({
      id: serviceProviders.id,
      businessName: serviceProviders.businessName,
      averageRating: serviceProviders.averageRating,
      totalReviews: serviceProviders.totalReviews,
      credits: serviceProviders.credits
    })
    .from(serviceProviders)
    .where(eq(serviceProviders.isVerified, true))
    .orderBy(desc(serviceProviders.averageRating))
    .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalProviders: totalProviders[0]?.count || 0,
          verifiedProviders: verifiedProviders[0]?.count || 0,
          totalRequests: totalRequests[0]?.count || 0,
          verificationRate: totalProviders[0]?.count > 0 
            ? ((verifiedProviders[0]?.count || 0) / totalProviders[0].count * 100).toFixed(1)
            : 0
        },
        revenue: revenueData,
        userActivity,
        topProviders
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ 
      error: "Error al obtener métricas del dashboard",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user growth analytics
router.get("/user-growth", async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const growthData = await db.select({
      date: sql<string>`DATE(${serviceProviders.createdAt})`,
      newProviders: sql<number>`COUNT(*)`
    })
    .from(serviceProviders)
    .where(gte(serviceProviders.createdAt, startDate))
    .groupBy(sql`DATE(${serviceProviders.createdAt})`)
    .orderBy(sql`DATE(${serviceProviders.createdAt})`);

    res.json({
      success: true,
      data: growthData
    });

  } catch (error) {
    console.error('User growth analytics error:', error);
    res.status(500).json({ 
      error: "Error al obtener analíticas de crecimiento",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get real-time performance metrics
router.get("/performance", async (req, res) => {
  try {
    // Active users (online in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeProviders = await db.select({ count: sql<number>`count(*)` })
      .from(serviceProviders)
      .where(and(
        eq(serviceProviders.isOnline, true),
        gte(serviceProviders.lastSeenAt, fiveMinutesAgo)
      ));

    // System health metrics
    const healthMetrics = {
      activeProviders: activeProviders[0]?.count || 0,
      systemStatus: 'operational',
      responseTime: Math.random() * 100 + 50, // Mock response time
      uptime: 99.9,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: healthMetrics
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ 
      error: "Error al obtener métricas de rendimiento",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Track analytics events
router.post("/track", async (req, res) => {
  try {
    const { userId, eventType, metadata } = req.body;

    await db.insert(analyticsEvents).values({
      userId: userId || null,
      eventType,
      event: `${eventType}: ${JSON.stringify(metadata || {})}`.substring(0, 128),
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ 
      error: "Error al rastrear evento",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Legacy analytics endpoint
router.get("/", async (req, res) => {
  try {
    const data = await db.select().from(analytics);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener analíticas" });
  }
});

export default router;