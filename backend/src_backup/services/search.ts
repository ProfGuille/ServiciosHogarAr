import { db } from "../db.js";
import { 
  serviceProviders, 
  providerServices, 
  serviceCategories, 
  reviews,
  serviceRequests,
  providerCredits,
  providerLocations
} from '../shared/schema.js';

import { sql, and, or, gte, lte, like, eq, inArray, desc, asc } from 'drizzle-orm';

// Importamos tipos para tipar parámetros explícitamente
import type {
  Provider,
  Category,
  City,
  Business,
  Rating,
} from '../shared/schema.js';

export interface SearchFilters {
  query?: string;
  categoryId?: number;
  city?: string;
  province?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  verified?: boolean;
  experienceYears?: number;
  // Location-based filters
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  // Availability filters
  availableNow?: boolean;
  responseTimeHours?: number;
  // Language filters
  language?: string;
  // Sorting
  sortBy?: 'relevance' | 'distance' | 'price_low' | 'price_high' | 'rating' | 'reviews' | 'response_time';
  // Pagination
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  providers: Provider[];
  total: number;
  facets: {
    categories: { id: number; name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    cities: { name: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

export class SearchService {
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static async searchProviders(filters: SearchFilters): Promise<SearchResult> {
    const conditions = [];
    
    // Text search across multiple fields
    if (filters.query) {
      const searchPattern = `%${filters.query}%`;
      conditions.push(
        or(
          like(serviceProviders.businessName, searchPattern),
          like(serviceProviders.description, searchPattern),
          like(serviceProviders.city, searchPattern),
          sql`EXISTS (
            SELECT 1 FROM ${providerServices} ps
            JOIN ${serviceCategories} sc ON ps.category_id = sc.id
            WHERE ps.provider_id = ${serviceProviders.id}
            AND (
              sc.name ILIKE ${searchPattern}
              OR ps.custom_service_name ILIKE ${searchPattern}
              OR ps.description ILIKE ${searchPattern}
            )
          )`
        )
      );
    }

    // Category filter
    if (filters.categoryId) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${providerServices} ps
          WHERE ps.provider_id = ${serviceProviders.id}
          AND ps.category_id = ${filters.categoryId}
          AND ps.is_active = true
        )`
      );
    }

    // Location filters
    if (filters.city) {
      conditions.push(eq(serviceProviders.city, filters.city));
    }
    if (filters.province) {
      conditions.push(eq(serviceProviders.province, filters.province));
    }

    // Price range filters
    if (filters.priceMin !== undefined) {
      conditions.push(gte(serviceProviders.hourlyRate, filters.priceMin.toString()));
    }
    if (filters.priceMax !== undefined) {
      conditions.push(lte(serviceProviders.hourlyRate, filters.priceMax.toString()));
    }

    // Rating filter
    if (filters.ratingMin !== undefined) {
      conditions.push(gte(serviceProviders.rating, filters.ratingMin.toString()));
    }

    // Verification filter
    if (filters.verified !== undefined) {
      conditions.push(eq(serviceProviders.isVerified, filters.verified));
    }

    // Experience filter
    if (filters.experienceYears !== undefined) {
      conditions.push(gte(serviceProviders.experienceYears, filters.experienceYears));
    }

    // Active providers only
    conditions.push(eq(serviceProviders.isActive, true));

    // Build the main query
    let query = db
      .select({
        provider: serviceProviders,
        categories: sql<string>`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', sc.id,
                'name', sc.name,
                'icon', sc.icon
              )
            ) FILTER (WHERE sc.id IS NOT NULL),
            '[]'::json
          )`,
        avgResponseTime: sql<number>`
          (
            SELECT AVG(EXTRACT(EPOCH FROM (lr.responded_at - sr.created_at)) / 3600)
            FROM ${serviceRequests} sr
            JOIN ${leadResponses} lr ON lr.service_request_id = sr.id
            WHERE sr.provider_id = ${serviceProviders.id}
            AND sr.created_at > NOW() - INTERVAL '30 days'
          )`,
        completionRate: sql<number>`
          (
            SELECT 
              CASE 
                WHEN COUNT(*) > 0 
                THEN (COUNT(*) FILTER (WHERE status = 'completed'))::float / COUNT(*)::float * 100
                ELSE 0
              END
            FROM ${serviceRequests}
            WHERE provider_id = ${serviceProviders.id}
            AND created_at > NOW() - INTERVAL '90 days'
          )`,
        hasCredits: sql<boolean>`
          EXISTS (
            SELECT 1 FROM ${providerCredits}
            WHERE provider_id = ${serviceProviders.id}
            AND current_credits > 0
          )`,
        distance: filters.latitude && filters.longitude 
          ? sql<number>`
              (
                SELECT ${SearchService.calculateDistance(
                  filters.latitude!,
                  filters.longitude!,
                  sql`COALESCE(pl.latitude::float, 0)`,
                  sql`COALESCE(pl.longitude::float, 0)`
                )}
                FROM ${providerLocations} pl
                WHERE pl.provider_id = ${serviceProviders.id}
                ORDER BY pl.timestamp DESC
                LIMIT 1
              )`
          : sql<null>`NULL`
      })
      .from(serviceProviders)
      .leftJoin(providerServices, eq(providerServices.providerId, serviceProviders.id))
      .leftJoin(serviceCategories, eq(serviceCategories.id, providerServices.categoryId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(serviceProviders.id);

    // Location-based filtering
    if (filters.latitude && filters.longitude && filters.radiusKm) {
      query = query.having(
        sql`
          (
            SELECT ${SearchService.calculateDistance(
              filters.latitude,
              filters.longitude,
              sql`COALESCE(pl.latitude::float, 0)`,
              sql`COALESCE(pl.longitude::float, 0)`
            )}
            FROM ${providerLocations} pl
            WHERE pl.provider_id = ${serviceProviders.id}
            ORDER BY pl.timestamp DESC
            LIMIT 1
          ) <= ${filters.radiusKm}
        `
      );
    }

    // Response time filter
    if (filters.responseTimeHours) {
      query = query.having(
        sql`
          (
            SELECT AVG(EXTRACT(EPOCH FROM (lr.responded_at - sr.created_at)) / 3600)
            FROM ${serviceRequests} sr
            JOIN ${leadResponses} lr ON lr.service_request_id = sr.id
            WHERE sr.provider_id = ${serviceProviders.id}
            AND sr.created_at > NOW() - INTERVAL '30 days'
          ) <= ${filters.responseTimeHours}
        `
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'distance':
        if (filters.latitude && filters.longitude) {
          query = query.orderBy(asc(sql`distance`));
        }
        break;
      case 'price_low':
        query = query.orderBy(asc(serviceProviders.hourlyRate));
        break;
      case 'price_high':
        query = query.orderBy(desc(serviceProviders.hourlyRate));
        break;
      case 'rating':
        query = query.orderBy(desc(serviceProviders.rating), desc(serviceProviders.totalReviews));
        break;
      case 'reviews':
        query = query.orderBy(desc(serviceProviders.totalReviews));
        break;
      case 'response_time':
        query = query.orderBy(asc(sql`avgResponseTime`));
        break;
      default: // relevance
        query = query.orderBy(
          desc(sql`CASE WHEN ${serviceProviders.isVerified} THEN 1 ELSE 0 END`),
          desc(sql`CASE WHEN hasCredits THEN 1 ELSE 0 END`),
          desc(serviceProviders.rating),
          desc(sql`completionRate`)
        );
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.limit(limit).offset(offset);

    // Execute main query
    const providers = await query;

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(DISTINCT ${serviceProviders.id})` })
      .from(serviceProviders)
      .leftJoin(providerServices, eq(providerServices.providerId, serviceProviders.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const [{ count: total }] = await countQuery;

    // Get facets for filtering
    const facets = await this.getFacets(conditions);

    return {
      providers: providers.map((p: { provider: Provider; categories: any; avgResponseTime: number; completionRate: number; hasCredits: boolean; distance: number | null }) => ({
        ...p.provider,
        categories: p.categories,
        avgResponseTime: p.avgResponseTime,
        completionRate: p.completionRate,
        hasCredits: p.hasCredits,
        distance: p.distance
      })),
      total,
      facets
    };
  }

  private static async getFacets(baseConditions: any[]) {
    // Category facets
    const categoryFacets = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        count: sql<number>`count(DISTINCT ${serviceProviders.id})`
      })
      .from(serviceCategories)
      .innerJoin(providerServices, eq(providerServices.categoryId, serviceCategories.id))
      .innerJoin(serviceProviders, eq(serviceProviders.id, providerServices.providerId))
      .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
      .groupBy(serviceCategories.id, serviceCategories.name)
      .orderBy(desc(sql`count`));

    // Price range facets - corregimos null max por Number.POSITIVE_INFINITY  
    const priceRanges = [
      { min: 0, max: 1000 },
      { min: 1000, max: 2500 },
      { min: 2500, max: 5000 },
      { min: 5000, max: 10000 },
      { min: 10000, max: Number.POSITIVE_INFINITY }
    ];

    const priceFacets = await Promise.all(
      priceRanges.map(async (range: { min: number, max: number }) => {
        const conditions = [...baseConditions];
        if (range.min !== null) {
          conditions.push(gte(serviceProviders.hourlyRate, range.min.toString()));
        }
        if (range.max !== Number.POSITIVE_INFINITY) {
          conditions.push(lte(serviceProviders.hourlyRate, range.max.toString()));
        }

        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(serviceProviders)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          min: range.min,
          max: range.max,
          count: result.count as number
        };
      })
    );

    // City facets
    const cityFacets = await db
      .select({
        name: serviceProviders.city,
        count: sql<number>`count(*)`
      })
      .from(serviceProviders)
      .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
      .groupBy(serviceProviders.city)
      .orderBy(desc(sql`count`))
      .limit(10);

    // Aplicamos filtro y tipado para eliminar posibles nulls en cityFacets
    const filteredCityFacets = cityFacets.filter((c: { name: string | null }) => c.name !== null) as { name: string; count: number }[];

    // Rating facets
    const ratingFacets = await db
      .select({
        rating: sql<number>`FLOOR(${serviceProviders.rating}::numeric)`,
        count: sql<number>`count(*)`
      })
      .from(serviceProviders)
      .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
      .groupBy(sql`FLOOR(${serviceProviders.rating}::numeric)`)
      .orderBy(desc(sql`rating`));

    return {
      categories: categoryFacets,
      priceRanges: priceFacets,
      cities: filteredCityFacets,
      ratings: ratingFacets
    };
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    
    // Get category suggestions
    const categories = await db
      .select({ name: serviceCategories.name })
      .from(serviceCategories)
      .where(like(serviceCategories.name, `%${query}%`))
      .limit(5);
    
    categories.forEach((c: { name: string }) => suggestions.add(c.name));

    // Get city suggestions
    const cities = await db
      .select({ city: serviceProviders.city })
      .from(serviceProviders)
      .where(like(serviceProviders.city, `%${query}%`))
      .groupBy(serviceProviders.city)
      .limit(5);
    
    cities.forEach((c: { city: string | null }) => c.city && suggestions.add(c.city));

    // Get business name suggestions
    const businesses = await db
      .select({ name: serviceProviders.businessName })
      .from(serviceProviders)
      .where(like(serviceProviders.businessName, `%${query}%`))
      .limit(5);
    
    businesses.forEach((b: { name: string | null }) => b.name && suggestions.add(b.name));

    return Array.from(suggestions).slice(0, 10);
  }
}

