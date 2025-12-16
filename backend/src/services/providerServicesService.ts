import { db } from "../db.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq, and } from "drizzle-orm";

// -----------------------------
// Helpers
// -----------------------------
function validateString(value: any, field: string, maxLength = 128) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} debe ser un string no vacío`);
  }
  if (value.length > maxLength) {
    throw new Error(`${field} excede el máximo de ${maxLength} caracteres`);
  }
}

function validatePositiveNumber(value: any, field: string) {
  if (typeof value !== "number" || isNaN(value) || value < 0) {
    throw new Error(`${field} debe ser un número >= 0`);
  }
}

function validateInteger(value: any, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} debe ser un entero >= 0`);
  }
}

// -----------------------------
// Service
// -----------------------------
export const providerServicesService = {
  // ---------------------------------------------------------
  // Obtener todos los servicios del proveedor
  // ---------------------------------------------------------
  async getByProvider(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    return db
      .select()
      .from(providerServices)
      .where(eq(providerServices.providerId, providerId));
  },

  // ---------------------------------------------------------
  // Crear servicio del proveedor
  // ---------------------------------------------------------
  async create(providerId: number, data: any) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    // Validaciones
    validateString(data.serviceName, "serviceName");
    validateInteger(data.categoryId, "categoryId");
    validatePositiveNumber(data.price, "price");
    validateInteger(data.durationMinutes, "durationMinutes");

    if (data.customServiceName !== undefined && data.customServiceName !== null) {
      validateString(data.customServiceName, "customServiceName");
    }

    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== "string") {
        throw new Error("description debe ser string");
      }
    }

    // Evitar duplicados exactos
    const existing = await db
      .select()
      .from(providerServices)
      .where(
        and(
          eq(providerServices.providerId, providerId),
          eq(providerServices.serviceName, data.serviceName),
          eq(providerServices.categoryId, data.categoryId)
        )
      );

    if (existing.length > 0) {
      throw new Error("El proveedor ya tiene un servicio con ese nombre y categoría");
    }

    const [created] = await db
      .insert(providerServices)
      .values({
        providerId,
        serviceName: data.serviceName,
        customServiceName: data.customServiceName ?? null,
        categoryId: data.categoryId,
        price: data.price,
        description: data.description ?? null,
        durationMinutes: data.durationMinutes,
        isActive: true,
      })
      .returning();

    return created;
  },

  // ---------------------------------------------------------
  // Editar servicio del proveedor
  // ---------------------------------------------------------
  async update(serviceId: number, providerId: number, data: any) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    if (!serviceId || serviceId <= 0) {
      throw new Error("serviceId inválido");
    }

    // Verificar ownership
    const existing = await db
      .select()
      .from(providerServices)
      .where(
        and(
          eq(providerServices.id, serviceId),
          eq(providerServices.providerId, providerId)
        )
      );

    if (existing.length === 0) {
      throw new Error("Servicio no encontrado o no autorizado");
    }

    const safeData: any = {};

    if (data.serviceName !== undefined) {
      validateString(data.serviceName, "serviceName");
      safeData.serviceName = data.serviceName;
    }

    if (data.customServiceName !== undefined) {
      if (data.customServiceName === null) {
        safeData.customServiceName = null;
      } else {
        validateString(data.customServiceName, "customServiceName");
        safeData.customServiceName = data.customServiceName;
      }
    }

    if (data.categoryId !== undefined) {
      validateInteger(data.categoryId, "categoryId");
      safeData.categoryId = data.categoryId;
    }

    if (data.price !== undefined) {
      validatePositiveNumber(data.price, "price");
      safeData.price = data.price;
    }

    if (data.durationMinutes !== undefined) {
      validateInteger(data.durationMinutes, "durationMinutes");
      safeData.durationMinutes = data.durationMinutes;
    }

    if (data.description !== undefined) {
      if (data.description !== null && typeof data.description !== "string") {
        throw new Error("description debe ser string");
      }
      safeData.description = data.description;
    }

    if (data.isActive !== undefined) {
      if (typeof data.isActive !== "boolean") {
        throw new Error("isActive debe ser boolean");
      }
      safeData.isActive = data.isActive;
    }

    if (Object.keys(safeData).length === 0) {
      throw new Error("No se enviaron campos válidos para actualizar");
    }

    safeData.updatedAt = new Date();

    const [updated] = await db
      .update(providerServices)
      .set(safeData)
      .where(eq(providerServices.id, serviceId))
      .returning();

    return updated;
  },

  // ---------------------------------------------------------
  // Activar/desactivar servicio
  // ---------------------------------------------------------
  async setActive(serviceId: number, providerId: number, isActive: boolean) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    if (!serviceId || serviceId <= 0) {
      throw new Error("serviceId inválido");
    }

    if (typeof isActive !== "boolean") {
      throw new Error("isActive debe ser boolean");
    }

    const [updated] = await db
      .update(providerServices)
      .set({ isActive, updatedAt: new Date() })
      .where(
        and(
          eq(providerServices.id, serviceId),
          eq(providerServices.providerId, providerId)
        )
      )
      .returning();

    if (!updated) {
      throw new Error("Servicio no encontrado o no autorizado");
    }

    return updated;
  },
};

