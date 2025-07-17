import { Router } from "express";
import { db } from "../../db"; // ruta según tu proyecto
import { users, serviceProviders } from "@shared/schema";

const router = Router();

router.get("/create-test-provider", async (req, res) => {
  try {
    // Crear usuario
    const userId = `testuser_${Date.now()}`;
    const userEmail = `testuser${Date.now()}@example.com`;

    const [createdUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: userEmail,
        userType: "provider", // importante para que sea prestador
        firstName: "Test",
        lastName: "Provider",
      })
      .returning();

    // Crear prestador (serviceProvider)
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

    res.json({ success: true, user: createdUser, provider: createdProvider });
  } catch (error) {
    console.error("Error creando prestador de prueba:", error);
    res.status(500).json({ success: false, error: "Error creando prestador" });
  }
});

export default router;
