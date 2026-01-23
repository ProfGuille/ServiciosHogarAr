import { Router } from "express";
import authRoutes from "./auth.js";
import creditsRoutes from "./credits.js";
import paymentsMPRoutes from "./payments-mp.js";
import categoriesRoutes from "./categories.js";
import searchRoutes from "./search.js";
import serviceProvidersRoutes from "./serviceProviders.js";
import createServiceRequestRoutes from "./createServiceRequest.js";
import availableLeadsRoutes from "./availableLeads.js";
import unlockLeadRoutes from "./unlockLead.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/credits", creditsRoutes);
router.use("/payments/mp", paymentsMPRoutes);
router.use("/categories", categoriesRoutes);
router.use("/search", searchRoutes);
router.use("/providers", serviceProvidersRoutes);
router.use("/service-requests", createServiceRequestRoutes);
router.use("/service-requests", availableLeadsRoutes);
router.use("/service-requests", unlockLeadRoutes);

export default router;
