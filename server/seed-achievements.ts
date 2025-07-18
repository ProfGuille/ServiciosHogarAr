import { db } from "./db";
import { achievements } from "@shared/schema";

const defaultAchievements = [
  // Customer achievements
  {
    name: "Primera Solicitud",
    description: "Realiza tu primera solicitud de servicio",
    category: "customer" as const,
    type: "milestone" as const,
    icon: "ShoppingBag",
    color: "bg-blue-500",
    criteria: { metric: "bookings_made", value: 1 },
    points: 10,
    rarity: "common" as const,
    sortOrder: 1,
  },
  {
    name: "Cliente Frecuente",
    description: "Completa 5 solicitudes de servicio",
    category: "customer" as const,
    type: "milestone" as const,
    icon: "Award",
    color: "bg-green-500",
    criteria: { metric: "bookings_made", value: 5 },
    points: 25,
    rarity: "uncommon" as const,
    sortOrder: 2,
  },
  {
    name: "Cliente VIP",
    description: "Completa 10 solicitudes de servicio",
    category: "customer" as const,
    type: "milestone" as const,
    icon: "Crown",
    color: "bg-purple-500",
    criteria: { metric: "bookings_made", value: 10 },
    points: 50,
    rarity: "rare" as const,
    sortOrder: 3,
  },
  {
    name: "Crítico Constructivo",
    description: "Deja tu primera reseña",
    category: "customer" as const,
    type: "engagement" as const,
    icon: "MessageCircle",
    color: "bg-orange-500",
    criteria: { metric: "reviews_given", value: 1 },
    points: 15,
    rarity: "common" as const,
    sortOrder: 4,
  },
  {
    name: "Reseñador Experto",
    description: "Deja 10 reseñas detalladas",
    category: "customer" as const,
    type: "engagement" as const,
    icon: "Star",
    color: "bg-yellow-500",
    criteria: { metric: "reviews_given", value: 10 },
    points: 40,
    rarity: "uncommon" as const,
    sortOrder: 5,
  },

  // Provider achievements
  {
    name: "Primer Trabajo",
    description: "Completa tu primer trabajo exitosamente",
    category: "provider" as const,
    type: "milestone" as const,
    icon: "Briefcase",
    color: "bg-indigo-500",
    criteria: { metric: "jobs_completed", value: 1 },
    points: 20,
    rarity: "common" as const,
    sortOrder: 10,
  },
  {
    name: "Profesional Activo",
    description: "Completa 10 trabajos",
    category: "provider" as const,
    type: "milestone" as const,
    icon: "TrendingUp",
    color: "bg-blue-600",
    criteria: { metric: "jobs_completed", value: 10 },
    points: 50,
    rarity: "uncommon" as const,
    sortOrder: 11,
  },
  {
    name: "Experto del Servicio",
    description: "Completa 50 trabajos",
    category: "provider" as const,
    type: "milestone" as const,
    icon: "Medal",
    color: "bg-gold-500",
    criteria: { metric: "jobs_completed", value: 50 },
    points: 100,
    rarity: "rare" as const,
    sortOrder: 12,
  },
  {
    name: "Maestro Artesano",
    description: "Completa 100 trabajos",
    category: "provider" as const,
    type: "milestone" as const,
    icon: "Trophy",
    color: "bg-yellow-600",
    criteria: { metric: "jobs_completed", value: 100 },
    points: 200,
    rarity: "epic" as const,
    sortOrder: 13,
  },
  {
    name: "Leyenda del Servicio",
    description: "Completa 500 trabajos",
    category: "provider" as const,
    type: "milestone" as const,
    icon: "Zap",
    color: "bg-purple-600",
    criteria: { metric: "jobs_completed", value: 500 },
    points: 500,
    rarity: "legendary" as const,
    sortOrder: 14,
  },
  {
    name: "Estrella Naciente",
    description: "Mantén una calificación promedio de 4.5 estrellas con al menos 5 reseñas",
    category: "provider" as const,
    type: "quality" as const,
    icon: "Sparkles",
    color: "bg-pink-500",
    criteria: { metric: "average_rating", value: 4.5, operator: "gte" },
    points: 30,
    rarity: "uncommon" as const,
    sortOrder: 15,
  },
  {
    name: "Servicio 5 Estrellas",
    description: "Mantén una calificación perfecta de 5 estrellas con al menos 10 reseñas",
    category: "provider" as const,
    type: "quality" as const,
    icon: "Star",
    color: "bg-yellow-500",
    criteria: { metric: "average_rating", value: 5, operator: "eq" },
    points: 75,
    rarity: "rare" as const,
    sortOrder: 16,
  },
  {
    name: "Respuesta Rápida",
    description: "Mantén un tiempo de respuesta promedio menor a 2 horas",
    category: "provider" as const,
    type: "quality" as const,
    icon: "Clock",
    color: "bg-green-600",
    criteria: { metric: "avg_response_hours", value: 2, operator: "lte" },
    points: 40,
    rarity: "uncommon" as const,
    sortOrder: 17,
  },

  // Platform achievements
  {
    name: "Pionero",
    description: "Únete durante el primer mes de la plataforma",
    category: "platform" as const,
    type: "loyalty" as const,
    icon: "Flag",
    color: "bg-red-500",
    criteria: { metric: "days_since_joined", value: 30, operator: "gte" },
    points: 50,
    rarity: "rare" as const,
    sortOrder: 20,
  },
  {
    name: "Miembro Veterano",
    description: "Sé parte de la comunidad por 6 meses",
    category: "platform" as const,
    type: "loyalty" as const,
    icon: "Shield",
    color: "bg-gray-600",
    criteria: { metric: "days_since_joined", value: 180, operator: "gte" },
    points: 100,
    rarity: "epic" as const,
    sortOrder: 21,
  },
  {
    name: "Usuario del Año",
    description: "Sé parte de la comunidad por 1 año",
    category: "platform" as const,
    type: "loyalty" as const,
    icon: "Calendar",
    color: "bg-purple-700",
    criteria: { metric: "days_since_joined", value: 365, operator: "gte" },
    points: 200,
    rarity: "legendary" as const,
    sortOrder: 22,
  },

  // Special achievements
  {
    name: "Verificado",
    description: "Completa la verificación de tu perfil profesional",
    category: "special" as const,
    type: "milestone" as const,
    icon: "CheckCircle",
    color: "bg-green-600",
    criteria: { metric: "is_verified", value: 1 },
    points: 25,
    rarity: "common" as const,
    sortOrder: 30,
  },
];

async function seedAchievements() {
  console.log("🏆 Seeding achievements...");

  try {
    // Check if achievements already exist
    const existingAchievements = await db.select().from(achievements);
    
    if (existingAchievements.length > 0) {
      console.log("✅ Achievements already seeded");
      return;
    }

    // Insert achievements
    await db.insert(achievements).values(defaultAchievements);

    console.log(`✅ Successfully seeded ${defaultAchievements.length} achievements`);
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
    throw error;
  }
}

// Run if called directly
seedAchievements()
  .then(() => {
    console.log("✅ Achievement seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Achievement seeding failed:", error);
    process.exit(1);
  });

export { seedAchievements };