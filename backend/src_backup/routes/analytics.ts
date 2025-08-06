import type { Express, Request, Response } from "express";
import { db } from "../db.js";
import { 
  users, 
  serviceProviders, 
  serviceRequests, 
  payments, 
  reviews, 
  analyticsEvents,
  serviceCategories,
  messages,
  conversations,
  creditPurchases,
  leadResponses
} from "../shared/schema.js";

import { 
  sql, 
  eq, 
  and, 
  gte, 
  lte, 
  desc, 
  count, 
  sum, 
  avg,
  inArray
} from "drizzle-orm";
import { isAuthenticated } from "../replitAuth.js";

export function registerAnalyticsRoutes(app: Express) {
  // Platform Overview Statistics
  app.get("/api/analytics/platform-stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const [stats] = await db.select({
        totalUsers: count(users.id),
        totalProviders: count(serviceProviders.id),
        totalRequests: count(serviceRequests.id),
        completedRequests: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 ELSE NULL END)`,
        totalEarnings: sum(payments.amount),
        totalReviews: count(reviews.id),
      })
      .from(users)
      .leftJoin(serviceProviders, eq(users.id, serviceProviders.userId))
      .leftJoin(serviceRequests, eq(serviceRequests.customerId, users.id))
      .leftJoin(payments, eq(payments.serviceRequestId, serviceRequests.id))
      .leftJoin(reviews, eq(reviews.serviceRequestId, serviceRequests.id));

      res.json({
        totalUsers: Number(stats?.totalUsers || 0),
        totalProviders: Number(stats?.totalProviders || 0),
        totalRequests: Number(stats?.totalRequests || 0),
        totalCompletedJobs: Number(stats?.completedRequests || 0),
        totalEarnings: Number(stats?.totalEarnings || 0),
        totalReviews: Number(stats?.totalReviews || 0),
      });
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ error: "Failed to fetch platform statistics" });
    }
  });

  // Revenue Analytics
  app.get("/api/analytics/revenue", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const dailyRevenue = await db.select({
        date: sql<string>`TO_CHAR(${payments.createdAt}, 'YYYY-MM-DD')`,
        revenue: sum(payments.amount),
      })
      .from(payments)
      .where(eq(payments.status, 'succeeded'))
      .groupBy(sql`TO_CHAR(${payments.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${payments.createdAt}, 'YYYY-MM-DD')`);

      const paymentMethods = await db.select({
        name: payments.paymentMethod,
        amount: sum(payments.amount),
      })
      .from(payments)
      .where(eq(payments.status, 'succeeded'))
      .groupBy(payments.paymentMethod)
      .orderBy(desc(sql`amount`));

      const monthlyRevenue = await db.select({
        month: sql<string>`TO_CHAR(${payments.createdAt}, 'YYYY-MM')`,
        revenue: sum(payments.amount),
      })
      .from(payments)
      .where(eq(payments.status, 'succeeded'))
      .groupBy(sql`TO_CHAR(${payments.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${payments.createdAt}, 'YYYY-MM')`);

      interface DailyRevenueRow { date: string; revenue: number | null; }
      interface PaymentMethodRow { name: string | null; amount: number | null; }
      interface MonthlyRevenueRow { month: string; revenue: number | null; }

      res.json({
        daily: dailyRevenue.map((row: DailyRevenueRow) => ({
          date: row.date,
          revenue: Number(row.revenue || 0)
        })),
        paymentMethods: paymentMethods.map((row: PaymentMethodRow) => ({
          name: row.name || 'Desconocido',
          amount: Number(row.amount || 0)
        })),
        monthly: monthlyRevenue.map((row: MonthlyRevenueRow) => ({
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
  app.get("/api/analytics/user-growth", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const dailyGrowthRaw = await db.execute(sql`
        WITH user_dates AS (
          SELECT
            TO_CHAR("createdAt", 'YYYY-MM-DD') AS date,
            COUNT(*) FILTER (WHERE "userType" = 'customer') AS new_customers,
            COUNT(*) FILTER (WHERE "userType" = 'provider') AS new_providers,
            COUNT(*) AS new_users_total
          FROM users
          GROUP BY 1
        ),
        cumulative_users AS (
          SELECT
            date,
            SUM(new_customers) OVER (ORDER BY date) AS total_customers,
            SUM(new_providers) OVER (ORDER BY date) AS total_providers,
            SUM(new_users_total) OVER (ORDER BY date) AS total_users_platform
          FROM user_dates
        )
        SELECT
          ud.date,
          ud.new_customers,
          ud.new_providers,
          ud.new_users_total,
          cu.total_customers,
          cu.total_providers,
          cu.total_users_platform
        FROM user_dates ud
        JOIN cumulative_users cu ON ud.date = cu.date
        ORDER BY ud.date;
      `);
      
      const dailyGrowth = dailyGrowthRaw.rows;

      res.json(dailyGrowth.map((row: any) => ({
        date: row.date,
        newUsers: Number(row.new_users_total),
        newCustomers: Number(row.new_customers),
        newProviders: Number(row.new_providers),
        totalUsers: Number(row.total_users_platform),
        totalCustomers: Number(row.total_customers),
        totalProviders: Number(row.total_providers)
      })));
    } catch (error) {
      console.error("Error fetching user growth analytics:", error);
      res.status(500).json({ error: "Failed to fetch user growth analytics" });
    }
  });

  // Provider Performance Analytics
  app.get("/api/analytics/provider-performance", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const topProviders = await db.select({
        providerId: serviceProviders.id,
        businessName: serviceProviders.businessName,
        totalRequests: count(serviceRequests.id),
        completedRequests: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 ELSE NULL END)`,
        avgRating: avg(reviews.rating),
        totalEarnings: sum(payments.amount),
      })
      .from(serviceProviders)
      .leftJoin(serviceRequests, eq(serviceProviders.id, serviceRequests.providerId))
      .leftJoin(reviews, eq(serviceRequests.id, reviews.serviceRequestId))
      .leftJoin(payments, eq(serviceRequests.id, payments.serviceRequestId))
      .groupBy(serviceProviders.id, serviceProviders.businessName)
      .orderBy(desc(sql`totalRequests`))
      .limit(10);

      interface ProviderPerformanceRow {
        providerId: number;
        businessName: string;
        totalRequests: number | string;
        completedRequests: number | string | null;
        avgRating: number | string | null;
        totalEarnings: number | string | null;
      }

      res.json(topProviders.map((provider: ProviderPerformanceRow) => ({
        providerId: provider.providerId,
        businessName: provider.businessName,
        totalRequests: Number(provider.totalRequests),
        completedRequests: Number(provider.completedRequests || 0),
        completionRate: Number(provider.totalRequests) > 0 ? Math.round((Number(provider.completedRequests || 0) / Number(provider.totalRequests)) * 100) : 0,
        avgRating: provider.avgRating ? Number(provider.avgRating).toFixed(1) : null,
        totalEarnings: Number(provider.totalEarnings || 0)
      })));
    } catch (error) {
      console.error("Error fetching provider performance:", error);
      res.status(500).json({ error: "Failed to fetch provider performance analytics" });
    }
  });

  // Service Category Analytics
  app.get("/api/analytics/categories", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryStats = await db.select({
        categoryId: serviceCategories.id,
        categoryName: serviceCategories.name,
        requests: count(serviceRequests.id),
        completedRequests: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 ELSE NULL END)`,
        avgPrice: avg(serviceRequests.quotedPrice),
      })
      .from(serviceCategories)
      .leftJoin(serviceRequests, eq(serviceCategories.id, serviceRequests.categoryId))
      .groupBy(serviceCategories.id, serviceCategories.name)
      .orderBy(desc(sql`requests`));

      interface CategoryStatRow {
        categoryId: number;
        categoryName: string;
        requests: number | string;
        completedRequests: number | string;
        avgPrice: number | string | null;
      }

      res.json(categoryStats.map((stat: CategoryStatRow) => ({
        categoryId: stat.categoryId,
        categoryName: stat.categoryName,
        requests: Number(stat.requests),
        completedRequests: Number(stat.completedRequests),
        completionRate: Number(stat.requests) > 0 ? Math.round((Number(stat.completedRequests) / Number(stat.requests)) * 100) : 0,
        avgPrice: stat.avgPrice ? Number(stat.avgPrice).toFixed(2) : null
      })));
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({ error: "Failed to fetch category analytics" });
    }
  });

  // Conversion Funnel Analytics
  app.get("/api/analytics/conversion-funnel", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const totalRequests = (await db.select({ count: count(serviceRequests.id) }).from(serviceRequests))[0]?.count || 0;
      const acceptedRequests = (await db.select({ count: count(serviceRequests.id) }).from(serviceRequests).where(eq(serviceRequests.status, 'accepted')))[0]?.count || 0;
      const completedRequests = (await db.select({ count: count(serviceRequests.id) }).from(serviceRequests).where(eq(serviceRequests.status, 'completed')))[0]?.count || 0;
      const reviewedRequests = (await db.select({ count: count(reviews.id) }).from(reviews))[0]?.count || 0;

      res.json({
        totalRequests: Number(totalRequests),
        acceptedRequests: Number(acceptedRequests),
        completedRequests: Number(completedRequests),
        reviewedRequests: Number(reviewedRequests),
      });
    } catch (error) {
      console.error("Error fetching conversion funnel:", error);
      res.status(500).json({ error: "Failed to fetch conversion funnel analytics" });
    }
  });

  // Credit System Analytics
  app.get("/api/analytics/credits", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const creditStats = (await db.select({
        totalPurchased: sum(creditPurchases.credits),
        totalRevenue: sum(creditPurchases.amount),
        purchaseCount: count(creditPurchases.id),
      }).from(creditPurchases)
      .where(eq(creditPurchases.status, 'completed')))[0];

      const creditsUsed = (await db.select({
        totalUsed: sum(leadResponses.creditsUsed),
        responseCount: count(leadResponses.id),
      }).from(leadResponses))[0];

      const dailyCreditPurchases = await db.select({
        date: sql<string>`TO_CHAR(${creditPurchases.createdAt}, 'YYYY-MM-DD')`,
        credits: sum(creditPurchases.credits),
        revenue: sum(creditPurchases.amount),
        purchases: count(creditPurchases.id),
      })
      .from(creditPurchases)
      .where(eq(creditPurchases.status, 'completed'))
      .groupBy(sql`TO_CHAR(${creditPurchases.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${creditPurchases.createdAt}, 'YYYY-MM-DD')`);

      const topPackages = await db.select({
        credits: creditPurchases.credits,
        count: count(creditPurchases.id),
        revenue: sum(creditPurchases.amount),
      })
      .from(creditPurchases)
      .where(eq(creditPurchases.status, 'completed'))
      .groupBy(creditPurchases.credits)
      .orderBy(desc(sql`count`))
      .limit(5);

      interface DailyCreditPurchaseRow { date: string; credits: number | null; revenue: number | null; purchases: number; }
      interface TopPackageRow { credits: number; count: number; revenue: number | null; }

      res.json({
        summary: {
          totalPurchased: Number(creditStats?.totalPurchased || 0),
          totalRevenue: Number(creditStats?.totalRevenue || 0),
          purchaseCount: Number(creditStats?.purchaseCount || 0),
          totalUsed: Number(creditsUsed?.totalUsed || 0),
          responseCount: Number(creditsUsed?.responseCount || 0),
          utilizationRate: Number(creditStats?.totalPurchased || 0) > 0 ? 
            Math.round((Number(creditsUsed?.totalUsed || 0) / Number(creditStats?.totalPurchased || 0)) * 100) : 0,
        },
        dailyTrend: dailyCreditPurchases.map((row: DailyCreditPurchaseRow) => ({
          date: row.date,
          credits: Number(row.credits || 0),
          revenue: Number(row.revenue || 0),
          purchases: row.purchases,
        })),
        topPackages: topPackages.map((pkg: TopPackageRow) => ({
          credits: pkg.credits,
          count: pkg.count,
          revenue: Number(pkg.revenue || 0),
        })),
      });
    } catch (error) {
      console.error("Error fetching credit analytics:", error);
      res.status(500).json({ error: "Failed to fetch credit analytics" });
    }
  });

  // Real-time Platform Metrics
  app.get("/api/analytics/realtime", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const activeUsers = (await db.select({ count: count(users.id) }).from(users).where(gte(users.createdAt, oneDayAgo)))[0];
      const newRequests24h = (await db.select({ count: count(serviceRequests.id) }).from(serviceRequests).where(gte(serviceRequests.createdAt, oneDayAgo)))[0];
      const newMessages24h = (await db.select({ count: count(messages.id) }).from(messages).where(gte(messages.createdAt, oneDayAgo)))[0];
      const newProviderResponses24h = (await db.select({ count: count(leadResponses.id) }).from(leadResponses).where(gte(leadResponses.respondedAt, oneDayAgo)))[0];

      const avgResponseTime = (await db.select({
        avg_hours: sql<number>`AVG(EXTRACT(EPOCH FROM (COALESCE(${serviceRequests.acceptedAt}, ${serviceRequests.completedAt}) - ${serviceRequests.createdAt})) / 3600)`
      }).from(serviceRequests).where(and(
        inArray(serviceRequests.status, ['accepted', 'completed']),
        gte(serviceRequests.createdAt, oneDayAgo)
      )))[0];

      res.json({
        activeUsers: Number(activeUsers?.count ?? 0),
        newRequests24h: Number(newRequests24h?.count ?? 0),
        newMessages24h: Number(newMessages24h?.count ?? 0),
        newResponses24h: Number(newProviderResponses24h?.count ?? 0),
        avgResponseTimeHours: avgResponseTime?.avg_hours ? Number(avgResponseTime.avg_hours).toFixed(1) : null,
      });
    } catch (error) {
      console.error("Error fetching realtime analytics:", error);
      res.status(500).json({ error: "Failed to fetch realtime analytics" });
    }
  });

  // Track analytics events
  app.post("/api/analytics/track", async (req: Request, res: Response) => {
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

