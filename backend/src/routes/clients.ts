import { Router } from 'express';
import { db } from '../db.js';
import { clients } from '../shared/schema/clients.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Ruta para listar todos los clientes
router.get('/', async (req, res) => {
  try {
    const allClients = await db.select().from(clients);
    res.json(allClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un cliente por id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .then(rows => rows[0]);

    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json(client);
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

