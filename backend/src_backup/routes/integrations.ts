import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db.js";
import {
  thirdPartyPartners,
  partnerApiKeys,
  apiRequestLogs,
  webhookEvents,
  partnerIntegrations,
  partnerAnalytics,
  users,
  serviceProviders,
  serviceRequests,
  payments,
  reviews,
} from "../shared/schema.js";

import {
  sql,
  eq,
  and,
  desc,
  count,
  sum,
  avg,
  gte,
  like,
} from "drizzle-orm";
// import { isAuthenticated } from "../replitAuth.js";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";

const router = Router();

// Rate limiting middleware
const createRateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Middleware to validate partner API key
const validatePartnerApiKey = async (req: Request & { partner?: any; apiKey?: any; startTime?: number }, res: Response, next: NextFunction) => {
  try {
    const apiKeyValue = req.headers["x-api-key"] as string;
    req.startTime = Date.now();

    if (!apiKeyValue) {
      return res.status(401).json({ error: "API key missing" });
    }

    // Lookup API key in DB
    const [apiKey] = await db
      .select()
      .from(partnerApiKeys)
      .where(eq(partnerApiKeys.key, apiKeyValue))
      .limit(1);

    if (!apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Fetch partner
    const [partner] = await db
      .select()
      .from(thirdPartyPartners)
      .where(eq(thirdPartyPartners.id, apiKey.partnerId))
      .limit(1);

    if (!partner) {
      return res.status(401).json({ error: "Partner not found" });
    }

    req.apiKey = apiKey;
    req.partner = partner;

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Log API requests for analytics
const logApiRequest = async (
  partnerId: number | null,
  apiKeyId: number | null,
  req: Request & { startTime?: number },
  statusCode: number,
  responseTime: number,
  errorMessage?: string
) => {
  try {
    await db.insert(apiRequestLogs).values({
      partnerId,
      apiKeyId,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode,
      responseTime,
      errorMessage: errorMessage || null,
      requestSize: req.socket.bytesRead,
      responseSize: req.socket.bytesWritten,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log API request:", error);
  }
};

// Apply rate limiting to all /api/v1 routes
router.use("/api/v1", createRateLimiter(60 * 1000, 1000));

// Admin: Partner management routes (implement según necesites)
router.get("/api/admin/partners", isAuthenticated, async (req: Request & { user?: any }, res) => {
  // Implementar la lógica
  res.status(501).json({ error: "Not implemented" });
});

router.post("/api/admin/partners", isAuthenticated, async (req: Request & { user?: any }, res) => {
  // Implementar la lógica
  res.status(501).json({ error: "Not implemented" });
});

router.post("/api/admin/partners/:partnerId/api-keys", isAuthenticated, async (req: Request & { user?: any }, res) => {
  // Implementar la lógica
  res.status(501).json({ error: "Not implemented" });
});

// Partner API v1 - Get Categories
router.get("/api/v1/categories", validatePartnerApiKey, async (req: Request & { partner?: any; apiKey?: any; startTime?: number }, res) => {
  try {
    const startTime = req.startTime ?? Date.now();

    const categories = await db
      .select({
        id: sql`${serviceRequests.categoryId}`,
        name: sql`CASE 
            WHEN ${serviceRequests.categoryId} = 1 THEN 'Plomería'
            WHEN ${serviceRequests.categoryId} = 2 THEN 'Electricidad'
            WHEN ${serviceRequests.categoryId} = 3 THEN 'Limpieza'
            WHEN ${serviceRequests.categoryId} = 4 THEN 'Carpintería'
            WHEN ${serviceRequests.categoryId} = 5 THEN 'Pintura'
            ELSE 'Otros'
          END`,
        requestCount: count(),
        avgPrice: avg(payments.amount),
      })
      .from(serviceRequests)
      .leftJoin(payments, eq(serviceRequests.id, payments.serviceRequestId))
      .groupBy(serviceRequests.categoryId)
      .orderBy(desc(count()));

    await logApiRequest(req.partner?.id ?? null, req.apiKey?.id ?? null, req, 200, Date.now() - startTime);

    res.json({
      success: true,
      data: categories,
      meta: {
        total: categories.length,
        version: "v1",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const responseTime = Date.now() - (req.startTime ?? Date.now());
    await logApiRequest(req.partner?.id ?? null, req.apiKey?.id ?? null, req, 500, responseTime, error instanceof Error ? error.message : "Unknown error");
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Partner API v1 - Get Service Providers
router.get("/api/v1/providers", validatePartnerApiKey, async (req: Request & { partner?: any; apiKey?: any; startTime?: number }, res) => {
  try {
    const startTime = req.startTime ?? Date.now();
    const { limit = "50", offset = "0", verified = "true", city } = req.query;

    const whereConditions = [eq(serviceProviders.isActive, true)];

    if (verified === "true") {
      whereConditions.push(eq(serviceProviders.isVerified, true));
    }

    if (city && typeof city === "string") {
      whereConditions.push(like(serviceProviders.city, `%${city}%`));
    }

    const providers = await db
      .select({
        id: serviceProviders.id,
        businessName: serviceProviders.businessName,
        description: serviceProviders.description,
        city: serviceProviders.city,
        province: serviceProviders.province,
        rating: serviceProviders.rating,
        totalReviews: serviceProviders.totalReviews,
        isVerified: serviceProviders.isVerified,
        experienceYears: serviceProviders.experienceYears,
        hourlyRate: serviceProviders.hourlyRate,
        createdAt: serviceProviders.createdAt,
      })
      .from(serviceProviders)
      .where(and(...whereConditions))
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy(desc(serviceProviders.rating));

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(serviceProviders)
      .where(and(...whereConditions));

    await logApiRequest(req.partner?.id ?? null, req.apiKey?.id ?? null, req, 200, Date.now() - startTime);

    res.json({
      success: true,
      data: providers,
      meta: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        version: "v1",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const responseTime = Date.now() - (req.startTime ?? Date.now());
    await logApiRequest(req.partner?.id ?? null, req.apiKey?.id ?? null, req, 500, responseTime, error instanceof Error ? error.message : "Unknown error");
    console.error("Error fetching providers:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// Admin: API Usage Analytics
router.get("/api/admin/integration-analytics", isAuthenticated, async (req: Request & { user?: any }, res) => {
  try {
    const userId = req.user?.claims.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0] || user[0].userType !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { period = "30d" } = req.query;
    const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const usage = await db
      .select({
        partnerId: apiRequestLogs.partnerId,
        partnerName: thirdPartyPartners.name,
        totalRequests: count(),
        successfulRequests: sql<number>`COUNT(CASE WHEN ${apiRequestLogs.statusCode} < 400 THEN 1 END)`,
        errorRequests: sql<number>`COUNT(CASE WHEN ${apiRequestLogs.statusCode} >= 400 THEN 1 END)`,
        avgResponseTime: avg(apiRequestLogs.responseTime),
        totalBandwidth: sum(sql`COALESCE(${apiRequestLogs.requestSize}, 0) + COALESCE(${apiRequestLogs.responseSize}, 0)`),
      })
      .from(apiRequestLogs)
      .innerJoin(thirdPartyPartners, eq(apiRequestLogs.partnerId, thirdPartyPartners.id))
      .where(gte(apiRequestLogs.createdAt, startDate))
      .groupBy(apiRequestLogs.partnerId, thirdPartyPartners.name)
      .orderBy(desc(count()));

    res.json({
      success: true,
      data: usage.map((item) => ({
        partnerId: item.partnerId,
        partnerName: item.partnerName,
        totalRequests: Number(item.totalRequests),
        successfulRequests: Number(item.successfulRequests),
        errorRequests: Number(item.errorRequests),
        successRate:
          item.totalRequests > 0
            ? Math.round((Number(item.successfulRequests) / Number(item.totalRequests)) * 100)
            : 0,
        avgResponseTime: item.avgResponseTime ? Math.round(Number(item.avgResponseTime)) : 0,
        totalBandwidth: Number(item.totalBandwidth || 0),
      })),
      meta: {
        period,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching integration analytics:", error);
    res.status(500).json({ error: "Failed to fetch integration analytics" });
  }
});

export default router;

