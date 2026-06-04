import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/serviceProviders.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq, sql } from "drizzle-orm";

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
  async updateProfile(id: number, data: any, changedBy?: string) {
    if (!id || id <= 0) {
      throw new Error("ID de proveedor inválido");
    }

    const allowedFields = [
      "businessName",
      "description",
      "hourlyRate",
      "experienceYears",
      "city",
      "province",
      "phoneNumber",
      "coverageRadiusKm",
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

if (safeData.description !== undefined && typeof safeData.description !== "string") {
      throw new Error("description debe ser string");
    }

    if (safeData.city !== undefined && typeof safeData.city !== "string") {
      throw new Error("city debe ser string");
    }

    if (safeData.province !== undefined && typeof safeData.province !== "string") {
      throw new Error("province debe ser string");
    }

if (safeData.phoneNumber !== undefined) {
      if (typeof safeData.phoneNumber !== "string") throw new Error("phoneNumber debe ser string");
      const cleanPhone = safeData.phoneNumber.replace(/[\s\-().+]/g, '');
      if (cleanPhone.length > 0 && !/^\d{6,15}$/.test(cleanPhone)) {
        throw new Error("El teléfono debe tener entre 6 y 15 dígitos");
      }
    }

    if (Object.keys(safeData).length === 0) {
      throw new Error("No se enviaron campos válidos para actualizar");
    }

    // coverageRadiusKm requiere SQL directo (columna no está en schema Drizzle)
    if (safeData.coverageRadiusKm !== undefined) {
      const radius = safeData.coverageRadiusKm;
      delete safeData.coverageRadiusKm;
      await db.execute(sql`UPDATE service_providers SET coverage_radius_km = ${radius} WHERE id = ${id}`);
      if (Object.keys(safeData).length === 0) {
        const result = await db.execute(sql`SELECT * FROM service_providers WHERE id = ${id} LIMIT 1`);
        const rows = (result as any).rows || result;
        return rows[0] || { id, updated: true };
      }
    }

    const currentRows = await db.execute(sql`SELECT * FROM service_providers WHERE id = ${id} LIMIT 1`);
    const current = ((currentRows as any).rows || currentRows)[0] || {};
    const fieldMap: Record<string, string> = {
      businessName: "business_name",
      description: "description",
      hourlyRate: "hourly_rate",
      experienceYears: "experience_years",
      city: "city",
      province: "province",
      phoneNumber: "phone_number",
    };
    const [updated] = await db
      .update(serviceProviders)
      .set(safeData)
      .where(eq(serviceProviders.id, id))
      .returning();
    for (const [key, dbCol] of Object.entries(fieldMap)) {
      if (safeData[key] !== undefined) {
        const numericDbCols = ["hourly_rate", "experience_years", "coverage_radius_km"];
        const _oldRaw = (current[dbCol] !== undefined && current[dbCol] !== null) ? current[dbCol] : "";
        const _newRaw = (safeData[key] !== undefined && safeData[key] !== null) ? safeData[key] : "";
        const oldVal = numericDbCols.includes(dbCol) && _oldRaw !== "" ? String(parseFloat(String(_oldRaw))) : String(_oldRaw);
        const newVal = numericDbCols.includes(dbCol) && _newRaw !== "" ? String(parseFloat(String(_newRaw))) : String(_newRaw);
        if (oldVal !== newVal) {
          await db.execute(sql`INSERT INTO provider_profile_changes (provider_id, changed_by, field_name, old_value, new_value) VALUES (${id}, ${changedBy || null}, ${key}, ${oldVal}, ${newVal})`);
        }
      }
    }
    return updated;
  },

  // ---------------------------------------------------------
  // Actualizar ubicación
  // ---------------------------------------------------------
  async updateLocation(id: number, latitude: number, longitude: number, address?: string, city?: string, province?: string) {
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

    // Upsert en provider_locations
    await db.execute(sql`
      INSERT INTO provider_locations (provider_id, latitude, longitude, address)
      VALUES (${id}, ${latitude}, ${longitude}, ${address || null})
      ON CONFLICT (provider_id) DO UPDATE
        SET latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            address = EXCLUDED.address
    `);
    if (city || province) {
      await db.execute(sql`
        UPDATE service_providers
        SET city = COALESCE(${city || null}, city),
            province = COALESCE(${province || null}, province)
        WHERE id = ${id}
      `);
    }
    const [updated] = await db
      .update(serviceProviders)
      .set({ updatedAt: new Date() })
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
        updatedAt: new Date(), // isOnline/lastSeenAt no existen en BD — pendiente migración
      })
      .where(eq(serviceProviders.id, id))
      .returning();

    return updated;
  },
};

