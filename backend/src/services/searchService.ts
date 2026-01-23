import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerLocations } from "../shared/schema/providerLocations.js";
import { users } from "../shared/schema/users.js";
import { sql, and, or, ilike, gte, lte, desc, asc, eq, SQL } from "drizzle-orm";
import { haversineDistance, calculateBoundingBox } from "../utils/geoUtils.js";

export const searchService = {
  async searchProviders(query: any) {
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
      sortBy = "relevance",
      latitude,
      longitude,
      radius,
      availability,
      responseTime,
      experienceYears,
      languages,
      limit = 20,
      offset = 0,
    } = query;

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const conditions: SQL[] = [eq(serviceProviders.isActive, true)];

    // TEXT SEARCH
    if (searchQuery) {
      const searchTerms = searchQuery
        .split(" ")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const tsQuery = searchTerms.join(" & ");

      conditions.push(
        or(
          sql`to_tsvector('spanish', COALESCE(${serviceProviders.businessName}, '')) @@ to_tsquery('spanish', ${tsQuery})`,
          sql`to_tsvector('spanish', COALESCE(${serviceProviders.description}, '')) @@ to_tsquery('spanish', ${tsQuery})`,
          ilike(serviceProviders.businessName, `%${searchQuery}%`),
          ilike(serviceProviders.description, `%${searchQuery}%`)
        ) as SQL
      );
    }

    // LOCATION FILTERS
    if (city) conditions.push(ilike(serviceProviders.city, `%${city}%`));
    if (province) conditions.push(ilike(serviceProviders.province, `%${province}%`));

    // RATING & REVIEWS
    if (minRating) conditions.push(gte(serviceProviders.rating, Number(minRating)));
    if (hasReviews === "true") conditions.push(gte(serviceProviders.totalReviews, 1));

    // VERIFIED
    if (verified === "true") conditions.push(eq(serviceProviders.isVerified, true));

    // EXPERIENCE
    if (experienceYears) {
      const exp = Number(experienceYears);
      if (!isNaN(exp)) conditions.push(gte(serviceProviders.experienceYears, exp));
    }

    // LOCATION-BASED SEARCH
    const useGeo = latitude && longitude && radius;

    if (useGeo) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm)) {
        const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(lat, lng, radiusKm);

        const providers = await db
          .select({
            id: serviceProviders.id,
            businessName: serviceProviders.businessName,
            description: serviceProviders.description,
            rating: serviceProviders.rating,
            totalReviews: serviceProviders.totalReviews,
            isVerified: serviceProviders.isVerified,
            city: serviceProviders.city,
            province: serviceProviders.province,
            phoneNumber: serviceProviders.phoneNumber,
            hourlyRate: serviceProviders.hourlyRate,
            email: users.email,
            latitude: providerLocations.latitude,
            longitude: providerLocations.longitude,
            address: providerLocations.address,
          })
          .from(serviceProviders)
          .innerJoin(providerLocations, eq(serviceProviders.id, providerLocations.providerId))
          .innerJoin(users, eq(serviceProviders.userId, users.id))
          .where(
            and(
              ...conditions,
              gte(providerLocations.latitude, minLat),
              lte(providerLocations.latitude, maxLat),
              gte(providerLocations.longitude, minLng),
              lte(providerLocations.longitude, maxLng)
            )
          );

        const withDistance = providers
          .map((p) => ({
            ...p,
            distance: haversineDistance(lat, lng, Number(p.latitude), Number(p.longitude)),
          }))
          .filter((p) => p.distance <= radiusKm);

        const sorted = this.sortProviders(withDistance, sortBy);
        const paginated = sorted.slice(offsetNum, offsetNum + limitNum);

        return {
          data: paginated,
          total: sorted.length,
          page: Math.floor(offsetNum / limitNum) + 1,
          totalPages: Math.ceil(sorted.length / limitNum),
          hasLocation: true,
          center: { latitude: lat, longitude: lng },
          searchRadius: radiusKm,
        };
      }
    }

    // NON-GEO SEARCH
    const orderBy = this.getOrderBy(sortBy);

    const providers = await db
      .select({
        id: serviceProviders.id,
        businessName: serviceProviders.businessName,
        description: serviceProviders.description,
        rating: serviceProviders.rating,
        totalReviews: serviceProviders.totalReviews,
        isVerified: serviceProviders.isVerified,
        city: serviceProviders.city,
        province: serviceProviders.province,
        phoneNumber: serviceProviders.phoneNumber,
        hourlyRate: serviceProviders.hourlyRate,
        email: users.email,
      })
      .from(serviceProviders)
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offsetNum);

    const totalQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceProviders)
      .where(and(...conditions));

    const total = totalQuery[0]?.count || 0;

    return {
      data: providers,
      total,
      page: Math.floor(offsetNum / limitNum) + 1,
      totalPages: Math.ceil(total / limitNum),
      hasLocation: false,
    };
  },

  getOrderBy(sortBy: string) {
    switch (sortBy) {
      case "rating":
        return desc(serviceProviders.rating);
      case "reviews":
        return desc(serviceProviders.totalReviews);
      case "newest":
        return desc(serviceProviders.createdAt);
      case "experience":
        return desc(serviceProviders.experienceYears);
      default:
        return desc(serviceProviders.createdAt);
    }
  },

  sortProviders(list: any[], sortBy: string) {
    const sorted = [...list];

    switch (sortBy) {
      case "distance":
        sorted.sort((a, b) => a.distance - b.distance);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "reviews":
        sorted.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
        break;
      default:
        sorted.sort((a, b) => a.distance - b.distance);
    }

    return sorted;
  },
};
