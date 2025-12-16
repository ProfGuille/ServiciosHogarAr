// backend/src/routes/mvp3/messages.ts
import express from 'express';
import { db } from '../../db.js';
import { messages, conversations, users, serviceProviders } from '../../shared/schema/index.js';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Get conversations for a user
router.get('/conversations', requireJWTAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get conversations where user is either client or provider
    const userConversations = await db
      .select({
        id: conversations.id,
        clientId: conversations.clientId,
        providerId: conversations.providerId,
        serviceRequestId: conversations.serviceRequestId,
        lastMessageAt: conversations.lastMessageAt,
        customerUnreadCount: conversations.customerUnreadCount,
        providerUnreadCount: conversations.providerUnreadCount,
        createdAt: conversations.createdAt,
        // Get the other participant's info
        otherUserName: sql<string>`
          CASE 
            WHEN ${conversations.clientId} = ${userId} 
            THEN (SELECT business_name FROM service_providers WHERE user_id = ${conversations.providerId})
            ELSE (SELECT name FROM users WHERE id = ${conversations.clientId})
          END
        `,
        otherUserId: sql<number>`
          CASE 
            WHEN ${conversations.clientId} = ${userId} 
            THEN ${conversations.providerId}
            ELSE ${conversations.clientId}
          END
        `,
        userRole: sql<string>`
          CASE 
            WHEN ${conversations.clientId} = ${userId} THEN 'client'
            ELSE 'provider'
          END
        `,
        // Get last message
        lastMessage: sql<string>`
          (SELECT content FROM messages 
           WHERE conversation_id = ${conversations.id} 
           ORDER BY created_at DESC LIMIT 1)
        `,
        unreadCount: sql<number>`
          CASE 
            WHEN ${conversations.clientId} = ${userId} THEN ${conversations.customerUnreadCount}
            ELSE ${conversations.providerUnreadCount}
          END
        `
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.clientId, userId),
          eq(conversations.providerId, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    res.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', requireJWTAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const conversationId = parseInt(req.params.conversationId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conv = conversation[0];
    if (conv.clientId !== userId && conv.providerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    // Get messages with sender info
    const conversationMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        attachmentUrl: messages.attachmentUrl,
        isRead: messages.isRead,
        readAt: messages.readAt,
        isEdited: messages.isEdited,
        editedAt: messages.editedAt,
        replyToMessageId: messages.replyToMessageId,
        createdAt: messages.createdAt,
        senderName: sql<string>`
          CASE 
            WHEN ${messages.senderId} = ${conv.clientId} 
            THEN (SELECT name FROM users WHERE id = ${messages.senderId})
            ELSE (SELECT business_name FROM service_providers WHERE user_id = ${messages.senderId})
          END
        `,
        senderRole: sql<string>`
          CASE 
            WHEN ${messages.senderId} = ${conv.clientId} THEN 'client'
            ELSE 'provider'
          END
        `
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    // Mark messages as read for the current user
    if (conversationMessages.length > 0) {
      const unreadMessageIds = conversationMessages
        .filter((msg: any) => msg.senderId !== userId && !msg.isRead)
        .map((msg: any) => msg.id);

      if (unreadMessageIds.length > 0) {
        await db
          .update(messages)
          .set({ isRead: true, readAt: new Date() })
          .where(
            and(
              eq(messages.conversationId, conversationId),
              sql`id = ANY(${unreadMessageIds})`
            )
          );

        // Reset unread count for this user
        const updateField = conv.clientId === userId 
          ? { customerUnreadCount: 0 }
          : { providerUnreadCount: 0 };

        await db
          .update(conversations)
          .set(updateField)
          .where(eq(conversations.id, conversationId));
      }
    }

    res.json(conversationMessages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new conversation
router.post('/conversations', requireJWTAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { providerId, serviceRequestId, initialMessage } = req.body;

    // Validate input
    if (!providerId) {
      return res.status(400).json({ error: 'Provider ID is required' });
    }

    // Check if conversation already exists
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.clientId, userId),
          eq(conversations.providerId, providerId)
        )
      )
      .limit(1);

    let conversation;
    if (existingConversation.length > 0) {
      conversation = existingConversation[0];
    } else {
      // Create new conversation
      const newConversation = await db
        .insert(conversations)
        .values({
          clientId: userId,
          providerId,
          customerId: userId, // Same as clientId for now
          serviceRequestId,
          lastMessageAt: new Date()
        })
        .returning();

      conversation = newConversation[0];
    }

    // Send initial message if provided
    if (initialMessage) {
      await db.insert(messages).values({
        conversationId: conversation.id,
        senderId: userId,
        content: initialMessage,
        messageType: 'text'
      });

      // Update conversation
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          providerUnreadCount: sql`provider_unread_count + 1`
        })
        .where(eq(conversations.id, conversation.id));
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send a message (REST endpoint, WebSocket is preferred for real-time)
router.post('/conversations/:conversationId/messages', requireJWTAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const conversationId = parseInt(req.params.conversationId);
    const { content, messageType = 'text', attachmentUrl } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conv = conversation[0];
    if (conv.clientId !== userId && conv.providerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    // Insert message
    const newMessage = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        content,
        messageType,
        attachmentUrl
      })
      .returning();

    // Update conversation
    const isClient = conv.clientId === userId;
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        ...(isClient 
          ? { providerUnreadCount: sql`provider_unread_count + 1` }
          : { customerUnreadCount: sql`customer_unread_count + 1` }
        )
      })
      .where(eq(conversations.id, conversationId));

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation details
router.get('/conversations/:conversationId', requireJWTAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const conversationId = parseInt(req.params.conversationId);

    const conversation = await db
      .select({
        id: conversations.id,
        clientId: conversations.clientId,
        providerId: conversations.providerId,
        serviceRequestId: conversations.serviceRequestId,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
        clientName: users.name,
        providerName: serviceProviders.businessName
      })
      .from(conversations)
      .leftJoin(users, eq(users.id, conversations.clientId))
      .leftJoin(serviceProviders, eq(serviceProviders.userId, conversations.providerId))
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conv = conversation[0];
    if (conv.clientId !== userId && conv.providerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    res.json(conv);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;
