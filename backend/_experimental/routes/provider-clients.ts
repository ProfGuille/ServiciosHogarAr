import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { providersClientsService } from "../services/providersClientsService.js";

const router = express.Router();

// -----------------------------
// Helpers
// -----------------------------
function ensureProvider(req) {
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo los proveedores pueden acceder a esta información" };
  }
  if (!req.user.providerId) {
    throw { status: 403, message: "Proveedor no autenticado" };
  }
}

// -----------------------------
// Estadísticas
// -----------------------------
router.get("/stats", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const stats = await providersClientsService.getStats(providerId);

    res.json(stats);
  } catch (err) {
    console.error("Error en /provider/clients/stats:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Detalle de cliente
// -----------------------------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const clientId = Number(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "ID de cliente inválido" });
    }

    const providerId = req.user.providerId;

    const details = await providersClientsService.getDetails(providerId, clientId);

    if (!details) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(details);
  } catch (err) {
    console.error("Error en /provider/clients/:id:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar notas y VIP
// -----------------------------
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const clientId = Number(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "ID de cliente inválido" });
    }

    const { notes, isVip } = req.body;

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({ error: "notes debe ser un string" });
    }

    if (isVip !== undefined && typeof isVip !== "boolean") {
      return res.status(400).json({ error: "isVip debe ser boolean" });
    }

    const providerId = req.user.providerId;

    const updated = await providersClientsService.updateNotes(
      providerId,
      clientId,
      notes,
      isVip
    );

    res.json(updated);
  } catch (err) {
    console.error("Error en PATCH /provider/clients/:id:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Listado de clientes
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const providerId = req.user.providerId;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const clients = await providersClientsService.list(providerId, search, status);

    res.json(clients);
  } catch (err) {
    console.error("Error en GET /provider/clients:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

export default router;

