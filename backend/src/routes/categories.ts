// src/routes/categories.ts
import { Router } from 'express';
import { db } from "../db.js";
import { categories } from "@shared/schema";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.select().from(categories);
    res.json(result);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

