import { Router } from "express";
import { providerLocations } from "../shared/schema/providerLocations";
import { serviceProviders } from "../shared/schema/serviceProviders";
import { db } from "../db";
import { sql, and, gte, lte, or, eq, ilike, desc, asc } from "drizzle-orm";

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

export default router;