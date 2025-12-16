import { db } from "../db.js";
import { payments } from "../shared/schema/payments.js";
import { conversations } from "../shared/schema/conversations.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { eq, and, desc } from "drizzle-orm";

export const paymentsService = {
  async listForUser(userId: number, role: "customer" | "provider") {
    const field =
      role === "customer"
        ? serviceRequests.clientId
        : serviceRequests.providerId;

    return db
      .select({
        id: payments.id,
        serviceRequestId: payments.serviceRequestId,
        status: payments.status,
        intentId: payments.intentId,
        amount: payments.amount,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(serviceRequests, eq(payments.serviceRequestId, serviceRequests.id))
      .where(eq(field, userId))
      .orderBy(desc(payments.createdAt));
  },

  async getByServiceRequest(serviceRequestId: number, userId: number) {
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.serviceRequestId, serviceRequestId))
      .then(rows => rows[0]);

    if (!payment) return null;

    const request = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, serviceRequestId))
      .then(rows => rows[0]);

    if (!request) return null;

    if (request.clientId !== userId && request.providerId !== userId) {
      return "forbidden";
    }

    return payment;
  }
};

