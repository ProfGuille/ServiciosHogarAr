import { Router } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

