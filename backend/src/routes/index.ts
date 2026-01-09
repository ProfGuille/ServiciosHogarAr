import { Router } from "express";
import authRoutes from "./auth.js";
import creditsRoutes from "./credits.js";
import paymentsMPRoutes from "./payments-mp.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/credits", creditsRoutes);
router.use("/payments/mp", paymentsMPRoutes);

export default router;
