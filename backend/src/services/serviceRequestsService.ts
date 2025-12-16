import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { providerAvailability } from "../shared/schema/providerAvailability.js";
import { eq, and } from "drizzle-orm";

// -----------------------------
// Helpers
// -----------------------------
function ensureString(value: any, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} debe ser un string no vacío`);
  }
}

function ensureNumber(value: any, field: string) {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`${field} debe ser un número válido`);
  }
}

function ensureStatusTransition(current: string, next: string) {
  const valid = {
    pending: ["quoted", "cancelled"],
    quoted: ["accepted", "cancelled"],
    accepted: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  if (!valid[current]?.includes(next)) {
    throw new Error(`Transición de estado inválida: ${current} → ${next}`);
  }
}

// -----------------------------
// Availability validation
// -----------------------------
async function checkProviderAvailability(providerId: number, date: Date, durationMinutes: number) {
  if (!providerId || !date) return;

  const day = date.getDay(); // 0–6
  const timeStr = date.toTimeString().slice(0, 8); // "HH:MM:SS"

  const availability = await db
    .select()
    .from(providerAvailability)
    .where(eq(providerAvailability.providerId, providerId));

  if (availability.length === 0) {
    throw new Error("El proveedor no tiene disponibilidad configurada");
  }

  const specific = availability.find(a =>
    a.specificDate &&
    a.specificDate.toISOString().slice(0, 10) === date.toISOString().slice(0, 10) &&
    a.isActive
  );

  const recurring = availability.filter(a =>
    a.isRecurring &&
    a.dayOfWeek === day &&
    a.isActive
  );

  const slots = specific ? [specific] : recurring;

  if (slots.length === 0) {
    throw new Error("El proveedor no trabaja ese día");
  }

  const start = timeStr;
  const end = new Date(date.getTime() + durationMinutes * 60000)
    .toTimeString()
    .slice(0, 8);

  const fits = slots.some(slot =>
    start >= slot.startTime && end <= slot.endTime
  );

  if (!fits) {
    throw new Error("El proveedor no está disponible en ese horario");
  }

  const sameDayRequests = await db
    .select()
    .from(serviceRequests)
    .where(
      and(
        eq(serviceRequests.providerId, providerId),
        eq(serviceRequests.status, "accepted")
      )
    );

  const count = sameDayRequests.filter(r =>
    r.preferredDate &&
    r.preferredDate.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
  ).length;

  const slot = slots[0];
  if (count >= slot.maxBookings) {
    throw new Error("El proveedor alcanzó el máximo de reservas para ese día");
  }

  for (const r of sameDayRequests) {
    if (!r.preferredDate) continue;

    const otherStart = r.preferredDate;
    const otherEnd = new Date(otherStart.getTime() + (r.durationMinutes ?? 60) * 60000);

    const thisStart = date;
    const thisEnd = new Date(date.getTime() + durationMinutes * 60000);

    const overlap =
      (thisStart >= otherStart && thisStart < otherEnd) ||
      (thisEnd > otherStart && thisEnd <= otherEnd);

    if (overlap) {
      throw new Error("El proveedor ya tiene un trabajo en ese horario");
    }
  }
}

// -----------------------------
// Service
// -----------------------------
export const serviceRequestsService = {
  // ---------------------------------------------------------
  // Crear solicitud
  // ---------------------------------------------------------
  async create(customerId: string, data: any) {
    ensureString(customerId, "customerId");
    ensureString(data.title, "title");
    ensureString(data.description, "description");
    ensureString(data.address, "address");
    ensureString(data.city, "city");
    ensureString(data.province, "province");

    if (!data.categoryId) {
      throw new Error("categoryId es obligatorio");
    }

    if (data.serviceId) {
      const exists = await db
        .select()
        .from(providerServices)
        .where(eq(providerServices.id, data.serviceId));

      if (exists.length === 0) {
        throw new Error("serviceId no existe");
      }
    }

    // Validación de disponibilidad (si viene providerId + fecha)
    if (data.providerId && data.preferredDate) {
      const duration = data.durationMinutes ?? 60;
      await checkProviderAvailability(
        data.providerId,
        new Date(data.preferredDate),
        duration
      );
    }

    const [created] = await db
      .insert(serviceRequests)
      .values({
        customerId,
        providerId: data.providerId ?? null,
        categoryId: data.categoryId,
        serviceId: data.serviceId ?? null,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        province: data.province,
        preferredDate: data.preferredDate ?? null,
        estimatedBudget: data.estimatedBudget ?? null,
        isUrgent: data.isUrgent ?? false,
        customerNotes: data.customerNotes ?? null,
      })
      .returning();

    return created;
  },

  // ---------------------------------------------------------
  // Obtener solicitudes del cliente
  // ---------------------------------------------------------
  async getByCustomer(customerId: string) {
    ensureString(customerId, "customerId");

    return db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.customerId, customerId));
  },

  // ---------------------------------------------------------
  // Obtener solicitudes del proveedor
  // ---------------------------------------------------------
  async getByProvider(providerId: number) {
    if (!providerId) throw new Error("providerId inválido");

    return db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));
  },

  // ---------------------------------------------------------
  // Cotizar (provider)
  // ---------------------------------------------------------
  async quote(requestId: number, providerId: number, price: number) {
    ensureNumber(price, "quotedPrice");

    const [req] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!req) throw new Error("Solicitud no encontrada");
    if (req.providerId !== providerId) throw new Error("No autorizado");

    ensureStatusTransition(req.status, "quoted");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        quotedPrice: price,
        quotedAt: new Date(),
        status: "quoted",
        providerRespondedAt: req.providerRespondedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return updated;
  },

  // ---------------------------------------------------------
  // Aceptar cotización (cliente)
  // ---------------------------------------------------------
  async accept(requestId: number, customerId: string) {
    ensureString(customerId, "customerId");

    const [req] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!req) throw new Error("Solicitud no encontrada");
    if (req.customerId !== customerId) throw new Error("No autorizado");

    ensureStatusTransition(req.status, "accepted");

    // Validación de disponibilidad obligatoria
    if (req.preferredDate) {
      const duration = req.durationMinutes ?? 60;
      await checkProviderAvailability(
        req.providerId,
        new Date(req.preferredDate),
        duration
      );
    }

    const [updated] = await db
      .update(serviceRequests)
      .set({
        acceptedAt: new Date(),
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return updated;
  },

  // ---------------------------------------------------------
  // Marcar como en progreso (provider)
  // ---------------------------------------------------------
  async start(requestId: number, providerId: number) {
    const [req] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!req) throw new Error("Solicitud no encontrada");
    if (req.providerId !== providerId) throw new Error("No autorizado");

    ensureStatusTransition(req.status, "in_progress");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return updated;
  },

  // ---------------------------------------------------------
  // Completar (provider)
  // ---------------------------------------------------------
  async complete(requestId: number, providerId: number) {
    const [req] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!req) throw new Error("Solicitud no encontrada");
    if (req.providerId !== providerId) throw new Error("No autorizado");

    ensureStatusTransition(req.status, "completed");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        completedAt: new Date(),
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return updated;
  },

  // ---------------------------------------------------------
  // Cancelar (cliente o proveedor)
  // ---------------------------------------------------------
  async cancel(requestId: number, actor: "customer" | "provider", actorId: string | number) {
    const [req] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!req) throw new Error("Solicitud no encontrada");

    if (actor === "customer" && req.customerId !== actorId) {
      throw new Error("No autorizado");
    }

    if (actor === "provider" && req.providerId !== actorId) {
      throw new Error("No autorizado");
    }

    ensureStatusTransition(req.status, "cancelled");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        cancelledAt: new Date(),
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return updated;
  },
};

