import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { eq, and } from "drizzle-orm";

function validateDate(date: string | null) {
  return date === null || /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validatePrice(price: number) {
  return typeof price === "number" && price >= 0 && price <= 1_000_000;
}

export const serviceRequestsService = {
  async create(data: any) {
    if (!data.customerId) throw new Error("customerId requerido");
    if (!data.categoryId) throw new Error("categoryId requerido");
    if (!data.title || data.title.trim().length < 3)
      throw new Error("Título inválido");
    if (!validateDate(data.preferredDate))
      throw new Error("Fecha inválida (usar YYYY-MM-DD)");

    const [created] = await db
      .insert(serviceRequests)
      .values({
        customerId: data.customerId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        province: data.province ?? null,
        preferredDate: data.preferredDate ?? null,
        estimatedBudget: data.estimatedBudget ?? null,
        isUrgent: data.isUrgent ?? false,
        customerNotes: data.customerNotes ?? null,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();

    return created;
  },

  async getById(id: number) {
    return db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, id),
      with: {
        client: true,
        provider: true,
        service: true,
      },
    });
  },

  async getByCustomer(customerId: number) {
    return db.query.serviceRequests.findMany({
      where: eq(serviceRequests.customerId, customerId),
      orderBy: (req, { desc }) => desc(req.createdAt),
      with: {
        provider: true,
        service: true,
      },
    });
  },

  async getByProvider(providerId: number) {
    return db.query.serviceRequests.findMany({
      where: eq(serviceRequests.providerId, providerId),
      orderBy: (req, { desc }) => desc(req.createdAt),
      with: {
        client: true,
        service: true,
      },
    });
  },

  // -----------------------------
  // QUOTE
  // -----------------------------
  async quote(id: number, providerId: number, price: number) {
    if (!validatePrice(price)) throw new Error("Precio inválido");

    const req = await this.getById(id);
    if (!req) throw new Error("Solicitud no encontrada");

    if (req.providerId !== providerId)
      throw new Error("No autorizado para cotizar esta solicitud");

    if (req.status !== "pending")
      throw new Error("Solo se puede cotizar solicitudes pendientes");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        quotedPrice: price,
        quotedAt: new Date(),
        status: "quoted",
      })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  },

  // -----------------------------
  // ACCEPT
  // -----------------------------
  async accept(id: number, customerId: number) {
    const req = await this.getById(id);
    if (!req) throw new Error("Solicitud no encontrada");

    if (req.customerId !== customerId)
      throw new Error("No autorizado para aceptar esta solicitud");

    if (req.status !== "quoted")
      throw new Error("Solo se puede aceptar solicitudes cotizadas");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  },

  // -----------------------------
  // COMPLETE
  // -----------------------------
  async complete(id: number, providerId: number) {
    const req = await this.getById(id);
    if (!req) throw new Error("Solicitud no encontrada");

    if (req.providerId !== providerId)
      throw new Error("No autorizado para completar esta solicitud");

    if (req.status !== "accepted")
      throw new Error("Solo se puede completar solicitudes aceptadas");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  },

  // -----------------------------
  // CANCEL
  // -----------------------------
  async cancel(id: number, userId: number) {
    const req = await this.getById(id);
    if (!req) throw new Error("Solicitud no encontrada");

    if (req.customerId !== userId && req.providerId !== userId)
      throw new Error("No autorizado para cancelar esta solicitud");

    if (req.status === "completed")
      throw new Error("No se puede cancelar una solicitud completada");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  },

  // -----------------------------
  // PAYMENT STATUS
  // -----------------------------
  async updatePaymentStatus(id: number, status: string, intentId?: string) {
    const validStatuses = ["pending", "processing", "paid", "failed", "refunded"];

    if (!validStatuses.includes(status))
      throw new Error("Estado de pago inválido");

    const [updated] = await db
      .update(serviceRequests)
      .set({
        paymentStatus: status,
        stripePaymentIntentId: intentId ?? null,
      })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  },
};

