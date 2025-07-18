import { db } from "../db";
import { 
  serviceAreas, 
  providerLocations, 
  routeOptimizations, 
  geofences, 
  locationEvents,
  serviceRequests 
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

// Geospatial utility functions
export class GeolocationService {
  
  // Calculate distance between two points using Haversine formula
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if a point is within a circular service area
  static isPointInServiceArea(
    pointLat: number, 
    pointLng: number, 
    centerLat: number, 
    centerLng: number, 
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(pointLat, pointLng, centerLat, centerLng);
    return distance <= radiusKm;
  }

  // Check if a point is within a polygon geofence using ray casting algorithm
  static isPointInPolygon(point: {lat: number, lng: number}, polygon: {lat: number, lng: number}[]): boolean {
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  // Find providers within service radius of a location
  static async findProvidersInArea(
    latitude: number, 
    longitude: number, 
    categoryId?: number,
    maxDistanceKm: number = 50
  ) {
    try {
      // Use raw SQL for geospatial query with PostGIS-like calculations
      const providersInArea = await db
        .select({
          providerId: serviceAreas.providerId,
          providerData: sql`json_build_object(
            'provider_id', ${serviceAreas.providerId},
            'area_name', ${serviceAreas.name},
            'distance_km', 
            ROUND(
              6371 * acos(
                cos(radians(${latitude})) * cos(radians(${serviceAreas.centerLat})) * 
                cos(radians(${serviceAreas.centerLng}) - radians(${longitude})) + 
                sin(radians(${latitude})) * sin(radians(${serviceAreas.centerLat}))
              )::numeric, 2
            ),
            'radius_km', ${serviceAreas.radiusKm},
            'travel_cost_per_km', ${serviceAreas.travelCostPerKm},
            'priority', ${serviceAreas.priority}
          )`,
        })
        .from(serviceAreas)
        .where(
          and(
            eq(serviceAreas.isActive, true),
            sql`6371 * acos(
              cos(radians(${latitude})) * cos(radians(${serviceAreas.centerLat})) * 
              cos(radians(${serviceAreas.centerLng}) - radians(${longitude})) + 
              sin(radians(${latitude})) * sin(radians(${serviceAreas.centerLat}))
            ) <= ${serviceAreas.radiusKm}`
          )
        )
        .orderBy(sql`6371 * acos(
          cos(radians(${latitude})) * cos(radians(${serviceAreas.centerLat})) * 
          cos(radians(${serviceAreas.centerLng}) - radians(${longitude})) + 
          sin(radians(${latitude})) * sin(radians(${serviceAreas.centerLat}))
        )`);

      return providersInArea;
    } catch (error) {
      console.error("Error finding providers in area:", error);
      throw error;
    }
  }

  // Update provider's current location
  static async updateProviderLocation(
    providerId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    address?: string
  ) {
    try {
      // Deactivate previous location
      await db
        .update(providerLocations)
        .set({ isActive: false })
        .where(eq(providerLocations.providerId, providerId));

      // Insert new current location
      const [newLocation] = await db
        .insert(providerLocations)
        .values({
          providerId,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          accuracy: accuracy?.toString(),
          address,
          isActive: true,
          locationSource: "gps",
          timestamp: new Date()
        })
        .returning();

      return newLocation;
    } catch (error) {
      console.error("Error updating provider location:", error);
      throw error;
    }
  }

  // Create or update service area for provider
  static async createServiceArea(
    providerId: string,
    name: string,
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    options: {
      priority?: number;
      maxDailyJobs?: number;
      travelCostPerKm?: number;
      polygonCoords?: {lat: number, lng: number}[];
    } = {}
  ) {
    try {
      const [serviceArea] = await db
        .insert(serviceAreas)
        .values({
          providerId,
          name,
          centerLat: centerLat.toString(),
          centerLng: centerLng.toString(),
          radiusKm: radiusKm.toString(),
          priority: options.priority || 1,
          maxDailyJobs: options.maxDailyJobs || 10,
          travelCostPerKm: options.travelCostPerKm?.toString() || "0.00",
          polygonCoords: options.polygonCoords ? JSON.stringify(options.polygonCoords) : null,
          isActive: true
        })
        .returning();

      return serviceArea;
    } catch (error) {
      console.error("Error creating service area:", error);
      throw error;
    }
  }

  // Route optimization using nearest neighbor algorithm
  static async optimizeRoute(
    providerId: string,
    requestIds: number[],
    startLocation?: {lat: number, lng: number}
  ) {
    try {
      // Get service request locations
      const requests = await db
        .select({
          id: serviceRequests.id,
          latitude: serviceRequests.latitude,
          longitude: serviceRequests.longitude,
          urgency: serviceRequests.urgency,
          scheduledDate: serviceRequests.scheduledDate,
          title: serviceRequests.title
        })
        .from(serviceRequests)
        .where(sql`${serviceRequests.id} = ANY(${requestIds})`);

      if (requests.length === 0) {
        throw new Error("No service requests found");
      }

      // Get provider's current location if not provided
      let currentLocation = startLocation;
      if (!currentLocation) {
        const [providerLocation] = await db
          .select()
          .from(providerLocations)
          .where(
            and(
              eq(providerLocations.providerId, providerId),
              eq(providerLocations.isActive, true)
            )
          )
          .limit(1);

        if (providerLocation) {
          currentLocation = {
            lat: parseFloat(providerLocation.latitude),
            lng: parseFloat(providerLocation.longitude)
          };
        } else {
          throw new Error("Provider location not found");
        }
      }

      // Nearest neighbor algorithm for route optimization
      const unvisited = [...requests];
      const optimizedRoute = [];
      let current = currentLocation;
      let totalDistance = 0;

      while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        // Find nearest unvisited location
        for (let i = 0; i < unvisited.length; i++) {
          const request = unvisited[i];
          const distance = this.calculateDistance(
            current.lat,
            current.lng,
            parseFloat(request.latitude!),
            parseFloat(request.longitude!)
          );

          // Prioritize urgent requests with distance weighting
          const weightedDistance = request.urgency === "urgent" ? distance * 0.7 : distance;

          if (weightedDistance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        }

        const nearest = unvisited.splice(nearestIndex, 1)[0];
        optimizedRoute.push(nearest);
        totalDistance += nearestDistance;

        current = {
          lat: parseFloat(nearest.latitude!),
          lng: parseFloat(nearest.longitude!)
        };
      }

      // Estimate duration (average 40 km/h including stops)
      const estimatedDurationMinutes = Math.round((totalDistance / 40) * 60 + (requests.length * 30));

      // Save optimization result
      const [optimization] = await db
        .insert(routeOptimizations)
        .values({
          providerId,
          date: new Date(),
          startLat: startLocation!.lat.toString(),
          startLng: startLocation!.lng.toString(),
          totalDistanceKm: totalDistance.toString(),
          estimatedDurationMinutes,
          optimizationAlgorithm: "nearest_neighbor",
          waypoints: JSON.stringify(optimizedRoute.map(r => ({
            requestId: r.id,
            lat: parseFloat(r.latitude!),
            lng: parseFloat(r.longitude!),
            title: r.title,
            urgency: r.urgency
          }))),
          status: "planned"
        })
        .returning();

      return {
        optimization,
        route: optimizedRoute,
        totalDistanceKm: totalDistance,
        estimatedDurationMinutes,
        waypoints: optimizedRoute.map(r => ({
          requestId: r.id,
          latitude: parseFloat(r.latitude!),
          longitude: parseFloat(r.longitude!),
          title: r.title,
          urgency: r.urgency
        }))
      };
    } catch (error) {
      console.error("Error optimizing route:", error);
      throw error;
    }
  }

  // Check geofence events (enter/exit)
  static async checkGeofenceEvents(
    providerId: string,
    latitude: number,
    longitude: number,
    previousLat?: number,
    previousLng?: number
  ) {
    try {
      const events = [];

      // Get all active geofences
      const activeGeofences = await db
        .select()
        .from(geofences)
        .where(eq(geofences.isActive, true));

      for (const geofence of activeGeofences) {
        const centerLat = parseFloat(geofence.centerLat);
        const centerLng = parseFloat(geofence.centerLng);
        const radiusKm = parseFloat(geofence.radiusKm || "0");

        const isCurrentlyInside = this.isPointInServiceArea(
          latitude, longitude, centerLat, centerLng, radiusKm
        );

        let wasPreviouslyInside = false;
        if (previousLat && previousLng) {
          wasPreviouslyInside = this.isPointInServiceArea(
            previousLat, previousLng, centerLat, centerLng, radiusKm
          );
        }

        // Detect enter/exit events
        if (isCurrentlyInside && !wasPreviouslyInside) {
          const event = await db
            .insert(locationEvents)
            .values({
              providerId,
              eventType: "enter_geofence",
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              geofenceId: geofence.id,
              metadata: JSON.stringify({
                geofenceName: geofence.name,
                geofenceType: geofence.geofenceType
              })
            })
            .returning();

          events.push(event[0]);
        } else if (!isCurrentlyInside && wasPreviouslyInside) {
          const event = await db
            .insert(locationEvents)
            .values({
              providerId,
              eventType: "exit_geofence",
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              geofenceId: geofence.id,
              metadata: JSON.stringify({
                geofenceName: geofence.name,
                geofenceType: geofence.geofenceType
              })
            })
            .returning();

          events.push(event[0]);
        }
      }

      return events;
    } catch (error) {
      console.error("Error checking geofence events:", error);
      throw error;
    }
  }

  // Get provider's service coverage statistics
  static async getProviderCoverageStats(providerId: string) {
    try {
      const serviceAreasData = await db
        .select()
        .from(serviceAreas)
        .where(
          and(
            eq(serviceAreas.providerId, providerId),
            eq(serviceAreas.isActive, true)
          )
        );

      const totalCoverageKm2 = serviceAreasData.reduce((total, area) => {
        const radiusKm = parseFloat(area.radiusKm);
        return total + (Math.PI * radiusKm * radiusKm);
      }, 0);

      const recentLocations = await db
        .select()
        .from(providerLocations)
        .where(eq(providerLocations.providerId, providerId))
        .orderBy(desc(providerLocations.timestamp))
        .limit(100);

      return {
        serviceAreas: serviceAreasData.length,
        totalCoverageKm2: Math.round(totalCoverageKm2),
        averageServiceRadius: serviceAreasData.length > 0 
          ? serviceAreasData.reduce((sum, area) => sum + parseFloat(area.radiusKm), 0) / serviceAreasData.length
          : 0,
        recentLocationCount: recentLocations.length,
        lastLocationUpdate: recentLocations[0]?.timestamp
      };
    } catch (error) {
      console.error("Error getting provider coverage stats:", error);
      throw error;
    }
  }
}