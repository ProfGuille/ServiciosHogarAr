import { Router } from 'express';
import { db } from '../db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.select().from(users).limit(10);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

