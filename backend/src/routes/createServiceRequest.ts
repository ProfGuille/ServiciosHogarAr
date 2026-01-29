import { Router } from "express";
import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";
import { notifyProvidersAboutNewLead } from '../services/leadNotificationHelper.js';
import { categories } from '../shared/schema/index.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      categoryId,
      title,
      description,
      address,
      neighborhood,
      city,
      province,
      customerFirstName,
      customerPhone,
      customerEmail,
      preferredDate,
      isUrgent,
    } = req.body;

    if (!categoryId || !title || !description || !customerFirstName || !customerPhone) {
      return res.status(400).json({ 
        error: "Faltan campos obligatorios"
      });
    }

    const [newRequest] = await db
      .insert(serviceRequests)
      .values({
        categoryId: parseInt(categoryId),
        title,
        description,
        address: address || neighborhood || 'A coordinar',
        neighborhood: neighborhood || city || 'No especificado',
        city: city || 'No especificada',
        province: province || 'No especificada',
        customerFirstName,
        customerPhone,
        customerEmail: customerEmail || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        isUrgent: isUrgent || false,
        status: 'pending',
      })
      .returning();

    const [category] = await db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.id, parseInt(categoryId)))
      .limit(1);

    if (category) {
      notifyProvidersAboutNewLead({
        id: newRequest.id,
        title: title,
        description: description,
        neighborhood: neighborhood || city || 'No especificado',
        categoryId: parseInt(categoryId),
        categoryName: category.name,
        createdAt: newRequest.createdAt || new Date()
      }).catch((err) => {
        console.error('⚠️ Error enviando notificaciones:', err);
      });
    }

    res.status(201).json({
      success: true,
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

export default router;
