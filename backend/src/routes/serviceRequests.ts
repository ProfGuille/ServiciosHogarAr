import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { serviceRequestsService } from "../services/serviceRequestsService.js";

const router = express.Router();

// -----------------------------
// Helpers
// -----------------------------
function ensureCustomer(req) {
  if (req.user.role !== "customer") {
    throw { status: 403, message: "Solo clientes pueden realizar esta acción" };
  }
}

function ensureProvider(req) {
  if (req.user.role !== "provider") {
    throw { status: 403, message: "Solo proveedores pueden realizar esta acción" };
  }
}

// -----------------------------
// Crear solicitud (cliente)
// -----------------------------
router.post("/", requireAuth, async (req, res) => {
  try {
    ensureCustomer(req);

    const created = await serviceRequestsService.create(req.user.uid, req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /service-requests:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Obtener solicitudes del cliente
// -----------------------------
router.get("/customer", requireAuth, async (req, res) => {
  try {
    ensureCustomer(req);

    const list = await serviceRequestsService.getByCustomer(req.user.uid);
    res.json(list);
  } catch (err) {
    console.error("GET /service-requests/customer:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Obtener solicitudes del proveedor
// -----------------------------
router.get("/provider", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const list = await serviceRequestsService.getByProvider(req.user.providerId);
    res.json(list);
  } catch (err) {
    console.error("GET /service-requests/provider:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Cotizar (provider)
// -----------------------------
router.post("/:id/quote", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const requestId = Number(req.params.id);
    const price = Number(req.body.price);

    const updated = await serviceRequestsService.quote(
      requestId,
      req.user.providerId,
      price
    );

    res.json(updated);
  } catch (err) {
    console.error("POST /service-requests/:id/quote:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Aceptar cotización (customer)
// -----------------------------
router.post("/:id/accept", requireAuth, async (req, res) => {
  try {
    ensureCustomer(req);

    const requestId = Number(req.params.id);

    const updated = await serviceRequestsService.accept(
      requestId,
      req.user.uid
    );

    res.json(updated);
  } catch (err) {
    console.error("POST /service-requests/:id/accept:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Iniciar trabajo (provider)
// -----------------------------
router.post("/:id/start", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const requestId = Number(req.params.id);

    const updated = await serviceRequestsService.start(
      requestId,
      req.user.providerId
    );

    res.json(updated);
  } catch (err) {
    console.error("POST /service-requests/:id/start:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Completar trabajo (provider)
// -----------------------------
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    ensureProvider(req);

    const requestId = Number(req.params.id);

    const updated = await serviceRequestsService.complete(
      requestId,
      req.user.providerId
    );

    res.json(updated);
  } catch (err) {
    console.error("POST /service-requests/:id/complete:", err);
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Cancelar (customer o provider)
// -----------------------------
router.post("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const actor = req.user.role === "customer" ? "customer" : "provider";
    const actorId = req.user.role === "customer" ? req.user.uid : req.user.providerId;

    const updated = await serviceRequestsService.cancel(
      requestId,
      actor,
      actorId
    );

    res.json(updated);
  } catch (err) {
    console.error("POST /service-requests/:id/cancel:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

