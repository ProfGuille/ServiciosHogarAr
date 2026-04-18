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
             COUNT(DISTINCT CASE WHEN lr.created_at > NOW() - INTERVAL '30 days' THEN lr.id END) AS unlocks_30days,
             COUNT(DISTINCT r.id) AS total_reviews
      FROM service_providers sp
      LEFT JOIN lead_responses lr ON lr.provider_id = sp.id
      LEFT JOIN reviews r ON r.reviewee_id = sp.user_id
      WHERE sp.user_id = ${userId}
      GROUP BY sp.id
    `;

    const provider = providerRows[0];
    if (!provider) return res.json([]);

    const achievementsRows = await sql`
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

export default router;
