import { Router, Request, Response } from 'express';
import { db } from '../db';
import { services } from '@shared/schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(services);
    res.json(result);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

