import { Router } from "express";
import { serviceRequestsService } from "../services/serviceRequestsService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// -----------------------------
// Rutas específicas primero
// -----------------------------

// Solicitudes del cliente
router.get("/client/:customerId", requireAuth, async (req, res) => {
  const customerId = Number(req.params.customerId);
  if (isNaN(customerId)) {
    return res.status(400).json({ error: "ID de cliente inválido" });
  }

  try {
    const result = await serviceRequestsService.getByCustomer(customerId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Solicitudes del proveedor
router.get("/provider/:providerId", requireAuth, async (req, res) => {
  const providerId = Number(req.params.providerId);
  if (isNaN(providerId)) {
    return res.status(400).json({ error: "ID de proveedor inválido" });
  }

  try {
    const result = await serviceRequestsService.getByProvider(providerId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Proveedor envía presupuesto
router.patch("/:id/quote", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await serviceRequestsService.quote(id, req.body.price);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Cliente acepta presupuesto
router.patch("/:id/accept", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await serviceRequestsService.accept(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Completar trabajo
router.patch("/:id/complete", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await serviceRequestsService.complete(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Cancelar solicitud
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await serviceRequestsService.cancel(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Registrar pago
router.post("/:id/pay", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await serviceRequestsService.updatePaymentStatus(
      id,
      req.body.status,
      req.body.intentId
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Registrar reseña
router.post("/:id/review", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await serviceRequestsService.addReview(
      id,
      req.body.review
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// Rutas genéricas
// -----------------------------

// Crear solicitud
router.post("/", requireAuth, async (req, res) => {
  try {
    const created = await serviceRequestsService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener solicitud por ID
router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await serviceRequestsService.getById(id);
    if (!result) return res.status(404).json({ error: "Solicitud no encontrada" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;

