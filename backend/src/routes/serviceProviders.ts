import { Router } from "express";
import { providersService } from "../services/providersService.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// -----------------------------
// Helpers
// -----------------------------
function ensureOwnership(req, providerId) {
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo los proveedores pueden realizar esta acción" };
  }
  if (req.user.providerId !== providerId) {
    throw { status: 403, message: "No autorizado para modificar este perfil" };
  }
}

// -----------------------------
// Obtener servicios del proveedor (público)
// -----------------------------
router.get("/:id/services", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const services = await providersService.getServices(id);
    res.json(services);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar perfil (solo dueño)
// -----------------------------
router.patch("/:id", requireAuth, async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    ensureOwnership(req, providerId);

    const updated = await providersService.updateProfile(providerId, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar ubicación (solo dueño)
// -----------------------------
router.patch("/:id/location", requireAuth, async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    ensureOwnership(req, providerId);

    const { latitude, longitude } = req.body;

    const updated = await providersService.updateLocation(
      providerId,
      Number(latitude),
      Number(longitude)
    );

    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Actualizar estado online/offline (solo dueño)
// -----------------------------
router.patch("/:id/online", requireAuth, async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    ensureOwnership(req, providerId);

    const updated = await providersService.updateOnlineStatus(
      providerId,
      Boolean(req.body.isOnline)
    );

    res.json(updated);
  } catch (err) {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
  }
});

// -----------------------------
// Obtener proveedor por ID (público)
// -----------------------------
router.get("/:id", async (req, res) => {
  const providerId = Number(req.params.id);
  if (isNaN(providerId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const provider = await providersService.getById(providerId);
    if (!provider) return res.status(404).json({ error: "Proveedor no encontrado" });

    // Sanitizar datos sensibles
    delete provider.email;
    delete provider.phone;

    res.json(provider);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------
// Búsqueda avanzada (DEPRECATED)
// -----------------------------
// Esta ruta debe ser reemplazada por /search/providers
router.get("/", async (req, res) => {
  res.status(410).json({
    error: "Este endpoint fue reemplazado por /api/search/providers",
  });
});

export default router;

