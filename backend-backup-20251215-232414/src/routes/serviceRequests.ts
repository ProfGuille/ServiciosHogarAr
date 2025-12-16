import { Router } from 'express';
import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import { serviceRequests } from '../shared/schema/serviceRequests.js';
import { clients } from '../shared/schema/clients.js';
import { serviceProviders } from '../shared/schema/serviceProviders.js';
import { services } from '../shared/schema/services.js';

const router = Router();

// GET /api/service-requests/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const result = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, id),
      with: {
        client: true,
        provider: true,
        service: true,
      },
    });

    if (!result) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error al obtener la solicitud de servicio:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

