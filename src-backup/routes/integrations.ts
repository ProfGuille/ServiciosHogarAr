import type { Express } from "express";
import { db } from "../db";
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
} from "./shared/schema";
import { 
  sql, 
  eq, 
  and, 
  desc, 
  count, 
  sum, 
  avg,
  gte,
  lte,
  like,
  inArray
} from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import crypto from "crypto";
import { rateLimit } from 'express-rate-limit';

// Rate limiting for API endpoints
const createRateLimiter = (windowMs: number, max: number) => rateLimit({
  windowMs,
  max,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate partner API key
const validatePartnerApiKey = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const startTime = Date.now();
    
    // Get API key and partner information
    const [keyRecord] = await db
      .select({
        id: partnerApiKeys.id,
        partnerId: partnerApiKeys.partnerId,
        keyName: partnerApiKeys.keyName,
        scopes: partnerApiKeys.scopes,
        rateLimit: partnerApiKeys.rateLimit,
        monthlyRequestCount: partnerApiKeys.monthlyRequestCount,
        isActive: partnerApiKeys.isActive,
        expiresAt: partnerApiKeys.expiresAt,
        partner: {
          id: thirdPartyPartners.id,
          name: thirdPartyPartners.name,
          status: thirdPartyPartners.status,
          monthlyRequestLimit: thirdPartyPartners.monthlyRequestLimit,
          ipWhitelist: thirdPartyPartners.ipWhitelist,
          allowedScopes: thirdPartyPartners.allowedScopes,
        }
      })
      .from(partnerApiKeys)
      .innerJoin(thirdPartyPartners, eq(partnerApiKeys.partnerId, thirdPartyPartners.id))
      .where(and(
        eq(partnerApiKeys.apiKey, apiKey),
        eq(partnerApiKeys.isActive, true),
        eq(thirdPartyPartners.status, 'active')
      ));

    if (!keyRecord) {
      await logApiRequest(null, null, req, 401, Date.now() - startTime, "Invalid API key");
      return res.status(401).json({ error: "Invalid or inactive API key" });
    }

    // Check expiration
    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      await logApiRequest(keyRecord.partner.id, keyRecord.id, req, 401, Date.now() - startTime, "API key expired");
      return res.status(401).json({ error: "API key expired" });
    }

    // Check IP whitelist
    const clientIP = req.ip || req.connection.remoteAddress;
    if (keyRecord.partner.ipWhitelist && keyRecord.partner.ipWhitelist.length > 0) {
      if (!keyRecord.partner.ipWhitelist.includes(clientIP)) {
        await logApiRequest(keyRecord.partner.id, keyRecord.id, req, 403, Date.now() - startTime, "IP not whitelisted");
        return res.status(403).json({ error: "IP address not authorized" });
      }
    }

    // Check monthly request limit
    if (keyRecord.monthlyRequestCount >= keyRecord.partner.monthlyRequestLimit) {
      await logApiRequest(keyRecord.partner.id, keyRecord.id, req, 429, Date.now() - startTime, "Monthly limit exceeded");
      return res.status(429).json({ error: "Monthly request limit exceeded" });
    }

    // Update usage counters
    await db
      .update(partnerApiKeys)
      .set({ 
        lastUsedAt: new Date(),
        requestCount: sql`${partnerApiKeys.requestCount} + 1`,
        monthlyRequestCount: sql`${partnerApiKeys.monthlyRequestCount} + 1`
      })
      .where(eq(partnerApiKeys.id, keyRecord.id));

    req.partner = keyRecord.partner;
    req.apiKey = keyRecord;
    req.startTime = startTime;
    next();
  } catch (error) {
    console.error("Error validating partner API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Log API requests for analytics
const logApiRequest = async (
  partnerId: number | null, 
  apiKeyId: number | null, 
  req: any, 
  statusCode: number, 
  responseTime: number, 
  errorMessage?: string
) => {
  try {
    await db.insert(apiRequestLogs).values({
      partnerId,
      apiKeyId,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      requestSize: JSON.stringify(req.body || {}).length,
      errorMessage,
      requestData: req.method !== 'GET' ? req.body : req.query,
    });
  } catch (error) {
    console.error("Error logging API request:", error);
  }
};

export function registerIntegrationRoutes(app: Express) {
  
  // Apply rate limiting to all API routes
  app.use('/api/v1', createRateLimiter(60 * 1000, 1000)); // 1000 requests per minute
  
  // Admin: Partner Management
  app.get("/api/admin/partners", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user[0] || user[0].userType !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const partners = await db
        .select({
          id: thirdPartyPartners.id,
          name: thirdPartyPartners.name,
          slug: thirdPartyPartners.slug,
          partnerType: thirdPartyPartners.partnerType,
          status: thirdPartyPartners.status,
          isVerified: thirdPartyPartners.isVerified,
          monthlyRequestLimit: thirdPartyPartners.monthlyRequestLimit,
          contractStartDate: thirdPartyPartners.contractStartDate,
          contractEndDate: thirdPartyPartners.contractEndDate,
          createdAt: thirdPartyPartners.createdAt,
        })
        .from(thirdPartyPartners)
        .orderBy(desc(thirdPartyPartners.createdAt));

      reson(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.post("/api/admin/partners", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user[0] || user[0].userType !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { 
        name, 
        slug, 
        description, 
        website, 
        contactEmail, 
        partnerType, 
        monthlyRequestLimit,
        contractStartDate,
        contractEndDate,
        allowedScopes,
        webhookUrl,
        ipWhitelist
      } = req.body;

      const [partner] = await db
        .insert(thirdPartyPartners)
        .values({
          name,
          slug,
          description,
          website,
          contactEmail,
          partnerType,
          monthlyRequestLimit: monthlyRequestLimit || 10000,
          contractStartDate: contractStartDate ? new Date(contractStartDate) : null,
          contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
          allowedScopes: allowedScopes || [],
          webhookUrl,
          ipWhitelist: ipWhitelist || [],
          status: 'pending',
        })
        .returning();

      res.status(201).json(partner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  // Admin: Generate API Keys for Partners
  app.post("/api/admin/partners/:partnerId/api-keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user[0] || user[0].userType !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { partnerId } = req.params;
      const { keyName, scopes, rateLimit: keyRateLimit, expiresAt } = req.body;

      // Generate secure API key
      const apiKey = crypto.randomBytes(32).toString('hex');
      const apiSecret = crypto.randomBytes(32).toString('hex');

      const [newKey] = await db
        .insert(partnerApiKeys)
        .values({
          partnerId: parseInt(partnerId),
          keyName,
          apiKey,
          apiSecret,
          scopes: scopes || [],
          rateLimit: keyRateLimit || 100,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        })
        .returning();

      reson({
        id: newKey.id,
        keyName: newKey.keyName,
        apiKey: newKey.apiKey,
        apiSecret: newKey.apiSecret,
        scopes: newKey.scopes,
        rateLimit: newKey.rateLimit,
        expiresAt: newKey.expiresAt,
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  // Partner API v1 - Get Categories
  app.get("/api/v1/categories", validatePartnerApiKey, async (req: any, res) => {
    try {
      const startTime = req.startTime;
      
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

      await logApiRequest(req.partner.id, req.apiKey.id, req, 200, Date.now() - startTime);
      
      reson({
        success: true,
        data: categories,
        meta: {
          total: categories.length,
          version: "v1",
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const responseTime = Date.now() - req.startTime;
      await logApiRequest(req.partner.id, req.apiKey.id, req, 500, responseTime, error instanceof Error ? error.message : "Unknown error");
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Partner API v1 - Get Service Providers
  app.get("/api/v1/providers", validatePartnerApiKey, async (req: any, res) => {
    try {
      const startTime = req.startTime;
      const { limit = 50, offset = 0, verified = 'true', city } = req.query;

      let whereConditions = [eq(serviceProviders.isActive, true)];
      
      if (verified === 'true') {
        whereConditions.push(eq(serviceProviders.isVerified, true));
      }
      
      if (city) {
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
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string))
        .orderBy(desc(serviceProviders.rating));

      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(serviceProviders)
        .where(and(...whereConditions));

      await logApiRequest(req.partner.id, req.apiKey.id, req, 200, Date.now() - startTime);

      reson({
        success: true,
        data: providers,
        meta: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          version: "v1",
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const responseTime = Date.now() - req.startTime;
      await logApiRequest(req.partner.id, req.apiKey.id, req, 500, responseTime, error instanceof Error ? error.message : "Unknown error");
      console.error("Error fetching providers:", error);
      res.status(500).json({ error: "Failed to fetch providers" });
    }
  });

  // Partner API v1 - Get Service Requests
  app.get("/api/v1/requests", validatePartnerApiKey, async (req: any, res) => {
    try {
      const startTime = req.startTime;
      const { limit = 50, offset = 0, status, categoryId } = req.query;

      // Check if partner has access to requests data
      if (!req.apiKey.scopes.includes('requests:read')) {
        await logApiRequest(req.partner.id, req.apiKey.id, req, 403, Date.now() - startTime, "Insufficient scope");
        return res.status(403).json({ error: "Insufficient permissions for this endpoint" });
      }

      let whereConditions = [];
      
      if (status) {
        whereConditions.push(eq(serviceRequests.status, status));
      }
      
      if (categoryId) {
        whereConditions.push(eq(serviceRequests.categoryId, parseInt(categoryId as string)));
      }

      const requests = await db
        .select({
          id: serviceRequests.id,
          title: serviceRequests.title,
          description: serviceRequests.description,
          status: serviceRequests.status,
          budget: serviceRequests.budget,
          city: serviceRequests.city,
          categoryId: serviceRequests.categoryId,
          createdAt: serviceRequests.createdAt,
          scheduledDate: serviceRequests.scheduledDate,
        })
        .from(serviceRequests)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string))
        .orderBy(desc(serviceRequests.createdAt));

      await logApiRequest(req.partner.id, req.apiKey.id, req, 200, Date.now() - startTime);

      reson({
        success: true,
        data: requests,
        meta: {
          total: requests.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          version: "v1",
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const responseTime = Date.now() - req.startTime;
      await logApiRequest(req.partner.id, req.apiKey.id, req, 500, responseTime, error instanceof Error ? error.message : "Unknown error");
      console.error("Error fetching requests:", error);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // Partner API v1 - Analytics Data
  app.get("/api/v1/analytics", validatePartnerApiKey, async (req: any, res) => {
    try {
      const startTime = req.startTime;
      const { period = '30d' } = req.query;

      // Check analytics scope
      if (!req.apiKey.scopes.includes('analytics:read')) {
        await logApiRequest(req.partner.id, req.apiKey.id, req, 403, Date.now() - startTime, "Insufficient scope");
        return res.status(403).json({ error: "Insufficient permissions for analytics data" });
      }

      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Platform statistics
      const [stats] = await db
        .select({
          totalProviders: count(serviceProviders.id),
          activeProviders: sql<number>`COUNT(CASE WHEN ${serviceProviders.isActive} = true THEN 1 END)`,
          totalRequests: count(serviceRequests.id),
          completedRequests: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
        })
        .from(serviceProviders)
        .leftJoin(serviceRequests, gte(serviceRequests.createdAt, startDate));

      await logApiRequest(req.partner.id, req.apiKey.id, req, 200, Date.now() - startTime);

      reson({
        success: true,
        data: {
          totalProviders: Number(stats.totalProviders),
          activeProviders: Number(stats.activeProviders),
          totalRequests: Number(stats.totalRequests),
          completedRequests: Number(stats.completedRequests),
          period,
        },
        meta: {
          version: "v1",
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const responseTime = Date.now() - req.startTime;
      await logApiRequest(req.partner.id, req.apiKey.id, req, 500, responseTime, error instanceof Error ? error.message : "Unknown error");
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Admin: View API Usage Analytics
  app.get("/api/admin/integration-analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user[0] || user[0].userType !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { period = '30d' } = req.query;
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // API usage by partner
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

      reson({
        success: true,
        data: usage.map(item => ({
          partnerId: item.partnerId,
          partnerName: item.partnerName,
          totalRequests: Number(item.totalRequests),
          successfulRequests: Number(item.successfulRequests),
          errorRequests: Number(item.errorRequests),
          successRate: item.totalRequests > 0 ? Math.round((Number(item.successfulRequests) / Number(item.totalRequests)) * 100) : 0,
          avgResponseTime: item.avgResponseTime ? Math.round(Number(item.avgResponseTime)) : 0,
          totalBandwidth: Number(item.totalBandwidth || 0),
        })),
        meta: {
          period,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error("Error fetching integration analytics:", error);
      res.status(500).json({ error: "Failed to fetch integration analytics" });
    }
  });

  // Webhook endpoint for receiving partner events
  app.post("/api/webhooks/partner/:partnerId", async (req, res) => {
    try {
      const { partnerId } = req.params;
      
      // Verify partner exists and has webhook integration
      const [partner] = await db
        .select()
        .from(thirdPartyPartners)
        .where(and(
          eq(thirdPartyPartners.id, parseInt(partnerId)),
          eq(thirdPartyPartners.status, 'active')
        ));

      if (!partner) {
        return res.status(404).json({ error: "Partner not found or inactive" });
      }

      // Process webhook payload
      const webhookData = req.body;
      
      // Log webhook receipt
      console.log(`Received webhook from partner ${partner.name}:`, webhookData);

      // Here you would process the webhook based on the partner's integration type
      // For example: update user data, sync orders, process payments, etc.

      reson({ 
        success: true, 
        message: "Webhook received and processed",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
}