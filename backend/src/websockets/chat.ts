// backend/src/websockets/chat.ts
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { messages, conversations } from '../shared/schema/index.js';
import { eq, and, sql } from 'drizzle-orm';

// Types for Socket.io with authentication
interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: 'client' | 'provider';
}

export function setupWebSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role || 'client';
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join conversation room
    socket.on('join_conversation', async (conversationId: number) => {
      try {
        // Verify user is part of this conversation
        const conversation = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId))
          .limit(1);

        if (conversation.length === 0) {
          socket.emit('error', 'Conversation not found');
          return;
        }

        const conv = conversation[0];
        if (conv.clientId !== socket.userId && conv.providerId !== socket.userId) {
          socket.emit('error', 'Unauthorized access to conversation');
          return;
        }

        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', 'Failed to join conversation');
      }
    });

    // Send message
    socket.on('send_message', async (data: {
      conversationId: number;
      content: string;
      messageType?: string;
    }) => {
      try {
        // Insert message to database
        const newMessage = await db
          .insert(messages)
          .values({
            conversationId: data.conversationId,
            senderId: socket.userId!,
            content: data.content,
            messageType: data.messageType || 'text'
          })
          .returning();

        // Update conversation last message time
        await db
          .update(conversations)
          .set({ 
            lastMessageAt: new Date(),
            // Update unread count for the other user
            ...(socket.userRole === 'client' 
              ? { providerUnreadCount: sql`provider_unread_count + 1` }
              : { customerUnreadCount: sql`customer_unread_count + 1` }
            )
          })
          .where(eq(conversations.id, data.conversationId));

        // Broadcast message to conversation room
        io.to(`conversation_${data.conversationId}`).emit('new_message', {
          ...newMessage[0],
          senderRole: socket.userRole
        });

        console.log(`Message sent in conversation ${data.conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data: {
      conversationId: number;
      messageIds: number[];
    }) => {
      try {
        // Update messages as read
        await db
          .update(messages)
          .set({ 
            isRead: true, 
            readAt: new Date() 
          })
          .where(
            and(
              eq(messages.conversationId, data.conversationId),
              sql`id = ANY(${data.messageIds})`
            )
          );

        // Reset unread count for this user
        const updateField = socket.userRole === 'client' 
          ? { customerUnreadCount: 0 }
          : { providerUnreadCount: 0 };

        await db
          .update(conversations)
          .set(updateField)
          .where(eq(conversations.id, data.conversationId));

        // Notify other user about read status
        socket.to(`conversation_${data.conversationId}`).emit('messages_read', {
          conversationId: data.conversationId,
          messageIds: data.messageIds,
          readBy: socket.userId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', 'Failed to mark messages as read');
      }
    });

    // User typing indicator
    socket.on('typing_start', (conversationId: number) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (conversationId: number) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}