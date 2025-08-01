import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { achievementService } from "../services/achievementService";

const router = Router();

// Get user's achievements
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user as any;
    
    // Users can only see their own achievements (unless admin)
    if (requestingUser.claims.sub !== userId && requestingUser.userType !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const achievements = await achievementService.getUserAchievements(userId);
    reson(achievements);
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

// Get user's achievement progress
router.get("/user/:userId/progress", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user as any;
    
    // Users can only see their own progress
    if (requestingUser.claims.sub !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const progress = await achievementService.getUserAchievementProgress(userId);
    reson(progress);
  } catch (error) {
    console.error("Error fetching achievement progress:", error);
    res.status(500).json({ message: "Failed to fetch achievement progress" });
  }
});

// Get unnotified achievements
router.get("/unnotified", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;

    const unnotified = await achievementService.getUnnotifiedAchievements(userId);
    reson(unnotified);
  } catch (error) {
    console.error("Error fetching unnotified achievements:", error);
    res.status(500).json({ message: "Failed to fetch unnotified achievements" });
  }
});

// Mark achievements as notified
router.post("/mark-notified", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;
    const { achievementIds } = req.body;

    if (!Array.isArray(achievementIds)) {
      return res.status(400).json({ message: "achievementIds must be an array" });
    }

    await achievementService.markAchievementsNotified(userId, achievementIds);
    reson({ success: true });
  } catch (error) {
    console.error("Error marking achievements as notified:", error);
    res.status(500).json({ message: "Failed to mark achievements as notified" });
  }
});

// Check and award achievements (called after user actions)
router.post("/check", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims.sub;

    const newAchievements = await achievementService.checkAndAwardAchievements(userId);
    reson({ newAchievements });
  } catch (error) {
    console.error("Error checking achievements:", error);
    res.status(500).json({ message: "Failed to check achievements" });
  }
});

// Get achievement statistics (admin only)
router.get("/stats", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const stats = await achievementService.getAchievementStats();
    reson(stats);
  } catch (error) {
    console.error("Error fetching achievement stats:", error);
    res.status(500).json({ message: "Failed to fetch achievement statistics" });
  }
});

export default router;