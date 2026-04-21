import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { sql } from "../db.js";

const router = Router();

// GET /api/achievements — todos los logros activos
router.get("/", async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name, description, category, type, icon, color, points, rarity, condition_type, condition_value
      FROM achievements WHERE is_active = true ORDER BY sort_order, points ASC
    `;
    res.json(result);
  } catch (error) {
    console.error("achievements GET /:", error);
    res.status(500).json({ error: "Error retrieving achievements" });
  }
});

// GET /api/achievements/user/:userId — logros obtenidos
router.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await sql`
      SELECT a.id, a.name, a.description, a.category, a.type, a.icon, a.color, a.points, a.rarity,
             ua.earned_at, ua.progress, ua.progress_max
      FROM achievements a
      INNER JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ${userId} AND a.is_active = true
      ORDER BY ua.earned_at DESC
    `;
    res.json(result);
  } catch (error) {
    console.error("achievements GET /user/:userId:", error);
    res.status(500).json({ error: "Error retrieving user achievements" });
  }
});

// GET /api/achievements/user/:userId/progress — todos con progreso calculado
router.get("/user/:userId/progress", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;

    const providerRows = await sql`
      SELECT sp.id, sp.is_verified, sp.rating, sp.created_at,
             COUNT(DISTINCT lr.id) AS total_unlocks,
             COUNT(DISTINCT CASE WHEN lr.unlocked_at > NOW() - INTERVAL '30 days' THEN lr.id END) AS unlocks_30days,
             COUNT(DISTINCT r.id) AS total_reviews
      FROM service_providers sp
      LEFT JOIN lead_responses lr ON lr.provider_id = sp.id
      LEFT JOIN reviews r ON r.reviewee_id = sp.user_id
      WHERE sp.user_id = ${userId}
      GROUP BY sp.id
    `;

    const provider = providerRows[0];
    if (!provider) return res.json([]);

    const isProvider = req.user?.role === "provider";
    const achievementsRows = isProvider
      ? await sql`
          SELECT a.*, ua.earned_at, ua.progress, ua.progress_max
          FROM achievements a
          LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ${userId}
          WHERE a.is_active = true AND a.category IN ('provider', 'platform')
          ORDER BY a.sort_order, a.points ASC
        `
      : await sql`
          SELECT a.*, ua.earned_at, ua.progress, ua.progress_max
          FROM achievements a
          LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ${userId}
          WHERE a.is_active = true
          ORDER BY a.sort_order, a.points ASC
        `;

    const monthsActive = Math.floor(
      (Date.now() - new Date(provider.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const withProgress = (achievementsRows as any[]).map((a: any) => {
      if (a.earned_at) return { ...a, percent_complete: 100 };
      let current = 0;
      const max = a.condition_value || 1;
      switch (a.condition_type) {
        case "unlocks_total":     current = parseInt(provider.total_unlocks); break;
        case "unlocks_30days":    current = parseInt(provider.unlocks_30days); break;
        case "identity_verified": current = provider.is_verified ? 1 : 0; break;
        case "rating_min":        current = Math.round((parseFloat(provider.rating) || 0) * 10); break;
        case "months_active":     current = monthsActive; break;
        default:                  current = 0;
      }
      const percent_complete = Math.min(100, Math.round((current / max) * 100));
      return { ...a, current_progress: current, target_progress: max, percent_complete };
    });

    res.json(withProgress);
  } catch (error) {
    console.error("achievements GET /user/:userId/progress:", error);
    res.status(500).json({ error: "Error retrieving achievement progress" });
  }
});


// Función exportable: evalúa y otorga logros a un proveedor
export async function checkAndGrantAchievements(userId: string): Promise<void> {
  try {
    const providerRows = await sql`
      SELECT sp.id, sp.is_verified, sp.rating, sp.created_at,
             COUNT(DISTINCT lr.id) AS total_unlocks,
             COUNT(DISTINCT CASE WHEN lr.unlocked_at > NOW() - INTERVAL '30 days' THEN lr.id END) AS unlocks_30days
      FROM service_providers sp
      LEFT JOIN lead_responses lr ON lr.provider_id = sp.id
      WHERE sp.user_id = ${userId}
      GROUP BY sp.id
    `;
    const provider = (providerRows as any[])[0];
    if (!provider) return;

    const achievementsRows = await sql`
      SELECT a.id, a.condition_type, a.condition_value
      FROM achievements a
      WHERE a.is_active = true AND a.condition_type IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM user_achievements ua
          WHERE ua.achievement_id = a.id AND ua.user_id = ${userId}
        )
    `;

    const monthsActive = Math.floor(
      (Date.now() - new Date(provider.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    for (const a of achievementsRows as any[]) {
      let current = 0;
      const target = a.condition_value || 1;
      switch (a.condition_type) {
        case "unlocks_total":     current = parseInt(provider.total_unlocks); break;
        case "unlocks_30days":    current = parseInt(provider.unlocks_30days); break;
        case "identity_verified": current = provider.is_verified ? 1 : 0; break;
        case "rating_min":        current = Math.round((parseFloat(provider.rating) || 0) * 10); break;
        case "months_active":     current = monthsActive; break;
        default: continue;
      }
      if (current >= target) {
        await sql`
          INSERT INTO user_achievements (user_id, achievement_id, earned_at, progress, progress_max)
          VALUES (${userId}, ${a.id}, NOW(), ${target}, ${target})
          ON CONFLICT (user_id, achievement_id) DO NOTHING
        `;
      }
    }
  } catch (err) {
    console.error("checkAndGrantAchievements error:", err);
  }
}


// POST /api/achievements/client-ratings — proveedor califica una solicitud
router.post("/client-ratings", requireAuth, async (req, res) => {
  try {
    const { providerId, serviceRequestId, rating } = req.body;
    const validRatings = ["contact_made", "no_response", "invalid_request"];

    if (!providerId || !serviceRequestId || !rating) {
      return res.status(400).json({ error: "providerId, serviceRequestId y rating son requeridos" });
    }
    if (!validRatings.includes(rating)) {
      return res.status(400).json({ error: "rating inválido. Valores: contact_made, no_response, invalid_request" });
    }

    // Verificar que el proveedor desbloqueó esta solicitud
    const unlockCheck = await sql`
      SELECT id FROM lead_responses
      WHERE provider_id = ${parseInt(providerId)} AND service_request_id = ${parseInt(serviceRequestId)}
    `;
    if ((unlockCheck as any[]).length === 0) {
      return res.status(403).json({ error: "Solo podés calificar solicitudes que hayas desbloqueado" });
    }

    await sql`
      INSERT INTO client_ratings (provider_id, service_request_id, rating)
      VALUES (${parseInt(providerId)}, ${parseInt(serviceRequestId)}, ${rating})
      ON CONFLICT (provider_id, service_request_id) DO UPDATE SET rating = ${rating}
    `;

    res.json({ success: true });
  } catch (error) {
    console.error("POST /client-ratings:", error);
    res.status(500).json({ error: "Error al guardar calificación" });
  }
});

// GET /api/achievements/client-ratings/:serviceRequestId — indicador agregado para clientes
router.get("/client-ratings/:serviceRequestId", async (req, res) => {
  try {
    const serviceRequestId = parseInt(req.params.serviceRequestId);
    const rows = await sql`
      SELECT rating, COUNT(*) as count
      FROM client_ratings
      WHERE service_request_id = ${serviceRequestId}
      GROUP BY rating
    `;
    const counts = { contact_made: 0, no_response: 0, invalid_request: 0, total: 0 };
    for (const r of rows as any[]) {
      counts[r.rating as keyof typeof counts] = parseInt(r.count);
      counts.total += parseInt(r.count);
    }
    // Mínimo 3 calificaciones para mostrar (Ley 25.326)
    if (counts.total < 3) {
      return res.json({ visible: false });
    }
    res.json({ visible: true, ...counts });
  } catch (error) {
    console.error("GET /client-ratings/:id:", error);
    res.status(500).json({ error: "Error al obtener calificaciones" });
  }
});

export default router;
