import { Router, Request, Response } from 'express';
import { db } from '../db';
import { clients } from '@shared/schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(clients);
    res.json(result);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

