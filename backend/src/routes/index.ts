import { Express } from "express";
import authRoutes from "./auth.js";
import creditsRoutes from "./credits.js";

export default function registerRoutes(app: Express) {
  app.use("/auth", authRoutes);
  app.use("/credits", creditsRoutes);
}
