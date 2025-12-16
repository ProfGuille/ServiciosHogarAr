import { db } from "../db.js";
import { providerAvailability } from "../shared/schema/providerAvailability.js";
import { eq, and } from "drizzle-orm";

// -----------------------------
// Helpers
// -----------------------------
function validateTime(time: string) {
  return /^\d{2}:\d{2}$/.test(time);
}

function validateDayOfWeek(day: number | null) {
  return day === null || (Number.isInteger(day) && day >= 0 && day <= 6);
}

function validateDate(date: string | null) {
  return date === null || /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const a1 = timeToMinutes(aStart);
  const a2 = timeToMinutes(aEnd);
  const b1 = timeToMinutes(bStart);
  const b2 = timeToMinutes(bEnd);
  return a1 < b2 && b1 < a2;
}

// -----------------------------
// Service
// -----------------------------
export const providersAvailabilityService = {
  async getByProvider(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    return db
      .select()
      .from(providerAvailability)
      .where(eq(providerAvailability.providerId, providerId));
  },

  async create(providerId: number, data: any) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    // -----------------------------
    // Validaciones básicas
    // -----------------------------
    if (!validateDayOfWeek(data.dayOfWeek)) {
      throw new Error("dayOfWeek inválido");
    }

    if (!validateTime(data.startTime) || !validateTime(data.endTime)) {
      throw new Error("Formato de hora inválido (usar HH:MM)");
    }

    if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
      throw new Error("startTime debe ser menor que endTime");
    }

    if (!validateDate(data.specificDate)) {
      throw new Error("Fecha específica inválida (usar YYYY-MM-DD)");
    }

    if (data.isRecurring === false && !data.specificDate) {
      throw new Error("Los bloques no recurrentes requieren specificDate");
    }

    if (data.isRecurring === true && data.specificDate) {
      throw new Error("Los bloques recurrentes no pueden tener specificDate");
    }

    if (data.maxBookings !== undefined) {
      if (isNaN(data.maxBookings) || data.maxBookings < 1) {
        throw new Error("maxBookings debe ser >= 1");
      }
    }

    // -----------------------------
    // Validación de solapamientos
    // -----------------------------
    const existing = await this.getByProvider(providerId);

    const overlaps = existing.some((slot) => {
      const sameRecurring = slot.isRecurring === data.isRecurring;

      if (!sameRecurring) return false;

      if (slot.isRecurring) {
        if (slot.dayOfWeek !== data.dayOfWeek) return false;
      } else {
        const slotDate = slot.specificDate?.toISOString().slice(0, 10);
        if (slotDate !== data.specificDate) return false;
      }

      return rangesOverlap(slot.startTime, slot.endTime, data.startTime, data.endTime);
    });

    if (overlaps) {
      throw new Error("El bloque se solapa con otro existente");
    }

    // -----------------------------
    // Crear bloque
    // -----------------------------
    const [created] = await db
      .insert(providerAvailability)
      .values({
        providerId,
        dayOfWeek: data.dayOfWeek ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? true,
        specificDate: data.specificDate ?? null,
        maxBookings: data.maxBookings ?? 1,
        isActive: true,
      })
      .returning();

    return created;
  },

  async update(id: number, providerId: number, data: any) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    // -----------------------------
    // Validar existencia
    // -----------------------------
    const existing = await db
      .select()
      .from(providerAvailability)
      .where(
        and(
          eq(providerAvailability.id, id),
          eq(providerAvailability.providerId, providerId)
        )
      );

    if (existing.length === 0) {
      throw new Error("Bloque no encontrado o no autorizado");
    }

    const current = existing[0];

    // -----------------------------
    // Validaciones
    // -----------------------------
    const newDay = data.dayOfWeek ?? current.dayOfWeek;
    const newStart = data.startTime ?? current.startTime;
    const newEnd = data.endTime ?? current.endTime;
    const newRecurring = data.isRecurring ?? current.isRecurring;
    const newDate = data.specificDate ?? current.specificDate;

    if (!validateDayOfWeek(newDay)) {
      throw new Error("dayOfWeek inválido");
    }

    if (!validateTime(newStart) || !validateTime(newEnd)) {
      throw new Error("Formato de hora inválido");
    }

    if (timeToMinutes(newStart) >= timeToMinutes(newEnd)) {
      throw new Error("startTime debe ser menor que endTime");
    }

    if (!validateDate(newDate)) {
      throw new Error("Fecha específica inválida");
    }

    if (newRecurring === false && !newDate) {
      throw new Error("Los bloques no recurrentes requieren specificDate");
    }

    if (newRecurring === true && newDate) {
      throw new Error("Los bloques recurrentes no pueden tener specificDate");
    }

    if (data.maxBookings !== undefined) {
      if (isNaN(data.maxBookings) || data.maxBookings < 1) {
        throw new Error("maxBookings debe ser >= 1");
      }
    }

    if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
      throw new Error("isActive debe ser boolean");
    }

    if (data.isRecurring !== undefined && typeof data.isRecurring !== "boolean") {
      throw new Error("isRecurring debe ser boolean");
    }

    // -----------------------------
    // Validación de solapamientos
    // -----------------------------
    const all = await this.getByProvider(providerId);

    const overlaps = all.some((slot) => {
      if (slot.id === id) return false;

      if (slot.isRecurring !== newRecurring) return false;

      if (slot.isRecurring) {
        if (slot.dayOfWeek !== newDay) return false;
      } else {
        const slotDate = slot.specificDate?.toISOString().slice(0, 10);
        const newDateStr = newDate;
        if (slotDate !== newDateStr) return false;
      }

      return rangesOverlap(slot.startTime, slot.endTime, newStart, newEnd);
    });

    if (overlaps) {
      throw new Error("El bloque actualizado se solapa con otro existente");
    }

    // -----------------------------
    // Actualizar
    // -----------------------------
    const allowedFields = [
      "dayOfWeek",
      "startTime",
      "endTime",
      "isRecurring",
      "specificDate",
      "maxBookings",
      "isActive",
    ];

    const safeData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) safeData[key] = data[key];
    }

    const [updated] = await db
      .update(providerAvailability)
      .set(safeData)
      .where(eq(providerAvailability.id, id))
      .returning();

    return updated;
  },

  async delete(id: number, providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    const [deleted] = await db
      .delete(providerAvailability)
      .where(
        and(
          eq(providerAvailability.id, id),
          eq(providerAvailability.providerId, providerId)
        )
      )
      .returning();

    if (!deleted) {
      throw new Error("Bloque no encontrado o no autorizado");
    }

    return deleted;
  },

  async checkAvailability(providerId: number, date: string, time: string) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    if (!validateDate(date)) {
      throw new Error("Fecha inválida (usar YYYY-MM-DD)");
    }

    if (!validateTime(time)) {
      throw new Error("Hora inválida (usar HH:MM)");
    }

    const dayOfWeek = new Date(date).getDay();

    const slots = await db
      .select()
      .from(providerAvailability)
      .where(
        and(
          eq(providerAvailability.providerId, providerId),
          eq(providerAvailability.isActive, true)
        )
      );

    const matching = slots.filter((slot) => {
      const recurringMatch =
        slot.isRecurring && slot.dayOfWeek === dayOfWeek;

      const specificMatch =
        !slot.isRecurring &&
        slot.specificDate?.toISOString().slice(0, 10) === date;

      if (!recurringMatch && !specificMatch) return false;

      return time >= slot.startTime && time <= slot.endTime;
    });

    return {
      available: matching.length > 0,
      slots: matching,
    };
  },
};

