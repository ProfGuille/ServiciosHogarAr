import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { referralService } from "../services/referralService";
import { z } from "zod";

const router = Router();

// Get or generate user's referral code
router.get("/code", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const code = await referralService.generateReferralCode(userId);
    res.json(code);
  } catch (error) {
    console.error("Error getting referral code:", error);
    res.status(500).json({ message: "Failed to get referral code" });
  }
});

// Get user's referral stats
router.get("/stats", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const stats = await referralService.getOrCreateReferralStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({ message: "Failed to get referral stats" });
  }
});

// Get user's referral history
router.get("/history", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const referrals = await referralService.getUserReferrals(userId);
    res.json(referrals);
  } catch (error) {
    console.error("Error getting referral history:", error);
    res.status(500).json({ message: "Failed to get referral history" });
  }
});

// Get active referral rewards
router.get("/rewards", async (req, res) => {
  try {
    const rewards = await referralService.getActiveRewards();
    res.json(rewards);
  } catch (error) {
    console.error("Error getting referral rewards:", error);
    res.status(500).json({ message: "Failed to get referral rewards" });
  }
});

// Apply referral code (called during signup)
const applyCodeSchema = z.object({
  code: z.string().min(1).max(20),
  userId: z.string(),
});

router.post("/apply", async (req, res) => {
  try {
    const { code, userId } = applyCodeSchema.parse(req.body);
    const success = await referralService.applyReferralCode(userId, code);
    
    if (success) {
      res.json({ success: true, message: "Referral code applied successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired referral code" });
    }
  } catch (error) {
    console.error("Error applying referral code:", error);
    res.status(500).json({ message: "Failed to apply referral code" });
  }
});

// Complete referral (called after first purchase)
router.post("/complete/:userId", isAuthenticated, async (req: any, res) => {
  try {
    // This should be called by the payment system, not directly by users
    // Add proper authentication for internal services
    const { userId } = req.params;
    await referralService.completeReferral(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error completing referral:", error);
    res.status(500).json({ message: "Failed to complete referral" });
  }
});

export default router;