import { Router } from "express";
import authRoutes from "./auth.js";
import creditsRoutes from "./credits.js";
import paymentsMPRoutes from "./payments-mp.js";
import categoriesRoutes from "./categories.js";
import adminRoutes from "./admin.js";
import searchRoutes from "./search.js";
import serviceProvidersRoutes from "./serviceProviders.js";
import createServiceRequestRoutes from "./createServiceRequest.js";
import serviceRequestsRoutes from "./serviceRequests.js";
import providerCreditsRoutes from "./providerCredits.js";
import contactRoutes from "./contact.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/credits", creditsRoutes);
router.use("/payments/mp", paymentsMPRoutes);
router.use("/categories", categoriesRoutes);
router.use("/admin", adminRoutes);
router.use("/search", searchRoutes);
router.use("/providers", serviceProvidersRoutes);
router.use("/service-requests", createServiceRequestRoutes);
router.use("/service-requests", serviceRequestsRoutes);
router.use("/provider-credits", providerCreditsRoutes);
router.use("/contact", contactRoutes);

export default router;
