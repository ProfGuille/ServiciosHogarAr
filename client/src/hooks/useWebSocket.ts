import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { Message, User, Conversation } from '@shared/schema';

interface WebSocketMessage {
  type: 'connected' | 'new_message' | 'user_typing' | 'user_stopped_typing' | 'joined_conversation' | 'error';
  conversationId?: number;
  message?: Message & { sender: User };
  userId?: string;
  content?: any;
}

interface UseWebSocketOptions {
  onNewMessage?: (message: Message & { sender: User }, conversationId: number) => void;
  onUserTyping?: (userId: string, conversationId: number) => void;
  onUserStoppedTyping?: (userId: string, conversationId: number) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('WebSocket authenticated successfully');
              break;
              
            case 'new_message':
              if (data.message && data.conversationId && options.onNewMessage) {
                options.onNewMessage(data.message, data.conversationId);
              }
              break;
              
            case 'user_typing':
              if (data.userId && data.conversationId && options.onUserTyping) {
                options.onUserTyping(data.userId, data.conversationId);
              }
              break;
              
            case 'user_stopped_typing':
              if (data.userId && data.conversationId && options.onUserStoppedTyping) {
                options.onUserStoppedTyping(data.userId, data.conversationId);
              }
              break;
              
            case 'joined_conversation':
              console.log(`Joined conversation ${data.conversationId}`);
              break;
              
            case 'error':
              console.error('WebSocket error:', data.content);
              setError(data.content);
              break;
              
            default:
              console.log('Unknown WebSocket message:', data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds if not manually closed
        if (event.code !== 1000 && isAuthenticated) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError('Failed to connect');
    }
  }, [isAuthenticated, user, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
    
    setIsConnected(false);
    wsRef.current = null;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const joinConversation = useCallback((conversationId: number) => {
    setCurrentConversationId(conversationId);
    return sendMessage({
      type: 'join_conversation',
      conversationId
    });
  }, [sendMessage]);

  const sendChatMessage = useCallback((conversationId: number, content: string, messageType: string = 'text') => {
    return sendMessage({
      type: 'send_message',
      conversationId,
      content,
      messageType
    });
  }, [sendMessage]);

  const sendTyping = useCallback((conversationId: number) => {
    return sendMessage({
      type: 'typing',
      conversationId
    });
  }, [sendMessage]);

  const sendStopTyping = useCallback((conversationId: number) => {
    return sendMessage({
      type: 'stop_typing',
      conversationId
    });
  }, [sendMessage]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return {
    socket: wsRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    joinConversation,
    sendChatMessage,
    sendTyping,
    sendStopTyping,
    currentConversationId,
  };
}