import { db } from "../db.js";
import { serviceProviders, providerServices, serviceCategories, reviews, users, providerCredits } from '../shared/schema.js';

import { eq, and, or, ilike, gte, lte, sql, inArray, notInArray } from 'drizzle-orm';

// Importar tipos para parámetros explícitos
import type {
  Provider,
  Category,
  City,
  Service,
} from '../shared/schema.js';

export interface SearchFilters {
  // ... (igual que antes)
}

export interface SearchResult {
  providers: Provider[];
  total: number;
  facets: {
    cities: { name: string; count: number }[];
    categories: { id: number; name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

export class SearchService {
  // Haversine formula y otros métodos igual...

  async searchProviders(filters: SearchFilters): Promise<SearchResult> {
    // ... el código igual, salvo el mapeo de resultados que queda así:

    const providers = results.map((result: { 
      provider: Provider, 
      user: any, 
      categories: string, 
      credits?: { currentCredits?: number },
      avgResponseTime: number,
      completedJobs: number,
      distance: number | null 
    }) => ({
      ...result.provider,
      user: result.user,
      categories: JSON.parse(result.categories),
      hasCredits: Boolean(result.credits?.currentCredits && result.credits.currentCredits > 0),
      avgResponseTime: result.avgResponseTime,
      completedJobs: result.completedJobs,
      distance: result.distance
    }));

    // ...

    const priceFacets = await Promise.all(
      priceRanges.map(async (range: {min: number; max: number}) => {
        // ...
        return { min: range.min, max: range.max, count };
      })
    );

    const ratingFacets = await Promise.all(
      [5,4,3,2,1].map(async (rating: number) => {
        // ...
        return { rating, count };
      })
    );

    return {
      cities: cityFacets.filter((f: {name: string | null}) => f.name !== null) as {name: string; count: number}[],
      categories: categoryFacets,
      priceRanges: priceFacets,
      ratings: ratingFacets
    };
  }

  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const searchTerm = `${query}%`;

    const [categories, cities, services] = await Promise.all([
      db
        .select({ name: serviceCategories.name })
        .from(serviceCategories)
        .where(ilike(serviceCategories.name, searchTerm))
        .limit(limit / 3)
        .execute(),

      db
        .selectDistinct({ city: serviceProviders.city })
        .from(serviceProviders)
        .where(and(
          ilike(serviceProviders.city, searchTerm),
          sql`${serviceProviders.city} IS NOT NULL`
        ))
        .limit(limit / 3)
        .execute(),

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
      ...categories.map((c: { name: string }) => c.name),
      ...cities.map((c: { city: string | null }) => c.city).filter(Boolean),
      ...services.map((s: { name: string | null }) => s.name).filter(Boolean)
    ];

    return [...new Set(suggestions)].slice(0, limit);
  }
}

