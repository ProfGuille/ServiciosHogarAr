// backend/src/routes/unlockLead.ts
// Endpoint para desbloquear leads con créditos

import { Router } from "express";
import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { leadResponses } from "../shared/schema/leadResponses.js";
import { providerCredits } from "../shared/schema/providerCredits.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// POST /api/service-requests/:id/unlock
// Desbloquea un lead gastando 1 crédito
router.post("/:id/unlock", async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const providerId = req.user?.providerId; // Asume middleware de auth

    if (!providerId) {
      return res.status(401).json({ error: "No autenticado como proveedor" });
    }

    // 1. Verificar que el lead existe
    const [lead] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!lead) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // 2. Verificar si ya desbloqueó este lead
    const [existing] = await db
      .select()
      .from(leadResponses)
      .where(
        and(
          eq(leadResponses.leadId, requestId),
          eq(leadResponses.providerId, providerId)
        )
      );

    if (existing) {
      // Ya lo desbloqueó antes, devuelve datos sin cobrar de nuevo
      return res.json({
        alreadyUnlocked: true,
        lead: {
          id: lead.id,
          title: lead.title,
          description: lead.description,
          customerName: lead.customer_first_name,
          customerPhone: lead.customer_phone,
          customerEmail: lead.customer_email,
          neighborhood: lead.neighborhood,
          city: lead.city,
          province: lead.province,
          preferredDate: lead.preferredDate,
          isUrgent: lead.isUrgent,
        },
      });
    }

    // 3. Verificar que tiene créditos suficientes
    const [credits] = await db
      .select()
      .from(providerCredits)
      .where(eq(providerCredits.providerId, providerId));

    if (!credits || credits.currentCredits < 1) {
      return res.status(402).json({ 
        error: "Créditos insuficientes",
        currentCredits: credits?.currentCredits || 0,
        required: 1
      });
    }

    // 4. OPERACIÓN ATÓMICA: Desbloquear + restar crédito
    await db.transaction(async (tx) => {
      // Registrar desbloqueo
      await tx.insert(leadResponses).values({
        leadId: requestId,
        providerId: providerId,
        creditsSpent: 1,
        unlockedAt: new Date(),
      });

      // Restar 1 crédito (operación SQL atómica)
      await tx
        .update(providerCredits)
        .set({
          currentCredits: credits.currentCredits - 1,
        })
        .where(eq(providerCredits.providerId, providerId));
    });

    // 5. Devolver datos completos del lead
    res.json({
      success: true,
      creditsSpent: 1,
      remainingCredits: credits.currentCredits - 1,
      lead: {
        id: lead.id,
        title: lead.title,
        description: lead.description,
        customerName: lead.customer_first_name,
        customerPhone: lead.customer_phone,
        customerEmail: lead.customer_email,
        neighborhood: lead.neighborhood,
        city: lead.city,
        province: lead.province,
        preferredDate: lead.preferredDate,
        isUrgent: lead.isUrgent,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    console.error("Error desbloqueando lead:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
