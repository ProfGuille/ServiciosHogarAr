import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq } from "drizzle-orm";

export const providersService = {
  // ---------------------------------------------------------
  // Obtener proveedor por ID
  // ---------------------------------------------------------
  async getById(id: number) {
    if (!id || id <= 0) {
      throw new Error("ID de proveedor inválido");
    }

    return db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.id, id),
    });
  },

  // ---------------------------------------------------------
  // Obtener servicios del proveedor
  // (solo lectura, no edición)
  // ---------------------------------------------------------
  async getServices(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    return db
      .select()
      .from(providerServices)
      .where(eq(providerServices.providerId, providerId));
  },

  // ---------------------------------------------------------
  // Actualizar perfil
  // ---------------------------------------------------------
  async updateProfile(id: number, data: any) {
    if (!id || id <= 0) {
      throw new Error("ID de proveedor inválido");
    }

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
      if (data[key] !== undefined) {
        safeData[key] = data[key];
      }
    }

    // Validaciones básicas
    if (safeData.hourlyRate !== undefined) {
      if (isNaN(safeData.hourlyRate) || safeData.hourlyRate < 0) {
        throw new Error("hourlyRate debe ser un número >= 0");
      }
    }

    if (safeData.experienceYears !== undefined) {
      if (!Number.isInteger(safeData.experienceYears) || safeData.experienceYears < 0) {
        throw new Error("experienceYears debe ser un entero >= 0");
      }
    }

    if (safeData.businessName !== undefined && typeof safeData.businessName !== "string") {
      throw new Error("businessName debe ser string");
    }

    if (safeData.businessDescription !== undefined && typeof safeData.businessDescription !== "string") {
      throw new Error("businessDescription debe ser string");
    }

    if (safeData.city !== undefined && typeof safeData.city !== "string") {
      throw new Error("city debe ser string");
    }

    if (safeData.province !== undefined && typeof safeData.province !== "string") {
      throw new Error("province debe ser string");
    }

    if (safeData.phone !== undefined && typeof safeData.phone !== "string") {
      throw new Error("phone debe ser string");
    }

    if (Object.keys(safeData).length === 0) {
      throw new Error("No se enviaron campos válidos para actualizar");
    }

    const [updated] = await db
      .update(serviceProviders)
      .set(safeData)
      .where(eq(serviceProviders.id, id))
      .returning();

    return updated;
  },

  // ---------------------------------------------------------
  // Actualizar ubicación
  // ---------------------------------------------------------
  async updateLocation(id: number, latitude: number, longitude: number) {
    if (!id || id <= 0) {
      throw new Error("ID de proveedor inválido");
    }

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

  // ---------------------------------------------------------
  // Actualizar estado online/offline
  // ---------------------------------------------------------
  async updateOnlineStatus(id: number, isOnline: boolean) {
    if (!id || id <= 0) {
      throw new Error("ID de proveedor inválido");
    }

    if (typeof isOnline !== "boolean") {
      throw new Error("isOnline debe ser boolean");
    }

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

