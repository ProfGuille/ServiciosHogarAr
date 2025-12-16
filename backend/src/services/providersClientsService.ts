import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { clients } from "../shared/schema/clients.js";
import { reviews } from "../shared/schema/reviews.js";
import { eq, and, inArray } from "drizzle-orm";

type ClientStatus = "all" | "active" | "inactive" | "frequent";

export const providersClientsService = {
  // ---------------------------------------------------------
  // LISTAR CLIENTES DEL PROVEEDOR
  // ---------------------------------------------------------
  async list(providerId: number, search?: string, status: ClientStatus = "all") {
    // 1) Obtener IDs de clientes del provider
    const requestRows = await db
      .select({
        customerId: serviceRequests.customerId,
        createdAt: serviceRequests.createdAt,
        quotedPrice: serviceRequests.quotedPrice,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));

    if (requestRows.length === 0) return [];

    const clientIds = [...new Set(requestRows.map((r) => r.customerId))];

    // 2) Obtener datos de clientes
    const clientRows = await db
      .select()
      .from(clients)
      .where(inArray(clients.id, clientIds));

    // 3) Obtener reviews del provider
    const reviewRows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    // 4) Agregación eficiente
    const reviewsByClient = new Map<number, typeof reviewRows>();
    for (const r of reviewRows) {
      const arr = reviewsByClient.get(r.customerId) ?? [];
      arr.push(r);
      reviewsByClient.set(r.customerId, arr);
    }

    const requestsByClient = new Map<number, typeof requestRows>();
    for (const r of requestRows) {
      const arr = requestsByClient.get(r.customerId) ?? [];
      arr.push(r);
      requestsByClient.set(r.customerId, arr);
    }

    const aggregated = clientRows.map((c) => {
      const reqs = requestsByClient.get(c.id) ?? [];
      const revs = reviewsByClient.get(c.id) ?? [];

      const totalSpent = reqs.reduce(
        (sum, r) => sum + Number(r.quotedPrice || 0),
        0
      );

      const avgRating =
        revs.length > 0
          ? revs.reduce((s, r) => s + Number(r.rating), 0) / revs.length
          : null;

      const sorted = reqs.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      const lastBooking = sorted[0]?.createdAt ?? null;
      const firstBooking = sorted[sorted.length - 1]?.createdAt ?? null;

      let computedStatus: ClientStatus | "vip" = "inactive";
      if (reqs.length > 3) computedStatus = "frequent";
      else if (reqs.length > 0) computedStatus = "active";

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        totalBookings: reqs.length,
        totalSpent,
        averageRating: avgRating,
        lastBooking,
        firstBooking,
        status: computedStatus,
      };
    });

    // 5) Filtro por texto
    let filtered = aggregated;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
      );
    }

    // 6) Filtro por status
    if (status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }

    return filtered;
  },

  // ---------------------------------------------------------
  // DETALLE DE CLIENTE
  // ---------------------------------------------------------
  async getDetails(providerId: number, clientId: number) {
    // Validar que el cliente exista
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .then((rows) => rows[0]);

    if (!client) return null;

    // Validar que el cliente pertenezca al provider
    const requests = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.providerId, providerId),
          eq(serviceRequests.customerId, clientId)
        )
      );

    if (requests.length === 0) return null;

    // Reviews
    const reviewsData = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.providerId, providerId),
          eq(reviews.customerId, clientId)
        )
      );

    const reviewsByRequest = new Map<number, (typeof reviewsData)[number]>();
    for (const r of reviewsData) {
      reviewsByRequest.set(r.requestId, r);
    }

    const bookingHistory = requests
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => {
        const review = reviewsByRequest.get(r.id);
        return {
          id: r.id,
          date: r.createdAt,
          serviceName: r.title,
          price: Number(r.quotedPrice || 0),
          status: r.status,
          rating: review?.rating ?? null,
          review: review?.comment ?? null,
        };
      });

    const totalRevenue = bookingHistory.reduce(
      (sum, b) => sum + b.price,
      0
    );

    const averageBookingValue =
      bookingHistory.length > 0
        ? totalRevenue / bookingHistory.length
        : 0;

    return {
      client,
      bookingHistory,
      totalRevenue,
      averageBookingValue,
    };
  },

  // ---------------------------------------------------------
  // ACTUALIZAR NOTAS (placeholder)
  // ---------------------------------------------------------
  async updateNotes(providerId: number, clientId: number, notes: string) {
    // Validar que el cliente pertenezca al provider
    const exists = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.providerId, providerId),
          eq(serviceRequests.customerId, clientId)
        )
      );

    if (exists.length === 0) {
      throw new Error("Cliente no pertenece al proveedor");
    }

    // Placeholder
    return {
      providerId,
      clientId,
      notes,
      updatedAt: new Date(),
    };
  },

  // ---------------------------------------------------------
  // ESTADÍSTICAS
  // ---------------------------------------------------------
  async getStats(providerId: number) {
    const requests = await db
      .select({
        customerId: serviceRequests.customerId,
        createdAt: serviceRequests.createdAt,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));

    if (requests.length === 0) {
      return {
        total: 0,
        frequent: 0,
        recent: 0,
      };
    }

    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const clientsMap = new Map<number, { count: number; lastDate: Date }>();

    for (const r of requests) {
      const entry = clientsMap.get(r.customerId) ?? {
        count: 0,
        lastDate: r.createdAt,
      };
      entry.count++;
      if (r.createdAt > entry.lastDate) entry.lastDate = r.createdAt;
      clientsMap.set(r.customerId, entry);
    }

    let frequent = 0;
    let recent = 0;

    for (const { count, lastDate } of clientsMap.values()) {
      if (count > 3) frequent++;
      if (now - lastDate.getTime() <= THIRTY_DAYS_MS) recent++;
    }

    return {
      total: clientsMap.size,
      frequent,
      recent,
    };
  },
};

