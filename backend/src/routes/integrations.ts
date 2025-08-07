import { Router } from "express";
import { db } from "../db";
import { serviceProviders } from "../shared/schema/serviceProviders";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const providers = await db
      .select({
        id: serviceProviders.id,
        businessName: serviceProviders.businessName,
        description: serviceProviders.description,
        city: serviceProviders.city,
        province: serviceProviders.province,
        hourlyRate: serviceProviders.hourlyRate,
        rating: serviceProviders.rating,
        totalReviews: serviceProviders.totalReviews,
        isActive: serviceProviders.isActive,
        isVerified: serviceProviders.isVerified,
        experienceYears: serviceProviders.experienceYears,
      })
      .from(serviceProviders);

    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

export default router;