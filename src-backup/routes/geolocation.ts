import { Router } from "express";
import { GeolocationService } from "../services/geolocation";
import { db } from "../db";
import { 
  serviceAreas, 
  providerLocations, 
  routeOptimizations, 
  geofences, 
  locationEvents,
  insertServiceAreaSchema,
  insertProviderLocationSchema,
  insertRouteOptimizationSchema,
  insertGeofenceSchema
} from "./shared/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

// Update provider location (GPS tracking)
router.post("/provider-location", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { latitude, longitude, accuracy, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required"
      });
    }

    // Get provider's previous location for geofence checking
    const [previousLocation] = await db
      .select()
      .from(providerLocations)
      .where(
        and(
          eq(providerLocations.providerId, userId),
          eq(providerLocations.isActive, true)
        )
      )
      .limit(1);

    // Update location
    const newLocation = await GeolocationService.updateProviderLocation(
      userId,
      parseFloat(latitude),
      parseFloat(longitude),
      accuracy ? parseFloat(accuracy) : undefined,
      address
    );

    // Check for geofence events
    const geofenceEvents = await GeolocationService.checkGeofenceEvents(
      userId,
      parseFloat(latitude),
      parseFloat(longitude),
      previousLocation ? parseFloat(previousLocation.latitude) : undefined,
      previousLocation ? parseFloat(previousLocation.longitude) : undefined
    );

    reson({
      success: true,
      data: {
        location: newLocation,
        geofenceEvents
      }
    });
  } catch (error) {
    console.error("Error updating provider location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update location"
    });
  }
});

// Get provider's current location
router.get("/provider-location/:providerId?", isAuthenticated, async (req: any, res) => {
  try {
    const providerId = req.params.providerId || req.user.claims.sub;
    const userId = req.user.claims.sub;

    // Only allow providers to see their own location or admin to see any
    if (providerId !== userId) {
      // Check if user is admin
      const user = await db.query.users.findFirst({
        where: eq(db.users.id, userId)
      });
      if (user?.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Access denied"
        });
      }
    }

    const [location] = await db
      .select()
      .from(providerLocations)
      .where(
        and(
          eq(providerLocations.providerId, providerId),
          eq(providerLocations.isActive, true)
        )
      )
      .limit(1);

    reson({
      success: true,
      data: location || null
    });
  } catch (error) {
    console.error("Error fetching provider location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch location"
    });
  }
});

// Create or update service area
router.post("/service-areas", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const serviceAreaData = insertServiceAreaSchema.parse({
      ...req.body,
      providerId: userId
    });

    const serviceArea = await GeolocationService.createServiceArea(
      userId,
      serviceAreaData.name,
      parseFloat(serviceAreaData.centerLat),
      parseFloat(serviceAreaData.centerLng),
      parseFloat(serviceAreaData.radiusKm),
      {
        priority: serviceAreaData.priority,
        maxDailyJobs: serviceAreaData.maxDailyJobs,
        travelCostPerKm: serviceAreaData.travelCostPerKm ? parseFloat(serviceAreaData.travelCostPerKm) : undefined,
        polygonCoords: serviceAreaData.polygonCoords ? JSON.parse(serviceAreaData.polygonCoords as string) : undefined
      }
    );

    res.status(201).json({
      success: true,
      data: serviceArea
    });
  } catch (error) {
    console.error("Error creating service area:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create service area"
    });
  }
});

// Get provider's service areas
router.get("/service-areas/:providerId?", async (req, res) => {
  try {
    const providerId = req.params.providerId;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        error: "Provider ID is required"
      });
    }

    const areas = await db
      .select()
      .from(serviceAreas)
      .where(
        and(
          eq(serviceAreas.providerId, providerId),
          eq(serviceAreas.isActive, true)
        )
      )
      .orderBy(desc(serviceAreas.priority));

    reson({
      success: true,
      data: areas
    });
  } catch (error) {
    console.error("Error fetching service areas:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch service areas"
    });
  }
});

// Find providers in area
router.post("/find-providers", async (req, res) => {
  try {
    const { latitude, longitude, categoryId, maxDistanceKm } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required"
      });
    }

    const providers = await GeolocationService.findProvidersInArea(
      parseFloat(latitude),
      parseFloat(longitude),
      categoryId ? parseInt(categoryId) : undefined,
      maxDistanceKm ? parseFloat(maxDistanceKm) : 50
    );

    reson({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error("Error finding providers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to find providers"
    });
  }
});

// Optimize route for provider
router.post("/optimize-route", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { requestIds, startLocation } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request IDs array is required"
      });
    }

    const optimization = await GeolocationService.optimizeRoute(
      userId,
      requestIds.map(id => parseInt(id)),
      startLocation ? {
        lat: parseFloat(startLocation.lat),
        lng: parseFloat(startLocation.lng)
      } : undefined
    );

    reson({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error("Error optimizing route:", error);
    res.status(500).json({
      success: false,
      error: "Failed to optimize route"
    });
  }
});

// Get route optimizations for provider
router.get("/route-optimizations", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { limit = 10, offset = 0, status } = req.query;

    let query = db
      .select()
      .from(routeOptimizations)
      .where(eq(routeOptimizations.providerId, userId));

    if (status) {
      query = query.where(eq(routeOptimizations.status, status));
    }

    const optimizations = await query
      .orderBy(desc(routeOptimizations.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    reson({
      success: true,
      data: optimizations
    });
  } catch (error) {
    console.error("Error fetching route optimizations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch route optimizations"
    });
  }
});

// Update route optimization status
router.patch("/route-optimizations/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { id } = req.params;
    const { status, actualDurationMinutes, endLat, endLng } = req.body;

    const validStatuses = ["planned", "in_progress", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status"
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (actualDurationMinutes) updateData.actualDurationMinutes = parseInt(actualDurationMinutes);
    if (endLat) updateData.endLat = parseFloat(endLat).toString();
    if (endLng) updateData.endLng = parseFloat(endLng).toString();
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(routeOptimizations)
      .set(updateData)
      .where(
        and(
          eq(routeOptimizations.id, parseInt(id)),
          eq(routeOptimizations.providerId, userId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Route optimization not found"
      });
    }

    reson({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error("Error updating route optimization:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update route optimization"
    });
  }
});

// Get provider coverage statistics
router.get("/coverage-stats/:providerId?", isAuthenticated, async (req: any, res) => {
  try {
    const providerId = req.params.providerId || req.user.claims.sub;
    const userId = req.user.claims.sub;

    // Only allow providers to see their own stats or admin to see any
    if (providerId !== userId) {
      const user = await db.query.users.findFirst({
        where: eq(db.users.id, userId)
      });
      if (user?.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Access denied"
        });
      }
    }

    const stats = await GeolocationService.getProviderCoverageStats(providerId);

    reson({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching coverage stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch coverage stats"
    });
  }
});

// Get location events for provider
router.get("/location-events", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { limit = 20, offset = 0, eventType } = req.query;

    let query = db
      .select({
        id: locationEvents.id,
        eventType: locationEvents.eventType,
        latitude: locationEvents.latitude,
        longitude: locationEvents.longitude,
        metadata: locationEvents.metadata,
        timestamp: locationEvents.timestamp,
        geofenceId: locationEvents.geofenceId,
        serviceRequestId: locationEvents.serviceRequestId
      })
      .from(locationEvents)
      .where(eq(locationEvents.providerId, userId));

    if (eventType) {
      query = query.where(eq(locationEvents.eventType, eventType));
    }

    const events = await query
      .orderBy(desc(locationEvents.timestamp))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    reson({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("Error fetching location events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch location events"
    });
  }
});

// Calculate distance between two points
router.post("/calculate-distance", async (req, res) => {
  try {
    const { lat1, lng1, lat2, lng2 } = req.body;

    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return res.status(400).json({
        success: false,
        error: "All coordinates are required"
      });
    }

    const distance = GeolocationService.calculateDistance(
      parseFloat(lat1),
      parseFloat(lng1),
      parseFloat(lat2),
      parseFloat(lng2)
    );

    reson({
      success: true,
      data: {
        distanceKm: Math.round(distance * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error calculating distance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate distance"
    });
  }
});

// Admin routes for geofence management
router.get("/geofences", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check if user is admin
    const user = await db.query.users.findFirst({
      where: eq(db.users.id, userId)
    });
    if (user?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }

    const fences = await db
      .select()
      .from(geofences)
      .orderBy(desc(geofences.createdAt));

    reson({
      success: true,
      data: fences
    });
  } catch (error) {
    console.error("Error fetching geofences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch geofences"
    });
  }
});

router.post("/geofences", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check if user is admin
    const user = await db.query.users.findFirst({
      where: eq(db.users.id, userId)
    });
    if (user?.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }

    const geofenceData = insertGeofenceSchema.parse(req.body);

    const [geofence] = await db
      .insert(geofences)
      .values(geofenceData)
      .returning();

    res.status(201).json({
      success: true,
      data: geofence
    });
  } catch (error) {
    console.error("Error creating geofence:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create geofence"
    });
  }
});

export default router;