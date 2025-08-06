import { Router } from 'express';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { messages } from '@/shared/schema/messages';

const router = Router();

// GET /api/messages/:conversationId
router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;

  try {
    const results = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    res.json(results);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ Exportación por default corregida
export default router;

