// src/routes/index.ts
import { type Express } from "express";

import testRoutes from "./test.js";
import usersRoutes from "./users.js";
import categoriesRoutes from "./categories.js";
import serviceProvidersRoutes from "./serviceProviders.js";
import clientsRoutes from "./clients.js";
import servicesRoutes from "./services.js";
import appointmentsRoutes from "./appointments.js";

export function registerRoutes(app: Express) {
  app.use("/api/test", testRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/service-providers", serviceProvidersRoutes);
  app.use("/api/clients", clientsRoutes);
  app.use("/api/services", servicesRoutes);
  app.use("/api/appointments", appointmentsRoutes);
}

