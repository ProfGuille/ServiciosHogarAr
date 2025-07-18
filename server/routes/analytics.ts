import type { Express } from "express";
import { db } from "../db";
import { 
  users, 
  serviceProviders, 
  serviceRequests, 
  payments, 
  reviews, 
  analyticsEvents,
  dailyStats,
  providerMetrics,
  serviceCategories,
  messages,
  conversations
} from "@shared/schema";
import { 
  sql, 
  eq, 
  and, 
  gte, 
  lte, 
  desc, 
  count, 
  sum, 
  avg 
} from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";

export function registerAnalyticsRoutes(app: Express) {
  // Platform Overview Statistics
  app.get("/api/analytics/platform-stats", isAuthenticated, async (req: any, res) => {
    try {
      const period = req.query.period || '30d';
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Total users and growth
      const [currentUsers] = await db
        .select({ count: count() })
        .from(users);

      const [newUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, startDate));

      // Total providers and growth
      const [currentProviders] = await db
        .select({ count: count() })
        .from(serviceProviders);

      const [newProviders] = await db
        .select({ count: count() })
        .from(serviceProviders)
        .where(gte(serviceProviders.createdAt, startDate));

      // Total requests and completion rate
      const [totalRequests] = await db
        .select({ count: count() })
        .from(serviceRequests);

      const [completedRequests] = await db
        .select({ count: count() })
        .from(serviceRequests)
        .where(eq(serviceRequests.status, "completed"));

      // Revenue calculation (from credit purchases)
      const [revenueResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(eq(payments.status, "succeeded"));

      const [newRevenueResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(and(
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startDate)
        ));

      const totalRevenue = Number(revenueResult?.total || 0);
      const newRevenue = Number(newRevenueResult?.total || 0);
      const previousRevenue = totalRevenue - newRevenue;

      const stats = {
        totalUsers: currentUsers.count,
        newUsersPercent: previousRevenue > 0 ? Math.round((newUsers.count / (currentUsers.count - newUsers.count)) * 100) : 100,
        totalProviders: currentProviders.count,
        newProvidersPercent: currentProviders.count > newProviders.count ? Math.round((newProviders.count / (currentProviders.count - newProviders.count)) * 100) : 100,
        totalRequests: totalRequests.count,
        totalRevenue,
        revenueGrowthPercent: previousRevenue > 0 ? Math.round((newRevenue / previousRevenue) * 100) : 100,
        conversionRate: totalRequests.count > 0 ? Math.round((completedRequests.count / totalRequests.count) * 100) : 0,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ error: "Failed to fetch platform statistics" });
    }
  });

  // Revenue Analytics
  app.get("/api/analytics/revenue", isAuthenticated, async (req: any, res) => {
    try {
      const period = req.query.period || '30d';
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Daily revenue trend
      const dailyRevenue = await db
        .select({
          date: sql<string>`DATE(${payments.createdAt})`,
          revenue: sum(payments.amount),
        })
        .from(payments)
        .where(and(
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startDate)
        ))
        .groupBy(sql`DATE(${payments.createdAt})`)
        .orderBy(sql`DATE(${payments.createdAt})`);

      // Payment methods breakdown
      const paymentMethods = await db
        .select({
          name: payments.paymentMethod,
          amount: sum(payments.amount),
        })
        .from(payments)
        .where(and(
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startDate)
        ))
        .groupBy(payments.paymentMethod);

      // Monthly revenue (for yearly view)
      const monthlyRevenue = await db
        .select({
          month: sql<string>`TO_CHAR(${payments.createdAt}, 'YYYY-MM')`,
          revenue: sum(payments.amount),
        })
        .from(payments)
        .where(and(
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startDate)
        ))
        .groupBy(sql`TO_CHAR(${payments.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${payments.createdAt}, 'YYYY-MM')`);

      res.json({
        daily: dailyRevenue.map(row => ({
          date: row.date,
          revenue: Number(row.revenue || 0)
        })),
        paymentMethods: paymentMethods.map(row => ({
          name: row.name || 'Desconocido',
          amount: Number(row.amount || 0)
        })),
        monthly: monthlyRevenue.map(row => ({
          month: row.month,
          revenue: Number(row.revenue || 0)
        }))
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  // User Growth Analytics
  app.get("/api/analytics/user-growth", isAuthenticated, async (req: any, res) => {
    try {
      const period = req.query.period || '30d';
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Daily user and provider growth
      const dailyGrowth = await db.execute(sql`
        WITH date_series AS (
          SELECT generate_series(
            ${startDate}::date,
            CURRENT_DATE,
            '1 day'::interval
          )::date as date
        ),
        daily_users AS (
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users
          FROM users
          WHERE created_at >= ${startDate}
          GROUP BY DATE(created_at)
        ),
        daily_providers AS (
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_providers
          FROM service_providers
          WHERE created_at >= ${startDate}
          GROUP BY DATE(created_at)
        ),
        cumulative AS (
          SELECT 
            ds.date,
            COALESCE(du.new_users, 0) as new_users,
            COALESCE(dp.new_providers, 0) as new_providers,
            (SELECT COUNT(*) FROM users WHERE DATE(created_at) <= ds.date) as total_users,
            (SELECT COUNT(*) FROM service_providers WHERE DATE(created_at) <= ds.date) as total_providers
          FROM date_series ds
          LEFT JOIN daily_users du ON ds.date = du.date
          LEFT JOIN daily_providers dp ON ds.date = dp.date
        )
        SELECT * FROM cumulative ORDER BY date
      `);

      res.json(dailyGrowth.rows.map((row: any) => ({
        date: row.date,
        newUsers: parseInt(row.new_users),
        newProviders: parseInt(row.new_providers),
        totalUsers: parseInt(row.total_users),
        totalProviders: parseInt(row.total_providers)
      })));
    } catch (error) {
      console.error("Error fetching user growth analytics:", error);
      res.status(500).json({ error: "Failed to fetch user growth analytics" });
    }
  });

  // Provider Performance Analytics
  app.get("/api/analytics/provider-performance", isAuthenticated, async (req: any, res) => {
    try {
      const period = req.query.period || '30d';
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Top performing providers
      const topProviders = await db
        .select({
          providerId: serviceProviders.id,
          businessName: serviceProviders.businessName,
          totalRequests: count(serviceRequests.id),
          completedRequests: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
          avgRating: avg(reviews.rating),
          totalEarnings: sum(payments.amount),
        })
        .from(serviceProviders)
        .leftJoin(serviceRequests, eq(serviceProviders.id, serviceRequests.providerId))
        .leftJoin(reviews, eq(serviceRequests.id, reviews.serviceRequestId))
        .leftJoin(payments, eq(serviceRequests.id, payments.serviceRequestId))
        .where(gte(serviceRequests.createdAt, startDate))
        .groupBy(serviceProviders.id, serviceProviders.businessName)
        .orderBy(desc(count(serviceRequests.id)))
        .limit(10);

      res.json(topProviders.map(provider => ({
        providerId: provider.providerId,
        businessName: provider.businessName,
        totalRequests: provider.totalRequests,
        completedRequests: Number(provider.completedRequests),
        completionRate: provider.totalRequests > 0 ? Math.round((Number(provider.completedRequests) / provider.totalRequests) * 100) : 0,
        avgRating: provider.avgRating ? Number(provider.avgRating).toFixed(1) : null,
        totalEarnings: Number(provider.totalEarnings || 0)
      })));
    } catch (error) {
      console.error("Error fetching provider performance:", error);
      res.status(500).json({ error: "Failed to fetch provider performance analytics" });
    }
  });

  // Service Category Analytics
  app.get("/api/analytics/categories", isAuthenticated, async (req: any, res) => {
    try {
      const period = req.query.period || '30d';
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const categoryStats = await db
        .select({
          categoryId: serviceCategories.id,
          categoryName: serviceCategories.name,
          requests: count(serviceRequests.id),
          completedRequests: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
          avgPrice: avg(payments.amount),
        })
        .from(serviceCategories)
        .leftJoin(serviceRequests, eq(serviceCategories.id, serviceRequests.categoryId))
        .leftJoin(payments, eq(serviceRequests.id, payments.serviceRequestId))
        .where(gte(serviceRequests.createdAt, startDate))
        .groupBy(serviceCategories.id, serviceCategories.name)
        .orderBy(desc(count(serviceRequests.id)));

      res.json(categoryStats.map(stat => ({
        categoryId: stat.categoryId,
        categoryName: stat.categoryName,
        requests: stat.requests,
        completedRequests: Number(stat.completedRequests),
        completionRate: stat.requests > 0 ? Math.round((Number(stat.completedRequests) / stat.requests) * 100) : 0,
        avgPrice: stat.avgPrice ? Number(stat.avgPrice).toFixed(2) : null
      })));
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({ error: "Failed to fetch category analytics" });
    }
  });

  // Conversion Funnel Analytics
  app.get("/api/analytics/conversion-funnel", isAuthenticated, async (req: any, res) => {
    try {
      const period = req.query.period || '30d';
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Count users who performed each action in the funnel
      const [totalUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, startDate));

      const [usersWithRequests] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${serviceRequests.customerId})` })
        .from(serviceRequests)
        .where(gte(serviceRequests.createdAt, startDate));

      const [usersWithMessages] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${messages.senderId})` })
        .from(messages)
        .where(gte(messages.createdAt, startDate));

      const [usersWithPayments] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${payments.customerId})` })
        .from(payments)
        .where(and(
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startDate)
        ));

      const funnel = [
        {
          step: "Registro",
          count: totalUsers.count,
          conversionRate: 100
        },
        {
          step: "Solicitud de Servicio",
          count: Number(usersWithRequests.count),
          conversionRate: totalUsers.count > 0 ? Math.round((Number(usersWithRequests.count) / totalUsers.count) * 100) : 0
        },
        {
          step: "Comunicación",
          count: Number(usersWithMessages.count),
          conversionRate: totalUsers.count > 0 ? Math.round((Number(usersWithMessages.count) / totalUsers.count) * 100) : 0
        },
        {
          step: "Pago Completado",
          count: Number(usersWithPayments.count),
          conversionRate: totalUsers.count > 0 ? Math.round((Number(usersWithPayments.count) / totalUsers.count) * 100) : 0
        }
      ];

      res.json(funnel);
    } catch (error) {
      console.error("Error fetching conversion funnel:", error);
      res.status(500).json({ error: "Failed to fetch conversion funnel analytics" });
    }
  });

  // Track analytics events
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { eventType, userId, sessionId, metadata } = req.body;

      await db.insert(analyticsEvents).values({
        eventType,
        userId,
        sessionId,
        metadata,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking analytics event:", error);
      res.status(500).json({ error: "Failed to track analytics event" });
    }
  });
}