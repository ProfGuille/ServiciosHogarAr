import { Router, Request, Response } from "express";
import { GeolocationService } from "../services/geolocation.js";
import { db } from "../db.js";
import {
  users,
  providerLocations,
  serviceAreas,
  routeOptimizations,
  geofences,
  locationEvents,
} from "../shared/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth.js";
import { insertServiceAreaSchema, insertGeofenceSchema } from "../shared/schema.js";

const router = Router();

function parseIdAsNumber(id: unknown): number | null {
  if (typeof id === "string") {
    const n = Number(id);
    return isNaN(n) ? null : n;
  }
  if (typeof id === "number") return id;
  return null;
}
function parseIdAsString(id: unknown): string | null {
  if (typeof id === "string") return id;
  if (typeof id === "number") return id.toString();
  return null;
}
function getUserIdNum(req: Request): number | null {
  const userId = (req as any).user?.claims?.sub;
  return parseIdAsNumber(userId);
}
function getUserIdString(req: Request): string | null {
  const userId = (req as any).user?.claims?.sub;
  return parseIdAsString(userId);
}

function toString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") return value[0];
  return undefined;
}

// 1. Actualizar ubicación de proveedor
router.post("/provider-location", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userIdNum = getUserIdNum(req);
    if (userIdNum === null) return res.status(401).json({ success: false, error: "Unauthorized: Invalid user ID" });

    const { latitude, longitude, accuracy, address } = req.body;
    if (latitude == null || longitude == null) return res.status(400).json({ success: false, error: "Latitude and longitude required" });

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) return res.status(400).json({ success: false, error: "Latitude and longitude must be numbers" });

    const accuracyNum = accuracy != null ? parseFloat(accuracy) : undefined;
    if (accuracyNum != null && isNaN(accuracyNum)) return res.status(400).json({ success: false, error: "Accuracy must be a number" });

    const [previousLocation] = await db.select()
      .from(providerLocations)
      .where(and(eq(providerLocations.providerId, userIdNum), eq(providerLocations.isActive, true)))
      .limit(1);

    const newLocation = await GeolocationService.updateProviderLocation(
      userIdNum,
      latNum,
      lngNum,
      accuracyNum,
      address
    );

    const prevLatNum = previousLocation?.latitude ? parseFloat(previousLocation.latitude) : undefined;
    const prevLngNum = previousLocation?.longitude ? parseFloat(previousLocation.longitude) : undefined;

    const geofenceEvents = await GeolocationService.checkGeofenceEvents(
      userIdNum,
      latNum,
      lngNum,
      prevLatNum,
      prevLngNum
    );

    res.json({ success: true, data: { location: newLocation, geofenceEvents } });
  } catch (error) {
    console.error("Error updating provider location:", error);
    res.status(500).json({ success: false, error: "Failed to update location" });
  }
});

// 2. Obtener ubicación activa de proveedor (por id o el usuario)
router.get("/provider-location/:providerId?", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userIdStr = getUserIdString(req);
    if (userIdStr === null) return res.status(401).json({ success: false, error: "Unauthorized: Invalid user ID" });

    const requestedIdParam = req.params.providerId;
    const requestedIdNum = requestedIdParam ? parseIdAsNumber(requestedIdParam) : parseIdAsNumber(userIdStr);
    if (requestedIdNum === null) return res.status(400).json({ success: false, error: "Invalid provider ID" });

    if (requestedIdNum.toString() !== userIdStr) {
      const [user] = await db.select().from(users).where(eq(users.id, userIdStr)).limit(1);
      if (user?.userType !== "admin") return res.status(403).json({ success: false, error: "Access denied" });
    }

    const [location] = await db.select()
      .from(providerLocations)
      .where(and(eq(providerLocations.providerId, requestedIdNum), eq(providerLocations.isActive, true)))
      .limit(1);

    res.json({ success: true, data: location || null });
  } catch (error) {
    console.error("Error fetching provider location:", error);
    res.status(500).json({ success: false, error: "Failed to fetch location" });
  }
});

// 3. Crear o actualizar área de servicio
router.post("/service-areas", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userIdNum = getUserIdNum(req);
    if (userIdNum === null) return res.status(401).json({ success: false, error: "Unauthorized" });

    const parsed = insertServiceAreaSchema.safeParse({ ...req.body, providerId: userIdNum });
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues });

    const area = await GeolocationService.createServiceArea(
      userIdNum,
      parsed.data.name,
      parseFloat(parsed.data.centerLat),
      parseFloat(parsed.data.centerLng),
      parseFloat(parsed.data.radiusKm),
      {
        priority: parsed.data.priority ?? undefined,
        maxDailyJobs: parsed.data.maxDailyJobs ?? undefined,
        travelCostPerKm:
          parsed.data.travelCostPerKm != null ? parseFloat(parsed.data.travelCostPerKm) : undefined,
        polygonCoords: parsed.data.polygonCoords ? JSON.parse(parsed.data.polygonCoords as string) : undefined,
      }
    );

    res.status(201).json({ success: true, data: area });
  } catch (error) {
    console.error("Error creating service area:", error);
    res.status(500).json({ success: false, error: "Failed to create service area" });
  }
});

// 4. Listar áreas de servicio activas por proveedor
router.get("/service-areas/:providerId?", async (req: Request, res: Response) => {
  try {
    const providerIdParam = req.params.providerId;
    if (!providerIdParam) return res.status(400).json({ success: false, error: "Provider ID is required" });

    const providerIdNum = parseIdAsNumber(providerIdParam);
    if (providerIdNum === null) return res.status(400).json({ success: false, error: "Invalid provider ID" });

    const areas = await db.select()
      .from(serviceAreas)
      .where(and(eq(serviceAreas.providerId, providerIdNum), eq(serviceAreas.isActive, true)))
      .orderBy(desc(serviceAreas.priority));

    res.json({ success: true, data: areas });
  } catch (error) {
    console.error("Error fetching service areas:", error);
    res.status(500).json({ success: false, error: "Failed to fetch service areas" });
  }
});

// 5. Encontrar proveedores cercanos
router.post("/find-providers", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, categoryId, maxDistanceKm } = req.body;
    if (latitude == null || longitude == null)
      return res.status(400).json({ success: false, error: "Latitude and longitude required" });

    const catIdNum = categoryId != null ? parseInt(categoryId) : undefined;
    if (categoryId != null && isNaN(catIdNum)) {
      return res.status(400).json({ success: false, error: "Invalid category ID" });
    }

    const providers = await GeolocationService.findProvidersInArea(
      parseFloat(latitude),
      parseFloat(longitude),
      catIdNum,
      maxDistanceKm != null ? parseFloat(maxDistanceKm) : 50
    );

    res.json({ success: true, data: providers });
  } catch (error) {
    console.error("Error finding providers:", error);
    res.status(500).json({ success: false, error: "Failed to find providers" });
  }
});

// 6. Optimizar ruta para proveedor
router.post("/optimize-route", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userIdNum = getUserIdNum(req);
    if (userIdNum === null) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { requestIds, startLocation } = req.body;
    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ success: false, error: "Request IDs array is required" });
    }

    const optimization = await GeolocationService.optimizeRoute(
      userIdNum,
      requestIds.map((id) => Number(id)),
      startLocation ? { lat: parseFloat(startLocation.lat), lng: parseFloat(startLocation.lng) } : undefined
    );

    res.json({ success: true, data: optimization });
  } catch (error) {
    console.error("Error optimizing route:", error);
    res.status(500).json({ success: false, error: "Failed to optimize route" });
  }
});

// 7. Obtener optimizaciones de ruta del proveedor
router.get("/route-optimizations", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userIdNum = getUserIdNum(req);
    if (userIdNum === null) return res.status(401).json({ success: false, error: "Unauthorized" });

    const limitNum = Math.max(1, parseInt(toString(req.query.limit) ?? "10"));
    const offsetNum = Math.max(0, parseInt(toString(req.query.offset) ?? "0"));
    const statusParam = toString(req.query.status);

    type Status = "completed" | "in_progress" | "cancelled" | "planned";
    const allowedStatuses: Status[] = ["completed", "in_progress", "cancelled", "planned"];
    const status: Status | undefined = allowedStatuses.includes(statusParam as Status) ? (statusParam as Status) : undefined;

    const conditions = [eq(routeOptimizations.providerId, userIdNum)];
    if (status) conditions.push(eq(routeOptimizations.status, status));

    const optimizations = await db.select().from(routeOptimizations).where(and(...conditions))
      .orderBy(desc(routeOptimizations.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({ success: true, data: optimizations });
  } catch (error) {
    console.error("Error fetching route optimizations:", error);
    res.status(500).json({ success: false, error: "Failed to fetch route optimizations" });
  }
});

export default router;

