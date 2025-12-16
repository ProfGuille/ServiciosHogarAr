import { Router } from "express";
import { providerLocations } from "../shared/schema/providerLocations.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { services } from "../shared/schema/services.js";
import { db } from "../db.js";
import { sql, and, gte, lte, or, eq, ilike, desc, asc, isNotNull } from "drizzle-orm";

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

// Obtener todas las ubicaciones de proveedores
router.get("/", async (req, res) => {
  try {
    const locations = await db.select().from(providerLocations);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
});

// Buscar proveedores por ubicación (MVP3 Phase 3)
router.get("/search", async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10,
      limit = 20,
      offset = 0,
      sortBy = 'distance'
    } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: "Latitud y longitud son requeridas para búsqueda por ubicación" 
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
      return res.status(400).json({ 
        error: "Parámetros de ubicación inválidos" 
      });
    }

    // Calculate bounding box for initial filtering (optimization)
    const latDelta = radiusKm / 111; // Approx km per degree of latitude
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180)); // Adjust for longitude

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // Query providers within bounding box
    const providersInBounds = await db
      .select({
        id: serviceProviders.id,
        businessName: serviceProviders.businessName,
        businessDescription: serviceProviders.businessDescription,
        averageRating: serviceProviders.averageRating,
        totalReviews: serviceProviders.totalReviews,
        isVerified: serviceProviders.isVerified,
        credits: serviceProviders.credits,
        latitude: sql<number>`CAST(${providerLocations.latitude} AS DECIMAL(10,8))`,
        longitude: sql<number>`CAST(${providerLocations.longitude} AS DECIMAL(11,8))`,
        address: providerLocations.address,
        lastActive: serviceProviders.lastActive || serviceProviders.lastSeenAt,
      })
      .from(serviceProviders)
      .innerJoin(
        providerLocations,
        eq(serviceProviders.id, providerLocations.providerId)
      )
      .where(
        and(
          gte(sql`CAST(${providerLocations.latitude} AS DECIMAL(10,8))`, minLat),
          lte(sql`CAST(${providerLocations.latitude} AS DECIMAL(10,8))`, maxLat),
          gte(sql`CAST(${providerLocations.longitude} AS DECIMAL(11,8))`, minLng),
          lte(sql`CAST(${providerLocations.longitude} AS DECIMAL(11,8))`, maxLng),
          eq(serviceProviders.isActive, true)
        )
      );

    // Calculate actual distances and filter by radius
    const providersWithDistance = providersInBounds
      .map((provider: any) => {
        const distance = haversineDistance(lat, lng, provider.latitude, provider.longitude);
        return { ...provider, distance };
      })
      .filter((provider: any) => provider.distance <= radiusKm);

    // Sort results
    const sortedProviders = providersWithDistance.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviews':
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        default:
          return a.distance - b.distance;
      }
    });

    // Apply pagination
    const paginatedResults = sortedProviders.slice(offsetNum, offsetNum + limitNum);

    res.json({
      data: paginatedResults,
      total: sortedProviders.length,
      page: Math.floor(offsetNum / limitNum) + 1,
      totalPages: Math.ceil(sortedProviders.length / limitNum),
      radius: radiusKm,
      center: { latitude: lat, longitude: lng }
    });

  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: "Error en búsqueda por ubicación" });
  }
});

// Geocodificar dirección usando servicio gratuito (fallback para backend)
router.post("/geocode", async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: "Dirección es requerida" });
    }

    // En un entorno real, aquí podrías usar un servicio gratuito como Nominatim
    // Por ahora retornamos un placeholder
    res.json({
      address,
      latitude: -34.6037,
      longitude: -58.3816,
      city: "Buenos Aires",
      country: "Argentina",
      source: "placeholder"
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: "Error en geocodificación" });
  }
});

// Location-based provider search
router.get("/providers/search", async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10, 
      category,
      search,
      minRating = 0,
      maxPrice = 100000,
      sortBy = 'distance',
      limit = 50
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: "Latitud y longitud son requeridas" 
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);
    const minRatingNum = parseFloat(minRating as string);
    const maxPriceNum = parseFloat(maxPrice as string);

    // Base query for providers with location data
    let query = db
      .select({
        id: serviceProviders.id,
        businessName: serviceProviders.businessName,
        city: serviceProviders.city,
        averageRating: serviceProviders.averageRating,
        totalReviews: serviceProviders.totalReviews,
        credits: serviceProviders.credits,
        isVerified: serviceProviders.isVerified,
        phone: serviceProviders.phone,
        latitude: serviceProviders.latitude,
        longitude: serviceProviders.longitude,
        hourlyRate: serviceProviders.hourlyRate
      })
      .from(serviceProviders)
      .where(
        and(
          eq(serviceProviders.isActive, true),
          gte(serviceProviders.averageRating, minRatingNum.toString()),
          lte(serviceProviders.hourlyRate, maxPriceNum),
          isNotNull(serviceProviders.latitude),
          isNotNull(serviceProviders.longitude)
        )
      );

    // Add search term filter
    if (search) {
      query = query.where(
        or(
          ilike(serviceProviders.businessName, `%${search}%`),
          ilike(serviceProviders.description, `%${search}%`)
        )
      );
    }

    const providers = await query.limit(parseInt(limit as string) || 50);

    // Filter by distance and enhance with distance calculation
    type ProviderResult = {
      id: number;
      businessName: string | null;
      city: string | null;
      averageRating: string | null;
      totalReviews: number;
      credits: number | null;
      isVerified: boolean;
      phone: string | null;
      latitude: number | null;
      longitude: number | null;
      hourlyRate: number;
    };

    type ProviderWithDistance = ProviderResult & {
      distance: number;
    };

    const providersWithDistance: ProviderWithDistance[] = providers
      .map((provider: ProviderResult) => {
        const distance = haversineDistance(
          lat, 
          lng, 
          provider.latitude!, 
          provider.longitude!
        );
        
        return {
          ...provider,
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal
        };
      })
      .filter((provider: ProviderWithDistance) => provider.distance <= radiusKm);

    // Sort results
    let sortedProviders: ProviderWithDistance[] = providersWithDistance;
    switch (sortBy) {
      case 'distance':
        sortedProviders.sort((a: ProviderWithDistance, b: ProviderWithDistance) => a.distance - b.distance);
        break;
      case 'rating':
        sortedProviders.sort((a: ProviderWithDistance, b: ProviderWithDistance) => (parseFloat(b.averageRating || '0')) - (parseFloat(a.averageRating || '0')));
        break;
      case 'price':
        sortedProviders.sort((a: ProviderWithDistance, b: ProviderWithDistance) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
    }

    // Get services for each provider (optional enhancement)
    const providersWithServices = await Promise.all(
      sortedProviders.map(async (provider: ProviderWithDistance) => {
        try {
          const providerServicesList = await db
            .select({
              id: providerServices.id,
              serviceName: providerServices.serviceName,
              customServiceName: providerServices.customServiceName,
              categoryId: providerServices.categoryId
            })
            .from(providerServices)
            .where(eq(providerServices.providerId, provider.id))
            .limit(3);

          return {
            ...provider,
            services: providerServicesList
          };
        } catch (error) {
          return {
            ...provider,
            services: []
          };
        }
      })
    );

    res.json({
      success: true,
      data: providersWithServices,
      pagination: {
        total: providersWithDistance.length,
        limit: parseInt(limit as string) || 50,
        searchLocation: { latitude: lat, longitude: lng },
        radius: radiusKm
      }
    });

  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ 
      error: "Error en búsqueda por ubicación",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;