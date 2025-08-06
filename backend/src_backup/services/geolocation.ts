import { db } from "../db.js";
import {
  providerLocations,
  serviceAreas,
  serviceRequests,
  serviceProviders,
  users,
  routeOptimizations,
  locationEvents,
  geofences,
  providerServices,
} from "../shared/schema.js";

import { eq, and, desc, inArray, count, sql } from "drizzle-orm";

export class GeolocationService {
  static async updateProviderLocation(
    userId: number,
    latitude: number,
    longitude: number,
    accuracy?: number,
    address?: string
  ) {
    await db.update(providerLocations)
      .set({ isActive: false })
      .where(and(eq(providerLocations.providerId, userId), eq(providerLocations.isActive, true)));

    const [newLocation] = await db.insert(providerLocations).values({
      providerId: userId,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      accuracy: accuracy?.toString(),
      address: address ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    await db.insert(locationEvents).values({
      providerId: userId,
      eventType: "location_update",
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      timestamp: new Date(),
      metadata: JSON.stringify({ accuracy, address }),
    });

    return newLocation;
  }

  static async checkGeofenceEvents(
    userId: number,
    currentLat: number,
    currentLng: number,
    previousLat?: number,
    previousLng?: number
  ) {
    const fences = await db.select().from(geofences).where(eq(geofences.isActive, true));

    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const events = [];

    for (const fence of fences) {
      const centerLat = parseFloat(fence.centerLat);
      const centerLng = parseFloat(fence.centerLng);
      const radiusKm = fence.radiusKm;

      const prevDistance = (previousLat != null && previousLng != null)
        ? haversine(previousLat, previousLng, centerLat, centerLng)
        : null;
      const currDistance = haversine(currentLat, currentLng, centerLat, centerLng);

      const wasInside = prevDistance != null && prevDistance <= radiusKm;
      const isInside = currDistance <= radiusKm;

      if (!wasInside && isInside) {
        events.push({ type: "enter", geofenceId: fence.id });
        await db.insert(locationEvents).values({
          providerId: userId,
          eventType: "geofence_enter",
          latitude: currentLat.toString(),
          longitude: currentLng.toString(),
          geofenceId: fence.id,
          timestamp: new Date(),
          metadata: null,
        });
      } else if (wasInside && !isInside) {
        events.push({ type: "exit", geofenceId: fence.id });
        await db.insert(locationEvents).values({
          providerId: userId,
          eventType: "geofence_exit",
          latitude: currentLat.toString(),
          longitude: currentLng.toString(),
          geofenceId: fence.id,
          timestamp: new Date(),
          metadata: null,
        });
      }
    }

    return events;
  }

  static async createServiceArea(
    userId: number,
    name: string,
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    options?: {
      priority?: number,
      maxDailyJobs?: number,
      travelCostPerKm?: number,
      polygonCoords?: Array<[number, number]>,
    }
  ) {
    const [existing] = await db.select()
      .from(serviceAreas)
      .where(and(eq(serviceAreas.providerId, userId), eq(serviceAreas.name, name)))
      .limit(1);

    const data = {
      providerId: userId,
      name,
      centerLat: centerLat.toString(),
      centerLng: centerLng.toString(),
      radiusKm,
      priority: options?.priority ?? 1,
      maxDailyJobs: options?.maxDailyJobs ?? null,
      travelCostPerKm: options?.travelCostPerKm ?? null,
      polygonCoords: options?.polygonCoords ? JSON.stringify(options.polygonCoords) : null,
      isActive: true,
      updatedAt: new Date(),
      createdAt: existing ? existing.createdAt : new Date(),
    };

    if (existing) {
      const [updated] = await db.update(serviceAreas)
        .set(data)
        .where(eq(serviceAreas.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(serviceAreas)
        .values(data)
        .returning();
      return created;
    }
  }

  static async findProvidersInArea(
    latitude: number,
    longitude: number,
    categoryId?: number,
    maxDistanceKm: number = 50,
  ) {
    const categoryFilter = categoryId
      ? sql`provider_id IN (SELECT provider_id FROM provider_services WHERE category_id = ${categoryId})`
      : sql`TRUE`;

    const providers = await db.select({
      providerId: serviceProviders.id,
      businessName: serviceProviders.businessName,
      rating: serviceProviders.rating,
      latitude: providerLocations.latitude,
      longitude: providerLocations.longitude,
      distanceKm: sql<number>`
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(cast(${providerLocations.latitude} AS double precision))) *
          cos(radians(cast(${providerLocations.longitude} AS double precision)) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(cast(${providerLocations.latitude} AS double precision)))
        )
      `.as("distanceKm"),
    })
      .from(serviceProviders)
      .innerJoin(providerLocations, eq(serviceProviders.id, providerLocations.providerId))
      .where(and(
        eq(serviceProviders.isActive, true),
        categoryFilter,
        sql`
          6371 * acos(
            cos(radians(${latitude})) * cos(radians(cast(${providerLocations.latitude} AS double precision))) *
            cos(radians(cast(${providerLocations.longitude} AS double precision)) - radians(${longitude})) +
            sin(radians(${latitude})) * sin(radians(cast(${providerLocations.latitude} AS double precision)))
          ) <= ${maxDistanceKm}
        `
      ))
      .orderBy(sql`distanceKm`);

    return providers.map(p => ({
      ...p,
      distanceKm: p.distanceKm ? Number(p.distanceKm.toFixed(2)) : null,
      latitude: p.latitude ? parseFloat(p.latitude) : null,
      longitude: p.longitude ? parseFloat(p.longitude) : null,
    }));
  }

  static async optimizeRoute(
    userId: number,
    requestIds: number[],
    startLocation?: { lat: number; lng: number }
  ) {
    const ordered = [...requestIds].sort();

    const [optimization] = await db.insert(routeOptimizations)
      .values({
        providerId: userId,
        requestIds: ordered.map(String),
        status: "planned",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return optimization;
  }

  static async getProviderCoverageStats(providerId: number) {
    const totalAreas = (await db.select({ count: count(serviceAreas.id) })
      .from(serviceAreas)
      .where(and(eq(serviceAreas.providerId, providerId), eq(serviceAreas.isActive, true))))[0]?.count || 0;

    const totalJobs = (await db.select({ count: count(serviceRequests.id) })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.providerId, providerId), eq(serviceRequests.status, "completed"))))[0]?.count || 0;

    return {
      providerId,
      totalServiceAreas: Number(totalAreas),
      totalJobsCompleted: Number(totalJobs),
    };
  }

  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

