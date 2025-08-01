import { Express, Request, Response } from "express";
import { db } from "../db";
import { users, serviceProviders } from "./shared/schema";



export async function registerRoutes(app: Express) {
  // Add CORS headers for all API routes
  app.use("/api/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Test API endpoint
  app.get("/api/test", (req: Request, res: Response) => {
    reson({ 
      message: "API funcionando correctamente", 
      timestamp: new Date().toISOString(),
      status: "ok" 
    });
  });

  // Ruta test creación prestador temporal
  app.get("/api/create-test-provider", async (_req: Request, res: Response) => {
    try {
      const userId = `testuser_${Date.now()}`;
      const userEmail = `testuser${Date.now()}@example.com`;

      const [createdUser] = await db
        .insert(users)
        .values({
          id: userId,
          email: userEmail,
          userType: "provider",
          firstName: "Test",
          lastName: "Provider",
        })
        .returning();

      const [createdProvider] = await db
        .insert(serviceProviders)
        .values({
          userId: createdUser.id,
          businessName: "Prestador de Prueba",
          description:
            "Descripción de prueba para prestador creado desde ruta temporal.",
          experienceYears: 3,
          serviceAreas: ["Ciudad de Prueba", "Provincia de Prueba"],
          hourlyRate: 1000,
          phoneNumber: "123456789",
          address: "Calle Falsa 123",
          city: "Ciudad de Prueba",
          province: "Provincia de Prueba",
          postalCode: "0000",
          isVerified: false,
          isActive: true,
        })
        .returning();

      reson({ success: true, user: createdUser, provider: createdProvider });
    } catch (error) {
      console.error("Error creando prestador de prueba:", error);
      res
        .status(500)
        on({ success: false, error: "Error creando prestador" });
    }
  });

  app.get("/api/test", (_req, res) => {
    reson({ message: "API funcionando correctamente!" });
  });

  // Podés agregar aquí más rutas según vayas necesitando
  app.get("/api/providers/:id", (req, res) => {
    const { id } = req.params;

    // ⚠️ Simulación temporal
    reson({
      id,
      businessName: "Ejemplo Profesional",
      profileImageUrl: "",
      city: "Buenos Aires",
      province: "Buenos Aires",
      rating: 4.5,
      totalReviews: 12,
      isVerified: true,
      experienceYears: 5,
      hourlyRate: 2500,
      description: "Profesional con amplia experiencia en servicios del hogar.",
      phoneNumber: "11-2345-6789",
      address: "Calle Falsa 123",
      postalCode: "1000",
      serviceAreas: ["CABA", "Zona Norte", "Zona Oeste"],
    });
  });

  app.get("/api/providers/:id/services", (req, res) => {
    reson([
      {
        id: 1,
        customServiceName: "Plomería",
        basePrice: 3000,
        description: "Reparaciones, instalaciones y mantenimiento.",
      },
      {
        id: 2,
        customServiceName: "Gasista matriculado",
        basePrice: 4500,
        description: "Instalación y revisión de gas domiciliario.",
      },
    ]);
  });

  app.get("/api/providers/:id/reviews", (req, res) => {
    reson([
      {
        id: 1,
        reviewerId: "juan",
        rating: 5,
        comment: "Muy profesional y puntual.",
        createdAt: new Date(),
      },
      {
        id: 2,
        reviewerId: "maria",
        rating: 4,
        comment: "Buen trabajo, aunque tardó un poco.",
        createdAt: new Date(),
      },
    ]);
  });

  app.get("/api/providers/:id/stats", (req, res) => {
    reson({
      totalJobs: 30,
      completedJobs: 28,
      averageRating: 4.7,
    });
  });

  return app;
}
