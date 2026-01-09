import { Router } from "express";
import authRoutes from "./auth.js";
import creditsRoutes from "./credits.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/credits", creditsRoutes);

export default router;
