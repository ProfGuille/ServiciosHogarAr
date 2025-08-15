import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import type { Message, User } from '@shared/schema';

interface SocketIOMessage {
  conversationId: number;
  content: string;
  messageType?: string;
}

interface SocketIOOptions {
  onNewMessage?: (message: Message & { senderRole: string }, conversationId: number) => void;
  onUserTyping?: (data: { userId: number; isTyping: boolean }) => void;
  onMessagesRead?: (data: { conversationId: number; messageIds: number[]; readBy: number }) => void;
  onError?: (error: string) => void;
}

export function useSocketIO(options: SocketIOOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Get JWT token for WebSocket authentication
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include'
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get authentication token');
      }
      
      const { token } = await tokenResponse.json();

      // Connect to Socket.io server
      const socket = io('http://localhost:3000', {
        auth: {
          token
        },
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket.io connected successfully');
        setIsConnected(true);
        setError(null);
      });

      socket.on('new_message', (data: Message & { senderRole: string }) => {
        if (options.onNewMessage) {
          options.onNewMessage(data, data.conversationId);
        }
      });

      socket.on('user_typing', (data: { userId: number; isTyping: boolean }) => {
        if (options.onUserTyping) {
          options.onUserTyping(data);
        }
      });

      socket.on('messages_read', (data: { conversationId: number; messageIds: number[]; readBy: number }) => {
        if (options.onMessagesRead) {
          options.onMessagesRead(data);
        }
      });

      socket.on('error', (errorMessage: string) => {
        console.error('Socket.io error:', errorMessage);
        setError(errorMessage);
        if (options.onError) {
          options.onError(errorMessage);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
        setIsConnected(false);
        
        // Attempt reconnection if it was not intentional
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, manual reconnection needed
          setTimeout(() => {
            socket.connect();
          }, 2000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error.message);
        setError(`Connection error: ${error.message}`);
        setIsConnected(false);
      });

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
    }
  }, [isAuthenticated, user, options]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setCurrentConversationId(null);
    }
  }, []);

  const joinConversation = useCallback((conversationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_conversation', conversationId);
      setCurrentConversationId(conversationId);
    }
  }, [isConnected]);

  const sendMessage = useCallback((data: SocketIOMessage) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', data);
    }
  }, [isConnected]);

  const markAsRead = useCallback((data: { conversationId: number; messageIds: number[] }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_as_read', data);
    }
  }, [isConnected]);

  const startTyping = useCallback((conversationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', conversationId);
    }
  }, [isConnected]);

  const stopTyping = useCallback((conversationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', conversationId);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    isConnected,
    error,
    socket: socketRef.current,
    currentConversationId,
    joinConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    connect,
    disconnect
  };
}