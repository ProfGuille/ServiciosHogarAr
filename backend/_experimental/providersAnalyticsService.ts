import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { reviews } from "../shared/schema/reviews.js";
import { payments } from "../shared/schema/payments.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq, gte, and } from "drizzle-orm";

export const providersAnalyticsService = {
  // ---------------------------------------------------------
  // OVERVIEW PRINCIPAL
  // ---------------------------------------------------------
  async getOverview(providerId: number, days = 30) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    if (days <= 0) days = 30;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // BOOKINGS (últimos X días)
    const requests = await db
      .select({
        id: serviceRequests.id,
        createdAt: serviceRequests.createdAt,
      })
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.providerId, providerId),
          gte(serviceRequests.createdAt, since)
        )
      );

    const totalBookings = requests.length;

    // REVENUE (JOIN CORRECTO, últimos X días)
    const paymentsData = await db
      .select({
        amount: payments.amount,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(
        serviceRequests,
        eq(payments.serviceRequestId, serviceRequests.id)
      )
      .where(
        and(
          eq(serviceRequests.providerId, providerId),
          gte(payments.createdAt, since)
        )
      );

    const totalRevenue = paymentsData.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    // REVIEWS (acumuladas, como ya tenías)
    const reviewsData = await db
      .select({
        rating: reviews.rating,
      })
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    const averageRating =
      reviewsData.length > 0
        ? reviewsData.reduce((s, r) => s + Number(r.rating), 0) /
          reviewsData.length
        : 0;

    // Mantenemos exactamente las mismas claves
    return {
      totalRevenue,
      totalBookings,
      averageRating,
      responseRate: null,   // a implementar luego con analyticsEvents
      conversionRate: null, // a implementar luego con funil de serviceRequests
      revenueChange: null,
      bookingsChange: null,
    };
  },

  // ---------------------------------------------------------
  // REVENUE CHART (mismo formato)
  // ---------------------------------------------------------
  async getRevenueChart(providerId: number, days = 30) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    if (days <= 0) days = 30;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const paymentsData = await db
      .select({
        amount: payments.amount,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(
        serviceRequests,
        eq(payments.serviceRequestId, serviceRequests.id)
      )
      .where(
        and(
          eq(serviceRequests.providerId, providerId),
          gte(payments.createdAt, since)
        )
      );

    // Preparamos el mapa de días vacío
    const map = new Map<string, { date: string; revenue: number; bookings: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      map.set(key, { date: key, revenue: 0, bookings: 0 });
    }

    // Sumamos revenue y bookings por día
    for (const p of paymentsData) {
      const key = p.createdAt.toISOString().split("T")[0];
      const entry = map.get(key);
      if (entry) {
        entry.revenue += Number(p.amount || 0);
        entry.bookings += 1;
      }
    }

    // Mismo formato que tenías: array ordenado por fecha
    return Array.from(map.values());
  },

  // ---------------------------------------------------------
  // PERFORMANCE POR SERVICIO
  // ---------------------------------------------------------
  async getServicePerformance(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    // Services del provider
    const services = await db
      .select()
      .from(providerServices)
      .where(eq(providerServices.providerId, providerId));

    if (services.length === 0) {
      return [];
    }

    const serviceIds = services.map((s) => s.serviceId);

    // Requests solo de esos services
    const requests = await db
      .select({
        serviceId: serviceRequests.serviceId,
        quotedPrice: serviceRequests.quotedPrice,
      })
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.providerId, providerId),
          // solo los serviceIds relevantes
          serviceRequests.serviceId.in(serviceIds as any)
        )
      );

    // Reviews solo de esos services
    const reviewsData = await db
      .select({
        serviceId: reviews.serviceId,
        rating: reviews.rating,
      })
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    // Agregamos en memoria pero con estructura O(N), no O(N²)
    const requestsByService = new Map<number, typeof requests>();
    for (const r of requests) {
      const arr = requestsByService.get(r.serviceId) ?? [];
      arr.push(r);
      requestsByService.set(r.serviceId, arr);
    }

    const reviewsByService = new Map<number, typeof reviewsData>();
    for (const r of reviewsData) {
      const arr = reviewsByService.get(r.serviceId) ?? [];
      arr.push(r);
      reviewsByService.set(r.serviceId, arr);
    }

    return services.map((s) => {
      const relatedRequests = requestsByService.get(s.serviceId) ?? [];
      const relatedReviews = reviewsByService.get(s.serviceId) ?? [];

      const revenue = relatedRequests.reduce(
        (sum, r) => sum + Number(r.quotedPrice || 0),
        0
      );

      const avgRating =
        relatedReviews.length > 0
          ? relatedReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
            relatedReviews.length
          : 0;

      return {
        serviceId: s.serviceId,
        serviceName: s.serviceName || s.customServiceName,
        bookings: relatedRequests.length,
        revenue,
        averageRating: avgRating,
        responseTime: null, // se puede implementar después con analyticsEvents
      };
    });
  },

  // ---------------------------------------------------------
  // MÉTRICAS DE CLIENTES
  // ---------------------------------------------------------
  async getClientMetrics(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    const requests = await db
      .select({
        customerId: serviceRequests.customerId,
        quotedPrice: serviceRequests.quotedPrice,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));

    if (requests.length === 0) {
      return {
        newClients: 0,
        returningClients: 0,
        clientSatisfaction: null,
        averageProjectValue: 0,
      };
    }

    const clientsMap = new Map<number, { count: number }>();

    for (const r of requests) {
      const entry = clientsMap.get(r.customerId) ?? { count: 0 };
      entry.count++;
      clientsMap.set(r.customerId, entry);
    }

    let newClients = 0;
    let returningClients = 0;

    for (const { count } of clientsMap.values()) {
      if (count === 1) newClients++;
      else returningClients++;
    }

    const totalValue = requests.reduce(
      (sum, r) => sum + Number(r.quotedPrice || 0),
      0
    );

    const avgValue =
      requests.length > 0 ? totalValue / requests.length : 0;

    // Mantenemos las mismas claves
    return {
      newClients,
      returningClients,
      clientSatisfaction: null, // se puede calcular con reviews más adelante
      averageProjectValue: avgValue,
    };
  },

  // ---------------------------------------------------------
  // TENDENCIAS MENSUALES
  // ---------------------------------------------------------
  async getMonthlyTrends(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    const requests = await db
      .select({
        createdAt: serviceRequests.createdAt,
        quotedPrice: serviceRequests.quotedPrice,
        customerId: serviceRequests.customerId,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));

    if (requests.length === 0) {
      return [];
    }

    type MonthlyBucket = {
      month: string;
      revenue: number;
      bookings: number;
      clients: Set<number>;
    };

    const map = new Map<string, MonthlyBucket>();

    for (const r of requests) {
      const monthKey = r.createdAt.toISOString().slice(0, 7); // YYYY-MM

      let entry = map.get(monthKey);
      if (!entry) {
        entry = {
          month: monthKey,
          revenue: 0,
          bookings: 0,
          clients: new Set<number>(),
        };
        map.set(monthKey, entry);
      }

      entry.revenue += Number(r.quotedPrice || 0);
      entry.bookings += 1;
      entry.clients.add(r.customerId);
    }

    // Mismo formato que tenías: month, revenue, bookings, newClients
    return Array.from(map.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        month: m.month,
        revenue: m.revenue,
        bookings: m.bookings,
        newClients: m.clients.size,
      }));
  },

  // ---------------------------------------------------------
  // ACTIVE SERVICES (para usar en /summary si querés)
  // ---------------------------------------------------------
  async getActiveServices(providerId: number) {
    if (!providerId || providerId <= 0) {
      throw new Error("providerId inválido");
    }

    const services = await db
      .select({
        id: providerServices.id,
      })
      .from(providerServices)
      .where(
        and(
          eq(providerServices.providerId, providerId),
          eq(providerServices.isActive, true as any)
        )
      );

    return services.length;
  },
};

