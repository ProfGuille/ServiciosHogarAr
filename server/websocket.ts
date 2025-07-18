import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import type { Message, User } from '@shared/schema';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  user?: User;
}

interface WebSocketMessage {
  type: 'join_conversation' | 'send_message' | 'typing' | 'stop_typing';
  conversationId?: number;
  content?: string;
  messageType?: 'text' | 'image' | 'file';
}

interface BroadcastMessage {
  type: 'new_message' | 'user_typing' | 'user_stopped_typing' | 'conversation_updated';
  conversationId?: number;
  message?: Message & { sender: User };
  userId?: string;
  content?: any;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private connections: Map<string, AuthenticatedWebSocket[]> = new Map();
  private conversationRooms: Map<number, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // You can add additional verification here if needed
        return true;
      }
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      console.log('New WebSocket connection');

      ws.on('message', async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'WebSocket connected successfully' 
      }));
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    try {
      switch (message.type) {
        case 'join_conversation':
          if (message.conversationId && ws.userId) {
            await this.joinConversation(ws, message.conversationId);
          }
          break;

        case 'send_message':
          if (message.conversationId && message.content && ws.userId) {
            await this.handleSendMessage(ws, message.conversationId, message.content, message.messageType || 'text');
          }
          break;

        case 'typing':
          if (message.conversationId && ws.userId) {
            this.broadcastToConversation(message.conversationId, {
              type: 'user_typing',
              conversationId: message.conversationId,
              userId: ws.userId
            }, ws.userId);
          }
          break;

        case 'stop_typing':
          if (message.conversationId && ws.userId) {
            this.broadcastToConversation(message.conversationId, {
              type: 'user_stopped_typing',
              conversationId: message.conversationId,
              userId: ws.userId
            }, ws.userId);
          }
          break;

        default:
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Unknown message type' 
          }));
      }
    } catch (error) {
      console.error('Message handling error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message' 
      }));
    }
  }

  public authenticateConnection(ws: AuthenticatedWebSocket, userId: string, user: User) {
    ws.userId = userId;
    ws.user = user;

    // Add to user connections
    if (!this.connections.has(userId)) {
      this.connections.set(userId, []);
    }
    this.connections.get(userId)!.push(ws);

    console.log(`User ${userId} authenticated on WebSocket`);
  }

  private async joinConversation(ws: AuthenticatedWebSocket, conversationId: number) {
    if (!ws.userId) return;

    // Add user to conversation room
    if (!this.conversationRooms.has(conversationId)) {
      this.conversationRooms.set(conversationId, new Set());
    }
    this.conversationRooms.get(conversationId)!.add(ws.userId);

    // Mark messages as read when joining conversation
    await storage.markMessagesAsRead(conversationId, ws.userId);

    ws.send(JSON.stringify({
      type: 'joined_conversation',
      conversationId
    }));

    console.log(`User ${ws.userId} joined conversation ${conversationId}`);
  }

  private async handleSendMessage(ws: AuthenticatedWebSocket, conversationId: number, content: string, messageType: string) {
    if (!ws.userId) return;

    try {
      // Create message in database
      const newMessage = await storage.createMessage({
        conversationId,
        senderId: ws.userId,
        content,
        messageType: messageType as any,
      });

      // Get message with sender details
      const [messageWithSender] = await storage.getMessagesForConversation(conversationId, 1, 0);

      // Broadcast to all users in the conversation
      this.broadcastToConversation(conversationId, {
        type: 'new_message',
        conversationId,
        message: messageWithSender
      });

      console.log(`Message sent in conversation ${conversationId} by user ${ws.userId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message'
      }));
    }
  }

  private broadcastToConversation(conversationId: number, message: BroadcastMessage, excludeUserId?: string) {
    const room = this.conversationRooms.get(conversationId);
    if (!room) return;

    room.forEach(userId => {
      if (excludeUserId && userId === excludeUserId) return;

      const userConnections = this.connections.get(userId);
      if (userConnections) {
        userConnections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
          }
        });
      }
    });
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return;

    // Remove from user connections
    const userConnections = this.connections.get(ws.userId);
    if (userConnections) {
      const index = userConnections.indexOf(ws);
      if (index > -1) {
        userConnections.splice(index, 1);
      }
      
      if (userConnections.length === 0) {
        this.connections.delete(ws.userId);
      }
    }

    // Remove from conversation rooms
    this.conversationRooms.forEach((users, conversationId) => {
      if (ws.userId && users.has(ws.userId)) {
        users.delete(ws.userId);
        if (users.size === 0) {
          this.conversationRooms.delete(conversationId);
        }
      }
    });

    console.log(`User ${ws.userId} disconnected from WebSocket`);
  }

  public broadcastToUser(userId: string, message: BroadcastMessage) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  public getActiveUsers(): string[] {
    return Array.from(this.connections.keys());
  }

  public isUserOnline(userId: string): boolean {
    const connections = this.connections.get(userId);
    return !!(connections && connections.length > 0);
  }
}

// Export singleton instance
let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}