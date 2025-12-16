import { Router } from 'express';
import { db } from '../db.js';
import { conversations } from '../shared/schema/conversations.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const allConversations = await db.select({
      id: conversations.id,
      customerId: conversations.customerId,
      providerId: conversations.providerId,
      serviceRequestId: conversations.serviceRequestId,
      lastMessageAt: conversations.lastMessageAt,
      customerUnreadCount: conversations.customerUnreadCount,
      providerUnreadCount: conversations.providerUnreadCount,
      createdAt: conversations.createdAt,
    }).from(conversations);

    res.json(allConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const result = await db.select({
      id: conversations.id,
      customerId: conversations.customerId,
      providerId: conversations.providerId,
      serviceRequestId: conversations.serviceRequestId,
      lastMessageAt: conversations.lastMessageAt,
      customerUnreadCount: conversations.customerUnreadCount,
      providerUnreadCount: conversations.providerUnreadCount,
      createdAt: conversations.createdAt,
    }).from(conversations).where(eq(conversations.id, id));


    if (result.length === 0) return res.status(404).json({ error: 'Conversación no encontrada' });

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching conversation by ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

