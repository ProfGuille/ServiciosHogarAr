import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq } from "drizzle-orm";

export const providersService = {
  // Obtener proveedor por ID
  async getById(id: number) {
    return db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.id, id),
    });
  },

  // Obtener servicios del proveedor
  async getServices(providerId: number) {
    return db
      .select()
      .from(providerServices)
      .where(eq(providerServices.providerId, providerId));
  },

  // Actualizar perfil (solo campos permitidos)
  async updateProfile(id: number, data: any) {
    const allowedFields = [
      "businessName",
      "businessDescription",
      "hourlyRate",
      "experienceYears",
      "city",
      "province",
      "phone",
    ];

    const safeData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) safeData[key] = data[key];
    }

    const [updated] = await db
      .update(serviceProviders)
      .set(safeData)
      .where(eq(serviceProviders.id, id))
      .returning();

    return updated;
  },

  // Actualizar ubicación
  async updateLocation(id: number, latitude: number, longitude: number) {
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Coordenadas inválidas");
    }

    const [updated] = await db
      .update(serviceProviders)
      .set({ latitude, longitude })
      .where(eq(serviceProviders.id, id))
      .returning();

    return updated;
  },

  // Actualizar estado online/offline
  async updateOnlineStatus(id: number, isOnline: boolean) {
    const [updated] = await db
      .update(serviceProviders)
      .set({
        isOnline,
        lastSeenAt: new Date(),
      })
      .where(eq(serviceProviders.id, id))
      .returning();

    return updated;
  },
};

