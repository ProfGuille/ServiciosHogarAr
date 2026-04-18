import { Router } from "express";
import { checkAndGrantAchievements } from "./achievements.js";
import { db, sql as neonSql } from "../db.js";
import { 
  serviceRequests, 
  leadResponses, 
  categories,
  providerCredits
} from "../shared/schema/index.js";
import { eq, and, notInArray, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/available", async (req, res) => {
  try {
    const providerId = parseInt(req.query.providerId as string);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!providerId || isNaN(providerId)) {
      return res.status(400).json({ 
        error: "providerId es requerido y debe ser un número válido" 
      });
    }

    const unlockedLeadIds = await db
      .select({ serviceRequestId: leadResponses.serviceRequestId })
      .from(leadResponses)
      .where(eq(leadResponses.providerId, providerId));

    const unlockedIds = unlockedLeadIds.map(r => r.serviceRequestId);

    let query = db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        descriptionPreview: sql<string>`LEFT(${serviceRequests.description}, 100)`,
        neighborhood: serviceRequests.neighborhood,
        city: serviceRequests.city,
        province: serviceRequests.province,
        categoryId: serviceRequests.categoryId,
        categoryName: categories.name,
        isUrgent: serviceRequests.isUrgent,
        preferredDate: serviceRequests.preferredDate,
        createdAt: serviceRequests.createdAt,
        status: serviceRequests.status,
        hasAccount: sql<boolean>`(${serviceRequests.customerId} IS NOT NULL)`
      })
      .from(serviceRequests)
      .leftJoin(categories, eq(serviceRequests.categoryId, categories.id))
      .where(
        and(
          eq(serviceRequests.status, "pending"),
          unlockedIds.length > 0 
            ? notInArray(serviceRequests.id, unlockedIds)
            : undefined
        )
      )
      .orderBy(desc(serviceRequests.createdAt))
      .limit(limit)
      .offset(offset);

    const leads = await query;

    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.status, "pending"),
          unlockedIds.length > 0 
            ? notInArray(serviceRequests.id, unlockedIds)
            : undefined
        )
      );

    const total = Number(countResult[0]?.count || 0);

    res.json({
      data: leads.map(lead => ({
        ...lead,
        descriptionPreview: lead.descriptionPreview + (lead.descriptionPreview.length >= 100 ? "..." : "")
      })),
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
      limit
    });

  } catch (error) {
    console.error("❌ Error en GET /api/service-requests/available:", error);
    res.status(500).json({ error: "Error al obtener leads disponibles" });
  }
});

router.post("/:id/unlock", async (req, res) => {
  const leadId = parseInt(req.params.id);
  const { providerId } = req.body;

  if (!leadId || isNaN(leadId)) {
    return res.status(400).json({ error: "ID de lead inválido" });
  }

  if (!providerId || isNaN(parseInt(providerId))) {
    return res.status(400).json({ error: "providerId es requerido" });
  }

  const providerIdInt = parseInt(providerId);

  try {
    // Operación atómica usando CTE (Common Table Expression)
    const result = await neonSql`
      WITH lead_check AS (
        SELECT id, status, title, description, customer_first_name, customer_phone, 
               customer_email, preferred_contact_methods, address, neighborhood, 
               city, province, preferred_date, is_urgent, category_id, created_at
        FROM service_requests
        WHERE id = ${leadId} AND status = 'pending'
      ),
      existing_unlock_check AS (
        SELECT id FROM lead_responses 
        WHERE service_request_id = ${leadId} AND provider_id = ${providerIdInt}
      ),
      credits_check AS (
        SELECT id, current_credits 
        FROM provider_credits 
        WHERE provider_id = ${providerIdInt} AND current_credits >= 1
      ),
      insert_response AS (
      INSERT INTO lead_responses (service_request_id, provider_id, 
credits_used, credits_spent, unlocked_at)
      SELECT ${leadId}, ${providerIdInt}, 1, 1, NOW()
      WHERE EXISTS (SELECT 1 FROM lead_check)
          AND NOT EXISTS (SELECT 1 FROM existing_unlock_check)
          AND EXISTS (SELECT 1 FROM credits_check)
        RETURNING id, unlocked_at
      ),
      update_credits AS (
        UPDATE provider_credits
        SET current_credits = current_credits - 1
        WHERE provider_id = ${providerIdInt}
          AND EXISTS (SELECT 1 FROM insert_response)
        RETURNING current_credits
      )
      SELECT 
        l.*,
        r.id as response_id,
        r.unlocked_at,
        c.current_credits as remaining_credits
      FROM lead_check l
      CROSS JOIN insert_response r
      CROSS JOIN update_credits c;
    `;

    if ((result as any[]).length === 0) {
      // Determinar qué falló
      const [lead] = (await neonSql`SELECT id, status FROM service_requests WHERE id = ${leadId}`) as any[];
      
      if (!lead) {
        return res.status(404).json({ error: "Lead no encontrado" });
      }
      
      if (lead.status !== 'pending') {
        return res.status(400).json({ error: "Este lead ya no está disponible" });
      }

      const [existing] = (await neonSql`
        SELECT id FROM lead_responses 
        WHERE service_request_id = ${leadId} AND provider_id = ${providerIdInt}
      `) as any[];
      
      if (existing) {
        return res.status(400).json({ error: "Ya desbloqueaste este lead anteriormente" });
      }

      const [credits] = (await neonSql`
        SELECT current_credits FROM provider_credits WHERE provider_id = ${providerIdInt}
      `) as any[];
      
      if (!credits) {
        return res.status(404).json({ 
          error: "No se encontró el registro de créditos del proveedor" 
        });
      }

      if (credits.current_credits < 1) {
        return res.status(402).json({ 
          error: "Créditos insuficientes. Necesitas al menos 1 crédito para desbloquear este lead." 
        });
      }

      return res.status(500).json({ error: "Error desconocido al desbloquear el lead" });
    }

    const leadData = result[0];

    res.json({
      success: true,
      lead: {
        id: leadData.id,
        title: leadData.title,
        description: leadData.description,
        customerFirstName: leadData.customer_first_name,
        customerPhone: leadData.customer_phone,
        customerEmail: leadData.customer_email,
        preferredContactMethods: leadData.preferred_contact_methods,
        neighborhood: leadData.neighborhood,
        city: leadData.city,
        province: leadData.province,
        preferredDate: leadData.preferred_date,
        isUrgent: leadData.is_urgent,
        categoryId: leadData.category_id,
        createdAt: leadData.created_at
      },
      creditsSpent: 1,
      remainingCredits: leadData.remaining_credits,
      unlockedAt: leadData.unlocked_at
    });

  } catch (error: any) {
    console.error("❌ Error en POST /api/service-requests/:id/unlock:", error);
    res.status(500).json({ 
      error: "Error al desbloquear el lead. La operación fue cancelada." 
    });
  }
});

router.get("/unlocked", async (req, res) => {
  try {
    const providerId = parseInt(req.query.providerId as string);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!providerId || isNaN(providerId)) {
      return res.status(400).json({ 
        error: "providerId es requerido y debe ser un número válido" 
      });
    }

    const leads = await db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        description: serviceRequests.description,
        customerFirstName: serviceRequests.customerFirstName,
        customerPhone: serviceRequests.customerPhone,
        customerEmail: serviceRequests.customerEmail,
        preferredContactMethods: serviceRequests.preferredContactMethods,
        neighborhood: serviceRequests.neighborhood,
        city: serviceRequests.city,
        province: serviceRequests.province,
        categoryId: serviceRequests.categoryId,
        categoryName: categories.name,
        isUrgent: serviceRequests.isUrgent,
        preferredDate: serviceRequests.preferredDate,
        status: serviceRequests.status,
        createdAt: serviceRequests.createdAt,
        unlockedAt: leadResponses.unlockedAt,
        creditsSpent: leadResponses.creditsSpent
      })
      .from(leadResponses)
      .innerJoin(serviceRequests, eq(leadResponses.serviceRequestId, serviceRequests.id))
      .leftJoin(categories, eq(serviceRequests.categoryId, categories.id))
      .where(eq(leadResponses.providerId, providerId))
      .orderBy(desc(leadResponses.unlockedAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leadResponses)
      .where(eq(leadResponses.providerId, providerId));

    const total = Number(countResult[0]?.count || 0);

    res.json({
      data: leads,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
      limit
    });

  } catch (error) {
    console.error("❌ Error en GET /api/service-requests/unlocked:", error);
    res.status(500).json({ error: "Error al obtener leads desbloqueados" });
  }
});

export default router;
