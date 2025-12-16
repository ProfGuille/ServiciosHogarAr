import { Router } from "express";
import users from "./users.js"; // Usa el import por defecto si tu archivo exporta default
import { serviceCategories } from "../shared/schema/serviceCategories.js"; // Corrige la ruta (asumiendo que es un schema compartido)
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { services } from "../shared/schema/services.js";
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
    // If database is not available, return mock provider data
    if (!db) {
      const mockProviders = [
        {
          id: 1,
          businessName: "Plomería Buenos Aires",
          businessDescription: "Servicio profesional de plomería con más de 10 años de experiencia",
          averageRating: "4.8",
          totalReviews: 45,
          isVerified: true,
          credits: 25,
          city: "Buenos Aires",
          province: "Buenos Aires",
          phone: "+54 11 1234-5678",
          email: "plomeria@servicioshogar.com.ar",
          lastActive: new Date(),
          categoryId: 1,
          isActive: true
        },
        {
          id: 2,
          businessName: "Electricidad Rápida",
          businessDescription: "Electricista matriculado, servicios urgentes 24hs",
          averageRating: "4.6",
          totalReviews: 32,
          isVerified: true,
          credits: 18,
          city: "Buenos Aires",
          province: "Buenos Aires", 
          phone: "+54 11 2345-6789",
          email: "electricidad@servicioshogar.com.ar",
          lastActive: new Date(),
          categoryId: 2,
          isActive: true
        },
        {
          id: 3,
          businessName: "Limpieza Integral",
          businessDescription: "Servicios de limpieza residencial y comercial",
          averageRating: "4.9",
          totalReviews: 67,
          isVerified: false,
          credits: 12,
          city: "Buenos Aires",
          province: "Buenos Aires",
          phone: "+54 11 3456-7890", 
          email: "limpieza@servicioshogar.com.ar",
          lastActive: new Date(),
          categoryId: 3,
          isActive: true
        },
        {
          id: 4,
          businessName: "Carpintería Moderna",
          businessDescription: "Muebles a medida y reparaciones en madera",
          averageRating: "4.7",
          totalReviews: 28,
          isVerified: true,
          credits: 30,
          city: "Córdoba",
          province: "Córdoba",
          phone: "+54 351 4567-8901",
          email: "carpinteria@servicioshogar.com.ar", 
          lastActive: new Date(),
          categoryId: 5,
          isActive: true
        },
        {
          id: 5,
          businessName: "Pintura Profesional",
          businessDescription: "Pintura interior y exterior, trabajos garantizados",
          averageRating: "4.5",
          totalReviews: 19,
          isVerified: false,
          credits: 8,
          city: "Rosario",
          province: "Santa Fe",
          phone: "+54 341 5678-9012",
          email: "pintura@servicioshogar.com.ar",
          lastActive: new Date(),
          categoryId: 4,
          isActive: true
        }
      ];

      // Apply filters based on query parameters
      const { city, categoryId, limit = 20 } = req.query;
      let filteredProviders = [...mockProviders];

      if (city && city !== 'all') {
        filteredProviders = filteredProviders.filter(provider =>
          provider.city.toLowerCase().includes((city as string).toLowerCase())
        );
      }

      if (categoryId && categoryId !== 'all') {
        const catId = parseInt(categoryId as string);
        if (!isNaN(catId)) {
          filteredProviders = filteredProviders.filter(provider =>
            provider.categoryId === catId
          );
        }
      }

      // Apply limit
      const limitNum = parseInt(limit as string) || 20;
      filteredProviders = filteredProviders.slice(0, limitNum);

      return res.json(filteredProviders);
    }

    // Aquí podrías hacer joins si tu ORM lo soporta, o varias consultas si no
    const providers = await db.select().from(serviceProviders);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: "Error al obtener proveedores de servicios" });
  }
});

export default router;