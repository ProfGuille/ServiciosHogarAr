import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { providerServicesService } from "../services/providerServicesService.js";

const router = express.Router();

// -----------------------------
// Helpers
// -----------------------------
function ensureProvider(req) {
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo los proveedores pueden realizar esta acción" };
  }
  if (!req.user.providerId || req.user.providerId <= 0) {
    throw { status: 403, message: "Proveedor no autenticado" };
  }
}

// -----------------------------
// Obtener todos los servicios del proveedor autenticado
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const services = await providerServicesService.getByProvider(providerId);

    res.json(services);
  } catch (err) {
    console.error("Error en GET /provider/services:", err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// -----------------------------
// Crear un servicio
// -----------------------------
router.post("/", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const created = await providerServicesService.create(providerId, req.body);

    res.status(201).json(created);
  } catch (err) {
    console.error("Error en POST /provider/services:", err);
    const status = err.message?.includes("inválido") ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// -----------------------------
// Editar un servicio
// -----------------------------
router.put("/:id", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const serviceId = Number(req.params.id);

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const updated = await providerServicesService.update(serviceId, providerId, req.body);

    res.json(updated);
  } catch (err) {
    console.error("Error en PUT /provider/services/:id:", err);
    const status = err.message?.includes("inválido") ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// -----------------------------
// Activar/desactivar un servicio
// -----------------------------
router.patch("/:id/active", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const serviceId = Number(req.params.id);

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive debe ser boolean" });
    }

    const updated = await providerServicesService.setActive(serviceId, providerId, isActive);

    res.json(updated);
  } catch (err) {
    console.error("Error en PATCH /provider/services/:id/active:", err);
    const status = err.message?.includes("inválido") ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;

