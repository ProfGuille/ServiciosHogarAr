import { Router } from "express";
import users from "./users"; // Usa el import por defecto si tu archivo exporta default
import { serviceCategories } from "../shared/schema/serviceCategories"; // Corrige la ruta (asumiendo que es un schema compartido)
import { db } from "../db";
import { serviceProviders } from "../shared/schema/serviceProviders";
import { providerServices } from "../shared/schema/providerServices";
import { services } from "../shared/schema/services";
import { sql, and, gte, lte, or, eq, ilike, desc, asc, isNotNull } from "drizzle-orm";

const router = Router();

// Haversine distance calculation function
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

// Location-based provider search
router.get("/location-search", async (req, res) => {
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
        hourlyRate: serviceProviders.hourlyRate,
        description: serviceProviders.description
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
      businessDescription: string | null; 
      city: string | null;
      province: string | null;
      averageRating: string | null;
      totalReviews: number;
      credits: number | null;
      isVerified: boolean;
      phone: string | null;
      latitude: number | null;
      longitude: number | null;
      hourlyRate: number;
      description: string | null;
    };

    type ProviderWithDistance = ProviderResult & {
      distance: number;
    };

    const providersWithDistance: ProviderWithDistance[] = providers
      .map((provider: ProviderResult) => {
        if (!provider.latitude || !provider.longitude) return null;
        
        const distance = calculateDistance(
          lat, 
          lng, 
          provider.latitude, 
          provider.longitude
        );
        
        return {
          ...provider,
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal
        };
      })
      .filter((provider: ProviderResult | null): provider is ProviderWithDistance => 
        provider !== null && (provider as ProviderWithDistance).distance <= radiusKm
      );

    // Sort results
    let sortedProviders: ProviderWithDistance[] = providersWithDistance;
    switch (sortBy) {
      case 'distance':
        sortedProviders.sort((a: ProviderWithDistance, b: ProviderWithDistance) => a.distance - b.distance);
        break;
      case 'rating':
        sortedProviders.sort((a: ProviderWithDistance, b: ProviderWithDistance) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
        break;
      case 'price':
        sortedProviders.sort((a: ProviderWithDistance, b: ProviderWithDistance) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
    }

    // Get services for each provider
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

    res.json(providersWithServices);

  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ 
      error: "Error en búsqueda por ubicación",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ejemplo de endpoint para obtener proveedores de servicios con categorías y usuario relacionado
router.get("/", async (req, res) => {
  try {
    // Aquí podrías hacer joins si tu ORM lo soporta, o varias consultas si no
    const providers = await db.select().from(serviceProviders);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proveedores de servicios" });
  }
});

export default router;