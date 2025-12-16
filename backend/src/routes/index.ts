import { Router } from "express";

// -----------------------------
// Auth & Users
// -----------------------------
import authRoutes from "./auth.js";
import usersRoutes from "./users.js";

// -----------------------------
// Providers
// -----------------------------
import providersRoutes from "./serviceProviders.js";
import providerAvailabilityRoutes from "./provider-availability.js";
import providerAnalyticsRoutes from "./provider-analytics.js";
import providerClientsRoutes from "./provider-clients.js";

// -----------------------------
// Services & Requests
// -----------------------------
import serviceRequestsRoutes from "./serviceRequests.js";
import categoriesRoutes from "./categories.js";
import searchRoutes from "./search.js";

// -----------------------------
// Messaging
// -----------------------------
import messagesRoutes from "./messages.js";
import conversationsRoutes from "./conversations.js";

// -----------------------------
// Payments
// -----------------------------
import paymentsRoutes from "./payments.js";

const router = Router();

// -----------------------------
// Auth & Users
// -----------------------------
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

// -----------------------------
// Providers
// -----------------------------
router.use("/providers", providersRoutes);
router.use("/provider/availability", providerAvailabilityRoutes);
router.use("/provider/analytics", providerAnalyticsRoutes);
router.use("/provider/clients", providerClientsRoutes);

// -----------------------------
// Services & Requests
// -----------------------------
router.use("/service-requests", serviceRequestsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/search", searchRoutes);

// -----------------------------
// Messaging
// -----------------------------
router.use("/messages", messagesRoutes);
router.use("/conversations", conversationsRoutes);

// -----------------------------
// Payments
// -----------------------------
router.use("/payments", paymentsRoutes);

export default router;

