console.log("DATABASE_URL en uso:", process.env.DATABASE_URL);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize default categories if database is empty
async function initializeDefaultCategories() {
  const { storage } = await import("./storage");
  const categories = await storage.getServiceCategories();

  if (categories.length === 0) {
    console.log("Initializing default service categories...");

    const defaultCategories = [
      // Servicios existentes
      {
        name: "Plomería",
        description: "Instalación y reparación de cañerías, grifos, sanitarios",
        icon: "wrench",
      },
      {
        name: "Electricidad",
        description: "Instalaciones eléctricas, reparaciones, tableros",
        icon: "zap",
      },
      {
        name: "Pintura",
        description: "Pintura interior y exterior, acabados, restauración",
        icon: "paint-roller",
      },
      {
        name: "Limpieza",
        description: "Limpieza doméstica, comercial, post-obra",
        icon: "sparkles",
      },
      {
        name: "Carpintería",
        description: "Muebles a medida, reparaciones, instalaciones",
        icon: "hammer",
      },

      // Nuevos servicios
      {
        name: "Albañilería",
        description: "Construcción, reformas, reparaciones de mampostería",
        icon: "brick",
      },
      {
        name: "Gasista",
        description: "Instalaciones de gas, reparaciones, certificaciones",
        icon: "flame",
      },
      {
        name: "Cerrajería",
        description: "Apertura de puertas, cambio de cerraduras, urgencias",
        icon: "key",
      },
      {
        name: "Jardinería",
        description: "Mantenimiento de jardines, poda, diseño paisajístico",
        icon: "tree",
      },
      {
        name: "Mudanzas",
        description: "Traslados, embalaje, logística de mudanzas",
        icon: "truck",
      },
      {
        name: "Aire Acondicionado",
        description: "Instalación, mantenimiento y reparación de equipos",
        icon: "wind",
      },
      {
        name: "Herrería",
        description: "Trabajos en metal, rejas, portones, estructuras",
        icon: "shield",
      },
      {
        name: "Vidriería",
        description: "Instalación de vidrios, espejos, mamparas",
        icon: "square",
      },
      {
        name: "Techos",
        description: "Impermeabilización, tejas, membranas, goteras",
        icon: "home",
      },
      {
        name: "Pisos y Revestimientos",
        description: "Colocación de cerámicos, porcelanatos, parquet",
        icon: "layers",
      },
      {
        name: "Fumigación",
        description: "Control de plagas, desinfección, sanitización",
        icon: "bug",
      },
      {
        name: "Tapicería",
        description: "Retapizado de muebles, cortinas, fundas",
        icon: "sofa",
      },
      {
        name: "Electrodomésticos",
        description: "Reparación de heladeras, lavarropas, cocinas",
        icon: "cpu",
      },
      {
        name: "Alarmas y Seguridad",
        description: "Instalación de alarmas, cámaras, cercos eléctricos",
        icon: "shield-check",
      },
      {
        name: "Piscinas",
        description: "Mantenimiento, limpieza, reparación de piscinas",
        icon: "droplet",
      },
      {
        name: "Calefacción",
        description: "Instalación y reparación de calderas, radiadores",
        icon: "thermometer",
      },
      {
        name: "Decoración",
        description: "Diseño de interiores, asesoramiento, ambientación",
        icon: "palette",
      },
      {
        name: "Durlock",
        description: "Tabiques, cielorrasos, revestimientos en seco",
        icon: "square-stack",
      },
      {
        name: "Automatización",
        description: "Portones automáticos, domótica, control remoto",
        icon: "settings",
      },
      {
        name: "Energía Solar",
        description: "Paneles solares, instalaciones fotovoltaicas",
        icon: "sun",
      },
    ];

    for (const category of defaultCategories) {
      try {
        await storage.createServiceCategory(category);
        console.log(`✓ Created category: ${category.name}`);
      } catch (error) {
        console.error(`Failed to create category ${category.name}:`, error);
      }
    }
  }
}

(async () => {
  const server = await registerRoutes(app);

  // Initialize categories after routes are registered
  await initializeDefaultCategories();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
