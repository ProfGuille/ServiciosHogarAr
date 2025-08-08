import { Router } from "express";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { services } from "../shared/schema/services.js";
import { categories } from "../shared/schema/categories.js";
import { users } from "../shared/schema/users.js";
import { db } from "../db.js";
import { sql, ilike, or, desc, eq, and } from "drizzle-orm";

const router = Router();

// Search suggestions endpoint for autocomplete
router.get("/autocomplete", async (req, res) => {
  try {
    const { q, limit: queryLimit = 10 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json({ suggestions: [] });
    }

    const searchQuery = q.trim();
    if (searchQuery.length < 2) {
      return res.json({ suggestions: [] });
    }

    const limitNum = Math.min(parseInt(queryLimit as string) || 10, 20);

    // Get suggestions from multiple sources
    const suggestions = await Promise.all([
      // Business names
      db
        .select({
          type: sql<string>`'business'`,
          text: serviceProviders.businessName,
          category: sql<string>`null`,
          count: sql<number>`1`
        })
        .from(serviceProviders)
        .where(
          and(
            eq(serviceProviders.isActive, true),
            ilike(serviceProviders.businessName, `%${searchQuery}%`)
          )
        )
        .limit(5),

      // Services
      db
        .select({
          type: sql<string>`'service'`,
          text: services.name,
          category: categories.name,
          count: sql<number>`1`
        })
        .from(services)
        .innerJoin(categories, eq(services.categoryId, categories.id))
        .where(ilike(services.name, `%${searchQuery}%`))
        .limit(5),

      // Categories
      db
        .select({
          type: sql<string>`'category'`,
          text: categories.name,
          category: sql<string>`null`,
          count: sql<number>`count(*)`
        })
        .from(categories)
        .where(ilike(categories.name, `%${searchQuery}%`))
        .limit(3),

      // Cities (from provider data)
      db
        .select({
          type: sql<string>`'city'`,
          text: serviceProviders.city,
          category: sql<string>`null`,
          count: sql<number>`count(*)`
        })
        .from(serviceProviders)
        .where(
          and(
            eq(serviceProviders.isActive, true),
            ilike(serviceProviders.city, `%${searchQuery}%`)
          )
        )
        .groupBy(serviceProviders.city)
        .limit(3)
    ]);

    // Flatten and deduplicate suggestions
    const allSuggestions = suggestions.flat()
      .filter((suggestion: any) => suggestion.text)
      .reduce((unique: Map<string, any>, item: any) => {
        const key = `${item.type}-${item.text}`;
        if (!unique.has(key)) {
          unique.set(key, item);
        }
        return unique;
      }, new Map());

    // Sort by relevance (exact matches first, then by type priority)
    const sortedSuggestions = Array.from(allSuggestions.values())
      .sort((a: any, b: any) => {
        const aExact = a.text?.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
        const bExact = b.text?.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
        
        if (aExact !== bExact) return bExact - aExact;
        
        // Type priority: business > service > category > city
        const typePriority: Record<string, number> = { business: 4, service: 3, category: 2, city: 1 };
        return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
      })
      .slice(0, limitNum);

    res.json({
      suggestions: sortedSuggestions,
      query: searchQuery
    });

  } catch (error) {
    console.error('Autocomplete search error:', error);
    res.status(500).json({ error: "Error en sugerencias de búsqueda" });
  }
});

// Popular searches endpoint
router.get("/popular", async (req, res) => {
  try {
    // Get most searched categories and services
    const popularCategories = await db
      .select({
        type: sql<string>`'category'`,
        text: categories.name,
        icon: sql<string>`null`,
        count: sql<number>`count(sp.id)`
      })
      .from(categories)
      .leftJoin(services, eq(categories.id, services.categoryId))
      .leftJoin(serviceProviders as any, eq(services.id, sql`sp.id`)) // Assuming provider-service relation
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sql`count(sp.id)`))
      .limit(8);

    // Common search terms (hardcoded for now, could be from analytics)
    const popularTerms = [
      { type: 'term', text: 'plomero urgente', count: 150 },
      { type: 'term', text: 'electricista 24hs', count: 120 },
      { type: 'term', text: 'limpieza hogar', count: 110 },
      { type: 'term', text: 'jardinería', count: 90 },
      { type: 'term', text: 'pintor interior', count: 85 },
      { type: 'term', text: 'aire acondicionado', count: 80 }
    ];

    res.json({
      popular: [...popularCategories, ...popularTerms]
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10)
    });

  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ error: "Error obteniendo búsquedas populares" });
  }
});

// Recent searches (stored in session/localStorage on frontend)
router.get("/recent", async (req, res) => {
  try {
    // This would typically come from user's search history
    // For now, return empty array - frontend will handle localStorage
    res.json({ recent: [] });
  } catch (error) {
    console.error('Recent searches error:', error);
    res.status(500).json({ error: "Error obteniendo búsquedas recientes" });
  }
});

export default router;