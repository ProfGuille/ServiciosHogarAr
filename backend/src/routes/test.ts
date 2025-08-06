import { Router } from 'express';
import { db } from '../db.js';
import { users, serviceProviders } from '../shared/schema';

import { eq } from 'drizzle-orm';

const router = Router();

router.get('/test/providers', async (req, res) => {
  try {
    const result = await db
      .select()
      .from(serviceProviders)
      .limit(10);

    res.json(result);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

router.get('/test/users', async (req, res) => {
  try {
    const result = await db
      .select()
      .from(users)
      .limit(10);

    res.json(result);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

export default router;

