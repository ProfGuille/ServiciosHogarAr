import { Router } from "express";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerLocations } from "../shared/schema/providerLocations.js";
import { services } from "../shared/schema/services.js";
import { categories } from "../shared/schema/categories.js";
import { users } from "../shared/schema/users.js";
import { db } from "../db.js";
import { sql, and, gte, lte, or, eq, ilike, desc, asc, inArray, SQL } from "drizzle-orm";

const router = Router();

// Type for provider query result
type ProviderQueryResult = {
  id: number;
  businessName: string | null;
  businessDescription: string | null;
  averageRating: string | null;
  totalReviews: number;
  isVerified: boolean;
  credits: number | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string;
  lastActive: Date | null;
  latitude?: number;
  longitude?: number;
  address?: string | null;
};

// Haversine distance calculation function
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Endpoint de búsqueda general
router.get("/", async (req, res) => {
  try {
    // For now, redirect to providers search
    const results = await searchProviders(req.query);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

// Búsqueda específica de proveedores con geolocalización (MVP3 Phase 3)
router.get("/providers", async (req, res) => {
  try {
    const results = await searchProviders(req.query);
    res.json(results);
  } catch (error) {
    console.error('Provider search error:', error);
    res.status(500).json({ error: "Error en búsqueda de proveedores" });
  }
});

async function searchProviders(query: any) {
  const {
    q: searchQuery,
    city,
    province,
    categoryIds,
    minPrice,
    maxPrice,
    minRating,
    hasReviews,
    verified,
    hasCredits,
    sortBy = 'relevance',
    latitude,
    longitude,
    radius,
    // New filters for Phase 4
    availability, // 'today', 'tomorrow', 'week', 'anytime'
    responseTime, // 'fast' (<2h), 'medium' (<24h), 'slow' (>24h)
    experienceYears,
    languages,
    limit = 20,
    offset = 0
  } = query;

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Build base query conditions
  const conditions = [eq(serviceProviders.isActive, true)];

  // Text search with PostgreSQL full-text search
  if (searchQuery) {
    // Use PostgreSQL full-text search for better relevance
    const searchTerms = searchQuery.split(' ').map((term: string) => term.trim()).filter(Boolean);
    const tsQuery = searchTerms.join(' & ');
    
    conditions.push(
      or(
        // Full-text search on business name and description
        sql`to_tsvector('spanish', COALESCE(${serviceProviders.businessName}, '')) @@ to_tsquery('spanish', ${tsQuery})`,
        sql`to_tsvector('spanish', COALESCE(${serviceProviders.businessDescription}, '')) @@ to_tsquery('spanish', ${tsQuery})`,
        // Fallback to ILIKE for partial matches
        ilike(serviceProviders.businessName, `%${searchQuery}%`),
        ilike(serviceProviders.businessDescription || serviceProviders.businessName, `%${searchQuery}%`)
      ) as SQL
    );
  }

  // Location filters
  if (city) {
    conditions.push(ilike(serviceProviders.city, `%${city}%`));
  }
  if (province) {
    conditions.push(ilike(serviceProviders.province, `%${province}%`));
  }

  // Category filters
  if (categoryIds) {
    const categoryIdsArray = Array.isArray(categoryIds) 
      ? categoryIds.map(id => parseInt(id)) 
      : [parseInt(categoryIds)];
    // Note: This would need a join with services or provider-category relation
    // For now, we'll skip this filter
  }

  // Rating and review filters
  if (minRating) {
    conditions.push(gte(serviceProviders.averageRating, minRating));
  }
  if (hasReviews === 'true') {
    conditions.push(gte(serviceProviders.totalReviews, 1));
  }

  // Verification filter
  if (verified === 'true') {
    conditions.push(eq(serviceProviders.isVerified, true));
  }

  // Credits filter
  if (hasCredits === 'true') {
    conditions.push(gte(serviceProviders.credits, 1));
  }

  // Experience filter
  if (experienceYears) {
    const minExperience = parseInt(experienceYears);
    if (!isNaN(minExperience)) {
      conditions.push(gte(serviceProviders.experienceYears, minExperience));
    }
  }

  // Response time filter (based on lastActive)
  if (responseTime) {
    const now = new Date();
    switch (responseTime) {
      case 'fast': // Active in last 2 hours
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        conditions.push(gte(serviceProviders.lastActive, twoHoursAgo));
        break;
      case 'medium': // Active in last 24 hours
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        conditions.push(gte(serviceProviders.lastActive, oneDayAgo));
        break;
      // 'slow' or no filter for longer periods
    }
  }

  // Languages filter (would need to be implemented with proper schema)
  // For now, skip this filter

  // Availability filter (simplified - would need proper booking system)
  if (availability && availability !== 'anytime') {
    // This is a simplified version - in a real system you'd check actual calendar availability
    // For now, we'll filter by providers who have been active recently
    const recentlyActive = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last week
    conditions.push(gte(serviceProviders.lastActive, recentlyActive));
  }

  // Price filters (would need to be implemented based on services pricing)
  // For now, we'll skip these

  let providersQuery;

  // If location-based search is requested
  if (latitude && longitude && radius) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm)) {
      // Calculate bounding box for optimization
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      const minLat = lat - latDelta;
      const maxLat = lat + latDelta;
      const minLng = lng - lngDelta;
      const maxLng = lng + lngDelta;

      // Query with location join
      providersQuery = await db
        .select({
          id: serviceProviders.id,
          businessName: serviceProviders.businessName,
          businessDescription: serviceProviders.businessDescription,
          averageRating: serviceProviders.averageRating,
          totalReviews: serviceProviders.totalReviews,
          isVerified: serviceProviders.isVerified,
          credits: serviceProviders.credits,
          city: serviceProviders.city,
          province: serviceProviders.province,
          phone: serviceProviders.phone,
          email: users.email,
          lastActive: serviceProviders.lastActive,
          latitude: sql<number>`CAST(${providerLocations.latitude} AS DECIMAL(10,8))`,
          longitude: sql<number>`CAST(${providerLocations.longitude} AS DECIMAL(11,8))`,
          address: providerLocations.address,
        })
        .from(serviceProviders)
        .innerJoin(
          providerLocations,
          eq(serviceProviders.id, providerLocations.providerId)
        )
        .innerJoin(
          users,
          eq(serviceProviders.userId, users.id)
        )
        .where(
          and(
            ...conditions,
            gte(sql`CAST(${providerLocations.latitude} AS DECIMAL(10,8))`, minLat),
            lte(sql`CAST(${providerLocations.latitude} AS DECIMAL(10,8))`, maxLat),
            gte(sql`CAST(${providerLocations.longitude} AS DECIMAL(11,8))`, minLng),
            lte(sql`CAST(${providerLocations.longitude} AS DECIMAL(11,8))`, maxLng)
          )
        );

      // Calculate distances and filter by radius
      const providersWithDistance = providersQuery
        .map((provider: ProviderQueryResult & { latitude: number; longitude: number }) => {
          const distance = haversineDistance(lat, lng, provider.latitude, provider.longitude);
          return { ...provider, distance };
        })
        .filter((provider: ProviderQueryResult & { distance: number }) => provider.distance <= radiusKm);

      // Sort by distance or other criteria
      let sortedProviders = [...providersWithDistance];
      switch (sortBy) {
        case 'distance':
          sortedProviders.sort((a, b) => a.distance - b.distance);
          break;
        case 'rating':
          sortedProviders.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;
        case 'reviews':
          sortedProviders.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
          break;
        default:
          sortedProviders.sort((a, b) => a.distance - b.distance);
      }

      // Apply pagination
      const paginatedResults = sortedProviders.slice(offsetNum, offsetNum + limitNum);

      return {
        data: paginatedResults,
        total: sortedProviders.length,
        page: Math.floor(offsetNum / limitNum) + 1,
        totalPages: Math.ceil(sortedProviders.length / limitNum),
        hasLocation: true,
        searchRadius: radiusKm,
        center: { latitude: lat, longitude: lng }
      };
    }
  }

  // Regular search without location
  let orderBy;
  switch (sortBy) {
    case 'rating':
      orderBy = desc(serviceProviders.averageRating);
      break;
    case 'reviews':
      orderBy = desc(serviceProviders.totalReviews);
      break;
    case 'newest':
      orderBy = desc(serviceProviders.createdAt);
      break;
    case 'response_time':
      orderBy = desc(serviceProviders.lastActive);
      break;
    case 'experience':
      orderBy = desc(serviceProviders.experienceYears);
      break;
    default:
      orderBy = desc(serviceProviders.lastActive);
  }

  providersQuery = await db
    .select({
      id: serviceProviders.id,
      businessName: serviceProviders.businessName,
      businessDescription: serviceProviders.businessDescription,
      averageRating: serviceProviders.averageRating,
      totalReviews: serviceProviders.totalReviews,
      isVerified: serviceProviders.isVerified,
      credits: serviceProviders.credits,
      city: serviceProviders.city,
      province: serviceProviders.province,
      phone: serviceProviders.phone,
      email: users.email,
      lastActive: serviceProviders.lastActive,
    })
    .from(serviceProviders)
    .innerJoin(
      users,
      eq(serviceProviders.userId, users.id)
    )
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offsetNum);

  // Get total count for pagination
  const totalQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceProviders)
    .where(and(...conditions));

  const total = totalQuery[0]?.count || 0;

  return {
    data: providersQuery,
    total,
    page: Math.floor(offsetNum / limitNum) + 1,
    totalPages: Math.ceil(total / limitNum),
    hasLocation: false
  };
}

export default router;