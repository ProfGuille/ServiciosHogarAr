import { Router, Request, Response } from 'express';
import { db } from '../db';
import { serviceProviders } from '@shared/schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(serviceProviders);
    res.json(result);
  } catch (err) {
    console.error('Error fetching service providers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

