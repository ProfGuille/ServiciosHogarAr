import { Router } from "express";
import { db } from "../db.js";
import { serviceRequests } from "../shared/schema/serviceRequests.js";

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

    res.status(201).json({
      success: true,
      request: newRequest,
    });

  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error);
    console.error("Causa:", error.cause);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message,
      cause: error.cause?.message
    });
  }
});

export default router;
