import { Router, Request, Response } from 'express';
import { db } from '../db';
import { appointments } from '@shared/schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(appointments);
    res.json(result);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

