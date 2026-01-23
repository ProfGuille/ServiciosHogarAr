// backend/src/routes/availableLeads.ts
// Endpoint para listar leads disponibles para un proveedor

import { Router } from "express";
import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { leadResponses } from "../shared/schema/leadResponses.js";
import { providerServices } from "../shared/schema/providerServices.js";
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

// GET /api/service-requests/available
// Lista leads disponibles para el proveedor autenticado
router.get("/available", async (req, res) => {
  try {
    const providerId = req.user?.providerId;

    if (!providerId) {
      return res.status(401).json({ error: "No autenticado como proveedor" });
    }

    // 1. Obtener categorías de servicios que ofrece el proveedor
    const providerCategories = await db
      .select({ categoryId: providerServices.categoryId })
      .from(providerServices)
      .where(eq(providerServices.providerId, providerId));

    const categoryIds = providerCategories.map((c) => c.categoryId);

    if (categoryIds.length === 0) {
      return res.json({
        available: [],
        unlocked: [],
        message: "Configure los servicios que ofrece primero",
      });
    }

    // 2. Obtener todas las solicitudes pendientes en esas categorías
    const allLeads = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.status, "pending"),
          inArray(serviceRequests.categoryId, categoryIds)
        )
      )
      .orderBy(serviceRequests.createdAt);

    // 3. Obtener leads que ya desbloqueó este proveedor
    const unlockedLeadIds = await db
      .select({ leadId: leadResponses.leadId })
      .from(leadResponses)
      .where(eq(leadResponses.providerId, providerId));

    const unlockedIds = new Set(unlockedLeadIds.map((l) => l.leadId));

    // 4. Separar en disponibles vs desbloqueados
    const available = allLeads
      .filter((lead) => !unlockedIds.has(lead.id))
      .map((lead) => ({
        id: lead.id,
        title: lead.title,
        descriptionPreview: lead.description.substring(0, 100) + "...",
        neighborhood: lead.neighborhood,
        city: lead.city,
        province: lead.province,
        preferredDate: lead.preferredDate,
        isUrgent: lead.isUrgent,
        createdAt: lead.createdAt,
        creditCost: 1,
        unlocked: false,
      }));

    const unlocked = allLeads
      .filter((lead) => unlockedIds.has(lead.id))
      .map((lead) => ({
        id: lead.id,
        title: lead.title,
        description: lead.description, // Completa
        customerName: lead.customer_first_name,
        customerPhone: lead.customer_phone,
        customerEmail: lead.customer_email,
        neighborhood: lead.neighborhood,
        city: lead.city,
        province: lead.province,
        preferredDate: lead.preferredDate,
        isUrgent: lead.isUrgent,
        createdAt: lead.createdAt,
        unlocked: true,
      }));

    res.json({
      available,
      unlocked,
      totalAvailable: available.length,
      totalUnlocked: unlocked.length,
    });
  } catch (error) {
    console.error("Error obteniendo leads:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
