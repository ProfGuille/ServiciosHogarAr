import express from "express";
import { providersAvailabilityService } from "../services/providersAvailabilityService.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// Helpers
// -----------------------------
function ensureProvider(req) {
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo los proveedores pueden realizar esta acción" };
  }
  if (!req.user.providerId) {
    throw { status: 403, message: "Proveedor no autenticado" };
  }
}

function ensureOwnership(req, providerId) {
  if (req.user.providerId !== providerId) {
    throw { status: 403, message: "No autorizado para modificar esta disponibilidad" };
  }
}

// -----------------------------
// Verificar disponibilidad
// -----------------------------
router.get("/check", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: "Parámetros 'date' y 'time' son requeridos" });
    }

    const result = await providersAvailabilityService.checkAvailability(
      providerId,
      String(date),
      String(time)
    );

    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Editar bloque
// -----------------------------
router.put("/:id", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const blockId = Number(req.params.id);
    if (isNaN(blockId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const providerId = req.user.providerId;

    // Validación mínima del body
    const { startTime, endTime, dayOfWeek, specificDate, isRecurring } = req.body;

    if (startTime && typeof startTime !== "string") {
      return res.status(400).json({ error: "startTime debe ser string" });
    }
    if (endTime && typeof endTime !== "string") {
      return res.status(400).json({ error: "endTime debe ser string" });
    }
    if (dayOfWeek !== undefined && typeof dayOfWeek !== "number") {
      return res.status(400).json({ error: "dayOfWeek debe ser número" });
    }
    if (specificDate && typeof specificDate !== "string") {
      return res.status(400).json({ error: "specificDate debe ser string (YYYY-MM-DD)" });
    }
    if (isRecurring !== undefined && typeof isRecurring !== "boolean") {
      return res.status(400).json({ error: "isRecurring debe ser boolean" });
    }

    const updated = await providersAvailabilityService.update(
      blockId,
      providerId,
      req.body
    );

    // Ownership real: el service devuelve null si no pertenece
    if (!updated) {
      return res.status(403).json({ error: "No autorizado para modificar este bloque" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Eliminar bloque
// -----------------------------
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const blockId = Number(req.params.id);
    if (isNaN(blockId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const providerId = req.user.providerId;

    const deleted = await providersAvailabilityService.delete(blockId, providerId);

    if (!deleted) {
      return res.status(403).json({ error: "No autorizado para eliminar este bloque" });
    }

    res.json(deleted);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Obtener disponibilidad del proveedor autenticado
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const slots = await providersAvailabilityService.getByProvider(providerId);

    res.json(slots);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Crear bloque de disponibilidad
// -----------------------------
router.post("/", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;

    const { startTime, endTime, dayOfWeek, specificDate, isRecurring } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime y endTime son requeridos" });
    }

    if (typeof startTime !== "string" || typeof endTime !== "string") {
      return res.status(400).json({ error: "startTime y endTime deben ser strings" });
    }

    if (dayOfWeek !== undefined && typeof dayOfWeek !== "number") {
      return res.status(400).json({ error: "dayOfWeek debe ser número" });
    }

    if (specificDate && typeof specificDate !== "string") {
      return res.status(400).json({ error: "specificDate debe ser string (YYYY-MM-DD)" });
    }

    if (isRecurring !== undefined && typeof isRecurring !== "boolean") {
      return res.status(400).json({ error: "isRecurring debe ser boolean" });
    }

    const created = await providersAvailabilityService.create(providerId, req.body);

    res.status(201).json(created);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

export default router;

