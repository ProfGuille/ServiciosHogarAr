import { Router } from "express";
import { db } from "../db.js";
import { 
  wordpressContent,
  seoMetadata,
  wordpressApiKeys,
  contentSyncLog,
  serviceCategories,
  serviceProviders,
  users
} from "@shared/schema";

import { 
  sql, 
  eq, 
  and, 
  desc, 
  count 
} from "drizzle-orm";
import { isAuthenticated } from "../replitAuth.js";
import crypto from "crypto";

const router = Router();

// Middleware to validate WordPress API key
const validateWordPressKey = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const [keyRecord] = await db
      .select()
      .from(wordpressApiKeys)
      .where(and(
        eq(wordpressApiKeys.apiKey, apiKey),
        eq(wordpressApiKeys.isActive, true)
      ));

    if (!keyRecord) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      return res.status(401).json({ error: "API key expired" });
    }

    // Update last used timestamp
    await db
      .update(wordpressApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(wordpressApiKeys.id, keyRecord.id));

    req.wordpressKey = keyRecord;
    next();
  } catch (error) {
    console.error("Error validating WordPress API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin: Manage WordPress API Keys
router.post("/api/admin/wordpress/api-keys", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user[0] || user[0].userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { keyName, permissions, expiresAt } = req.body;
    
    // Generate secure API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const [newKey] = await db
      .insert(wordpressApiKeys)
      .values({
        keyName,
        apiKey,
        permissions: permissions || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    res.json({ 
      id: newKey.id, 
      keyName: newKey.keyName,
      apiKey: newKey.apiKey,
      permissions: newKey.permissions,
      expiresAt: newKey.expiresAt 
    });
  } catch (error) {
    console.error("Error creating WordPress API key:", error);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

// Admin: List API Keys
router.get("/api/admin/wordpress/api-keys", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user[0] || user[0].userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const keys = await db
      .select({
        id: wordpressApiKeys.id,
        keyName: wordpressApiKeys.keyName,
        permissions: wordpressApiKeys.permissions,
        isActive: wordpressApiKeys.isActive,
        lastUsedAt: wordpressApiKeys.lastUsedAt,
        expiresAt: wordpressApiKeys.expiresAt,
        createdAt: wordpressApiKeys.createdAt,
      })
      .from(wordpressApiKeys)
      .orderBy(desc(wordpressApiKeys.createdAt));

    res.json(keys);
  } catch (error) {
    console.error("Error fetching WordPress API keys:", error);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// WordPress: Get Service Categories for syncing
router.get("/api/wordpress/categories", validateWordPressKey, async (req, res) => {
  try {
    const categories = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        description: serviceCategories.description,
        icon: serviceCategories.icon,
        isActive: serviceCategories.isActive,
        createdAt: serviceCategories.createdAt,
      })
      .from(serviceCategories)
      .where(eq(serviceCategories.isActive, true))
      .orderBy(serviceCategories.name);

    // Log sync activity
    await db.insert(contentSyncLog).values({
      syncType: "export",
      contentType: "category",
      status: "success",
      syncData: { categories: categories.length }
    });

    res.json({
      success: true,
      data: categories,
      meta: {
        total: categories.length,
        synced_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching categories for WordPress:", error);
    
    await db.insert(contentSyncLog).values({
      syncType: "export",
      contentType: "category",
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });
    
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// WordPress: Get Service Providers for syncing
router.get("/api/wordpress/providers", validateWordPressKey, async (req, res) => {
  try {
    const { limit = 50, offset = 0, verified_only = 'true' } = req.query;

    const providers = await db
      .select({
        id: serviceProviders.id,
        userId: serviceProviders.userId,
        businessName: serviceProviders.businessName,
        description: serviceProviders.description,
        experienceYears: serviceProviders.experienceYears,
        serviceAreas: serviceProviders.serviceAreas,
        hourlyRate: serviceProviders.hourlyRate,
        isVerified: serviceProviders.isVerified,
        rating: serviceProviders.rating,
        totalReviews: serviceProviders.totalReviews,
        profileImageUrl: serviceProviders.profileImageUrl,
        city: serviceProviders.city,
        province: serviceProviders.province,
        createdAt: serviceProviders.createdAt,
      })
      .from(serviceProviders)
      .where(and(
        eq(serviceProviders.isActive, true),
        verified_only === 'true' ? eq(serviceProviders.isVerified, true) : undefined
      ))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(desc(serviceProviders.rating));

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(serviceProviders)
      .where(and(
        eq(serviceProviders.isActive, true),
        verified_only === 'true' ? eq(serviceProviders.isVerified, true) : undefined
      ));

    // Log sync activity
    await db.insert(contentSyncLog).values({
      syncType: "export",
      contentType: "provider",
      status: "success",
      syncData: { providers: providers.length, total: totalCount }
    });

    res.json({
      success: true,
      data: providers,
      meta: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        synced_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching providers for WordPress:", error);
    
    await db.insert(contentSyncLog).values({
      syncType: "export",
      contentType: "provider",
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });
    
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// WordPress: Sync content FROM WordPress
router.post("/api/wordpress/content/sync", validateWordPressKey, async (req, res) => {
  try {
    const { contentType, wordpressId, title, slug, content, excerpt, featuredImage, seo } = req.body;

    if (!contentType || !wordpressId || !title || !slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if content already exists
    const [existingContent] = await db
      .select()
      .from(wordpressContent)
      .where(eq(wordpressContent.wordpressId, wordpressId));

    const contentData = {
      wordpressId,
      contentType,
      title,
      slug,
      content: content || null,
      excerpt: excerpt || null,
      featuredImage: featuredImage || null,
      metaTitle: seo?.title || null,
      metaDescription: seo?.description || null,
      metaKeywords: seo?.keywords || null,
      canonicalUrl: seo?.canonical || null,
      isPublished: true,
      publishedAt: new Date(),
      lastSyncAt: new Date(),
      updatedAt: new Date(),
    };

    let result;
    if (existingContent) {
      // Update existing content
      [result] = await db
        .update(wordpressContent)
        .set(contentData)
        .where(eq(wordpressContent.id, existingContent.id))
        .returning();
    } else {
      // Insert new content
      [result] = await db
        .insert(wordpressContent)
        .values(contentData)
        .returning();
    }

    // Log sync activity
    await db.insert(contentSyncLog).values({
      syncType: existingContent ? "update" : "import",
      contentType,
      contentId: result.id,
      wordpressId,
      status: "success",
      syncData: { title, slug }
    });

    res.json({
      success: true,
      data: result,
      action: existingContent ? "updated" : "created"
    });
  } catch (error) {
    console.error("Error syncing content from WordPress:", error);
    
    await db.insert(contentSyncLog).values({
      syncType: "import",
      contentType: req.body.contentType || "unknown",
      wordpressId: req.body.wordpressId,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });
    
    res.status(500).json({ error: "Failed to sync content" });
  }
});

// Get SEO metadata for a specific page
router.get("/api/seo/:pageType/:identifier?", async (req, res) => {
  try {
    const { pageType, identifier } = req.params;

    const [seoData] = await db
      .select()
      .from(seoMetadata)
      .where(and(
        eq(seoMetadata.pageType, pageType),
        identifier ? eq(seoMetadata.identifier, identifier) : sql`identifier IS NULL`,
        eq(seoMetadata.isActive, true)
      ));

    if (!seoData) {
      // Return default SEO data if none found
      return res.json({
        title: "ServiciosHogar.com.ar - Servicios profesionales para el hogar",
        description: "Encuentra profesionales verificados para servicios del hogar en Argentina. Plomería, electricidad, limpieza y más.",
        keywords: "servicios hogar, profesionales, argentina, plomería, electricidad, limpieza",
        canonicalUrl: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        structuredData: null
      });
    }

    res.json({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      canonicalUrl: seoData.canonicalUrl,
      ogTitle: seoData.ogTitle,
      ogDescription: seoData.ogDescription,
      ogImage: seoData.ogImage,
      structuredData: seoData.structuredData
    });
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    res.status(500).json({ error: "Failed to fetch SEO metadata" });
  }
});

// Admin: Manage SEO metadata
router.post("/api/admin/seo", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user[0] || user[0].userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { 
      pageType, 
      identifier, 
      title, 
      description, 
      keywords, 
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      structuredData
    } = req.body;

    // Check if SEO metadata already exists
    const [existing] = await db
      .select()
      .from(seoMetadata)
      .where(and(
        eq(seoMetadata.pageType, pageType),
        identifier ? eq(seoMetadata.identifier, identifier) : sql`identifier IS NULL`
      ));

    const seoData = {
      pageType,
      identifier: identifier || null,
      title,
      description,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      structuredData,
      updatedAt: new Date(),
    };

    let result;
    if (existing) {
      [result] = await db
        .update(seoMetadata)
        .set(seoData)
        .where(eq(seoMetadata.id, existing.id))
        .returning();
    } else {
      [result] = await db
        .insert(seoMetadata)
        .values(seoData)
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error("Error managing SEO metadata:", error);
    res.status(500).json({ error: "Failed to manage SEO metadata" });
  }
});

// WordPress: Get sync logs (for debugging)
router.get("/api/wordpress/sync-logs", validateWordPressKey, async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const logs = await db
      .select()
      .from(contentSyncLog)
      .orderBy(desc(contentSyncLog.createdAt))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("Error fetching sync logs:", error);
    res.status(500).json({ error: "Failed to fetch sync logs" });
  }
});

export default router;

