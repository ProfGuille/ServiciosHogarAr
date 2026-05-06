import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db, sql as neonSql } from "../db.js";
const router = Router();

// GET /api/referrals/code — obtiene o crea el código del usuario autenticado
router.get("/code", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id.toString();
    let codes = await neonSql`SELECT * FROM referral_codes WHERE user_id = ${userId} LIMIT 1` as any[];
    if (codes.length === 0) {
      const code = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
      codes = await neonSql`
        INSERT INTO referral_codes (user_id, code, created_at)
        VALUES (${userId}, ${code}, NOW())
        RETURNING *
      ` as any[];
    }
    res.json(codes[0]);
  } catch (error) {
    console.error("GET /referrals/code:", error);
    res.status(500).json({ error: "Error al obtener código de referido" });
  }
});

// GET /api/referrals/stats — estadísticas del usuario autenticado
router.get("/stats", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id.toString();
    const stats = await neonSql`SELECT * FROM referral_stats WHERE user_id = ${userId} LIMIT 1` as any[];
    if (stats.length === 0) {
      return res.json({ totalReferrals: 0, successfulReferrals: 0, totalCreditsEarned: 0 });
    }
    const s = stats[0];
    res.json({
      totalReferrals: s.total_referrals,
      successfulReferrals: s.successful_referrals,
      totalCreditsEarned: s.total_credits_earned,
    });
  } catch (error) {
    console.error("GET /referrals/stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// GET /api/referrals/history — historial de referidos del usuario autenticado
router.get("/history", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id.toString();
    const rows = await neonSql`
      SELECT r.id, r.status, r.reward_credits, r.reward_type, r.completed_at, r.created_at,
             u.id as referred_user_id, u.first_name, u.last_name, u.email
      FROM referrals r
      JOIN users u ON u.id::text = r.referred_id
      WHERE r.referrer_id = ${userId}
      ORDER BY r.created_at DESC
    ` as any[];
    const result = rows.map((r: any) => ({
      id: r.id,
      status: r.status,
      rewardCredits: r.reward_credits,
      rewardType: r.reward_type,
      completedAt: r.completed_at,
      createdAt: r.created_at,
      referredUser: {
        id: r.referred_user_id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
      },
    }));
    res.json(result);
  } catch (error) {
    console.error("GET /referrals/history:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

export default router;
