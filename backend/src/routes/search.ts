import { Router } from "express";
import { serviceProviders } from "../shared/schema/serviceProviders";
import { providerLocations } from "../shared/schema/providerLocations";
import { services } from "../shared/schema/services";
import { categories } from "../shared/schema/categories";
import { db } from "../db";
import { sql, and, gte, lte, or, eq, ilike, desc, asc, inArray } from "drizzle-orm";

const router = Router();

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
    limit = 20,
    offset = 0
  } = query;

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Build base query conditions
  const conditions = [eq(serviceProviders.isActive, true)];

  // Text search
  if (searchQuery) {
    conditions.push(
      or(
        ilike(serviceProviders.businessName, `%${searchQuery}%`),
        ilike(serviceProviders.businessDescription, `%${searchQuery}%`)
      )
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
    conditions.push(gte(serviceProviders.averageRating, parseFloat(minRating)));
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
          email: serviceProviders.email,
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
        .map(provider => {
          const distance = haversineDistance(lat, lng, provider.latitude, provider.longitude);
          return { ...provider, distance };
        })
        .filter(provider => provider.distance <= radiusKm);

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
      email: serviceProviders.email,
      lastActive: serviceProviders.lastActive,
    })
    .from(serviceProviders)
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