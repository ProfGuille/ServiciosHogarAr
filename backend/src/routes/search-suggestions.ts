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

    // Mock suggestions for development/testing when database is not available
    const mockSuggestions = [
      { type: 'service', text: 'plomería', category: 'Servicios del hogar', count: 150 },
      { type: 'service', text: 'plomero', category: 'Servicios del hogar', count: 145 },
      { type: 'service', text: 'electricista', category: 'Servicios del hogar', count: 120 },
      { type: 'service', text: 'electricidad', category: 'Servicios del hogar', count: 115 },
      { type: 'service', text: 'limpieza', category: 'Servicios del hogar', count: 110 },
      { type: 'service', text: 'jardinería', category: 'Servicios del hogar', count: 90 },
      { type: 'service', text: 'carpintería', category: 'Servicios del hogar', count: 75 },
      { type: 'service', text: 'pintura', category: 'Servicios del hogar', count: 80 },
      { type: 'service', text: 'gasista', category: 'Servicios del hogar', count: 60 },
      { type: 'service', text: 'albañil', category: 'Servicios del hogar', count: 55 },
    ];

    // Filter suggestions based on query
    const filteredSuggestions = mockSuggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Exact matches first
        const aExact = a.text.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
        const bExact = b.text.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0;
        
        if (aExact !== bExact) return bExact - aExact;
        
        // Then by popularity
        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, limitNum);

    // If database is available, try to get real suggestions
    if (db) {
      try {
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

        return res.json({
          suggestions: sortedSuggestions,
          query: searchQuery
        });
        
      } catch (dbError) {
        console.error('Database search error, falling back to mock data:', dbError);
        // Fall through to mock suggestions
      }
    }

    res.json({
      suggestions: filteredSuggestions,
      query: searchQuery,
      mock: true
    });

  } catch (error) {
    console.error('Autocomplete search error:', error);
    res.status(500).json({ error: "Error en sugerencias de búsqueda" });
  }
});

// Popular searches endpoint
router.get("/popular", async (req, res) => {
  try {
    // Common search terms (hardcoded for now, could be from analytics)
    const popularTerms = [
      { type: 'term', text: 'plomero', count: 150 },
      { type: 'term', text: 'plomería', count: 145 },
      { type: 'term', text: 'electricista', count: 120 },
      { type: 'term', text: 'electricidad', count: 115 },
      { type: 'term', text: 'limpieza', count: 110 },
      { type: 'term', text: 'limpieza hogar', count: 100 },
      { type: 'term', text: 'jardinería', count: 90 },
      { type: 'term', text: 'jardinero', count: 85 },
      { type: 'term', text: 'pintor', count: 85 },
      { type: 'term', text: 'pintura', count: 80 },
      { type: 'term', text: 'carpintero', count: 75 },
      { type: 'term', text: 'carpintería', count: 70 },
      { type: 'term', text: 'aire acondicionado', count: 65 },
      { type: 'term', text: 'gasista', count: 60 },
      { type: 'term', text: 'albañil', count: 55 },
      { type: 'term', text: 'albañilería', count: 50 }
    ];

    // If database is available, try to get most searched categories and services
    if (db) {
      try {
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

        const combinedResults = [...popularCategories, ...popularTerms]
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 10);

        return res.json({
          popular: combinedResults
        });
      } catch (dbError) {
        console.error('Database error in popular searches, falling back to mock data:', dbError);
        // Fall through to mock data
      }
    }

    // Fallback to mock data when database is not available
    res.json({
      popular: popularTerms.slice(0, 10),
      mock: true
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