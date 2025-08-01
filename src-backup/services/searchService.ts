import { db } from "../db";
import { serviceProviders, providerServices, serviceCategories, reviews, users, providerCredits } from "./shared/schema";
import { eq, and, or, ilike, gte, lte, sql, inArray, notInArray } from 'drizzle-orm';

export interface SearchFilters {
  // Text search
  query?: string;
  
  // Location filters
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  
  // Category and service filters
  categoryId?: number;
  categoryIds?: number[];
  serviceTypes?: string[];
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Rating filters
  minRating?: number;
  hasReviews?: boolean;
  
  // Provider attributes
  isVerified?: boolean;
  experienceYears?: number;
  languages?: string[];
  
  // Availability
  isActive?: boolean;
  hasCredits?: boolean;
  
  // Sorting
  sortBy?: 'relevance' | 'distance' | 'rating' | 'reviews' | 'price_low' | 'price_high' | 'experience' | 'response_time';
  
  // Pagination
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  providers: any[];
  total: number;
  facets: {
    cities: { name: string; count: number }[];
    categories: { id: number; name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

export class SearchService {
  // Haversine formula to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async searchProviders(filters: SearchFilters): Promise<SearchResult> {
    let query = db
      .select({
        provider: serviceProviders,
        user: users,
        credits: providerCredits,
        categories: sql<string>`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ${serviceCategories.id},
                'name', ${serviceCategories.name}
              )
            ) FILTER (WHERE ${serviceCategories.id} IS NOT NULL),
            '[]'::json
          )`.as('categories'),
        avgResponseTime: sql<number>`
          COALESCE(
            (SELECT AVG(EXTRACT(EPOCH FROM (lr.responded_at - sr.created_at)) / 3600)
             FROM lead_responses lr
             JOIN service_requests sr ON lr.service_request_id = sr.id
             WHERE lr.provider_id = ${serviceProviders.id}
             AND lr.responded_at > NOW() - INTERVAL '30 days'),
            0
          )`.as('avgResponseTime'),
        completedJobs: sql<number>`
          (SELECT COUNT(*)
           FROM service_requests
           WHERE provider_id = ${serviceProviders.id}
           AND status = 'completed')`.as('completedJobs'),
        distance: filters.latitude && filters.longitude ? 
          sql<number>`
            CASE 
              WHEN ${serviceProviders.city} IS NOT NULL THEN
                -- Simplified distance calculation using city coordinates
                -- In production, you'd have a city_coordinates table
                0
              ELSE NULL
            END
          `.as('distance') : sql<number>`0`.as('distance')
      })
      .from(serviceProviders)
      .leftJoin(users, eq(serviceProviders.userId, users.id))
      .leftJoin(providerCredits, eq(serviceProviders.id, providerCredits.providerId))
      .leftJoin(providerServices, eq(serviceProviders.id, providerServices.providerId))
      .leftJoin(serviceCategories, eq(providerServices.categoryId, serviceCategories.id));

    // Build WHERE conditions
    const conditions = [];

    // Active providers only (unless specified otherwise)
    if (filters.isActive !== false) {
      conditions.push(eq(serviceProviders.isActive, true));
    }

    // Text search across multiple fields
    if (filters.query) {
      const searchTerm = `%${filters.query}%`;
      conditions.push(
        or(
          ilike(serviceProviders.businessName, searchTerm),
          ilike(serviceProviders.description, searchTerm),
          ilike(serviceProviders.city, searchTerm),
          ilike(serviceCategories.name, searchTerm),
          ilike(providerServices.customServiceName, searchTerm),
          ilike(providerServices.description, searchTerm)
        )
      );
    }

    // Location filters
    if (filters.city) {
      conditions.push(ilike(serviceProviders.city, `%${filters.city}%`));
    }
    if (filters.province) {
      conditions.push(ilike(serviceProviders.province, `%${filters.province}%`));
    }

    // Category filters
    if (filters.categoryId) {
      conditions.push(eq(providerServices.categoryId, filters.categoryId));
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      conditions.push(inArray(providerServices.categoryId, filters.categoryIds));
    }

    // Price filters
    if (filters.minPrice !== undefined) {
      conditions.push(gte(serviceProviders.hourlyRate, filters.minPrice.toString()));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(serviceProviders.hourlyRate, filters.maxPrice.toString()));
    }

    // Rating filters
    if (filters.minRating !== undefined) {
      conditions.push(gte(serviceProviders.rating, filters.minRating.toString()));
    }
    if (filters.hasReviews) {
      conditions.push(sql`${serviceProviders.totalReviews} > 0`);
    }

    // Provider attribute filters
    if (filters.isVerified) {
      conditions.push(eq(serviceProviders.isVerified, true));
    }
    if (filters.experienceYears !== undefined) {
      conditions.push(gte(serviceProviders.experienceYears, filters.experienceYears));
    }

    // Credit availability filter
    if (filters.hasCredits) {
      conditions.push(sql`${providerCredits.currentCredits} > 0`);
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Group by provider to handle joins
    query = query.groupBy(
      serviceProviders.id,
      users.id,
      providerCredits.id
    );

    // Apply sorting
    let orderBy;
    switch (filters.sortBy) {
      case 'distance':
        if (filters.latitude && filters.longitude) {
          orderBy = sql`distance ASC`;
        }
        break;
      case 'rating':
        orderBy = sql`${serviceProviders.rating} DESC NULLS LAST`;
        break;
      case 'reviews':
        orderBy = sql`${serviceProviders.totalReviews} DESC`;
        break;
      case 'price_low':
        orderBy = sql`${serviceProviders.hourlyRate} ASC NULLS LAST`;
        break;
      case 'price_high':
        orderBy = sql`${serviceProviders.hourlyRate} DESC NULLS LAST`;
        break;
      case 'experience':
        orderBy = sql`${serviceProviders.experienceYears} DESC NULLS LAST`;
        break;
      case 'response_time':
        orderBy = sql`avgResponseTime ASC NULLS LAST`;
        break;
      case 'relevance':
      default:
        // Relevance scoring based on multiple factors
        orderBy = sql`
          (
            CASE WHEN ${serviceProviders.isVerified} THEN 10 ELSE 0 END +
            COALESCE(${serviceProviders.rating}, 0) * 2 +
            LEAST(${serviceProviders.totalReviews}, 50) * 0.1 +
            CASE WHEN ${providerCredits.currentCredits} > 0 THEN 5 ELSE 0 END
          ) DESC
        `;
    }

    if (orderBy) {
      query = query.orderBy(orderBy);
    }

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.limit(limit).offset(offset);

    // Execute main query
    const results = await query.execute();

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`COUNT(DISTINCT ${serviceProviders.id})` })
      .from(serviceProviders)
      .leftJoin(providerServices, eq(serviceProviders.id, providerServices.providerId))
      .leftJoin(serviceCategories, eq(providerServices.categoryId, serviceCategories.id))
      .leftJoin(providerCredits, eq(serviceProviders.id, providerCredits.providerId));

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const [{ count }] = await countQuery.execute();

    // Format results
    const providers = results.map(result => ({
      ...result.provider,
      user: result.user,
      categories: JSON.parse(result.categories as string),
      hasCredits: result.credits?.currentCredits > 0,
      avgResponseTime: result.avgResponseTime,
      completedJobs: result.completedJobs,
      distance: result.distance
    }));

    // Calculate facets for filtering UI
    const facets = await this.calculateFacets(conditions);

    return {
      providers,
      total: count,
      facets
    };
  }

  private async calculateFacets(baseConditions: any[]): Promise<SearchResult['facets']> {
    // City facets
    const cityFacets = await db
      .select({
        name: serviceProviders.city,
        count: sql<number>`COUNT(DISTINCT ${serviceProviders.id})`
      })
      .from(serviceProviders)
      .where(and(...baseConditions, sql`${serviceProviders.city} IS NOT NULL`))
      .groupBy(serviceProviders.city)
      .orderBy(sql`count DESC`)
      .limit(10)
      .execute();

    // Category facets
    const categoryFacets = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        count: sql<number>`COUNT(DISTINCT ${serviceProviders.id})`
      })
      .from(serviceCategories)
      .innerJoin(providerServices, eq(serviceCategories.id, providerServices.categoryId))
      .innerJoin(serviceProviders, eq(providerServices.providerId, serviceProviders.id))
      .where(and(...baseConditions))
      .groupBy(serviceCategories.id, serviceCategories.name)
      .orderBy(sql`count DESC`)
      .execute();

    // Price range facets
    const priceRanges = [
      { min: 0, max: 1000 },
      { min: 1000, max: 2500 },
      { min: 2500, max: 5000 },
      { min: 5000, max: 10000 },
      { min: 10000, max: null }
    ];

    const priceFacets = await Promise.all(
      priceRanges.map(async (range) => {
        const conditions = [...baseConditions];
        if (range.min !== null) {
          conditions.push(gte(serviceProviders.hourlyRate, range.min.toString()));
        }
        if (range.max !== null) {
          conditions.push(lte(serviceProviders.hourlyRate, range.max.toString()));
        }

        const [{ count }] = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${serviceProviders.id})` })
          .from(serviceProviders)
          .where(and(...conditions))
          .execute();

        return { min: range.min, max: range.max || 999999, count };
      })
    );

    // Rating facets
    const ratingFacets = await Promise.all(
      [5, 4, 3, 2, 1].map(async (rating) => {
        const [{ count }] = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${serviceProviders.id})` })
          .from(serviceProviders)
          .where(and(...baseConditions, gte(serviceProviders.rating, rating.toString())))
          .execute();

        return { rating, count };
      })
    );

    return {
      cities: cityFacets.filter(f => f.name),
      categories: categoryFacets,
      priceRanges: priceFacets,
      ratings: ratingFacets
    };
  }

  // Get search suggestions based on partial query
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const searchTerm = `${query}%`;

    // Get suggestions from different sources
    const [categories, cities, services] = await Promise.all([
      // Category suggestions
      db
        .select({ name: serviceCategories.name })
        .from(serviceCategories)
        .where(ilike(serviceCategories.name, searchTerm))
        .limit(limit / 3)
        .execute(),

      // City suggestions
      db
        .selectDistinct({ city: serviceProviders.city })
        .from(serviceProviders)
        .where(and(
          ilike(serviceProviders.city, searchTerm),
          sql`${serviceProviders.city} IS NOT NULL`
        ))
        .limit(limit / 3)
        .execute(),

      // Service name suggestions
      db
        .selectDistinct({ name: providerServices.customServiceName })
        .from(providerServices)
        .where(and(
          ilike(providerServices.customServiceName, searchTerm),
          sql`${providerServices.customServiceName} IS NOT NULL`
        ))
        .limit(limit / 3)
        .execute()
    ]);

    const suggestions = [
      ...categories.map(c => c.name),
      ...cities.map(c => c.city).filter(Boolean),
      ...services.map(s => s.name).filter(Boolean)
    ];

    return [...new Set(suggestions)].slice(0, limit);
  }
}