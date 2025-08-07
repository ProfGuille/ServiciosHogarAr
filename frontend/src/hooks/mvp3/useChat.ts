// frontend/src/hooks/mvp3/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  senderName: string;
  senderRole: 'client' | 'provider';
}

export interface Conversation {
  id: number;
  clientId: number;
  providerId: number;
  serviceRequestId?: number;
  lastMessageAt: string;
  customerUnreadCount: number;
  providerUnreadCount: number;
  createdAt: string;
  otherUserName: string;
  otherUserId: number;
  userRole: 'client' | 'provider';
  lastMessage: string;
  unreadCount: number;
}

interface TypingUser {
  userId: number;
  isTyping: boolean;
}

interface UseChatOptions {
  token?: string;
  conversationId?: number;
}

export const useChat = ({ token, conversationId }: UseChatOptions = {}) => {
  const { socket, connected, error: socketError } = useSocket({ token });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join conversation when socket connects and conversationId is provided
  useEffect(() => {
    if (socket && connected && conversationId) {
      socket.emit('join_conversation', conversationId);
    }
  }, [socket, connected, conversationId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === message.conversationId 
            ? { 
                ...conv, 
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount: message.senderId !== getCurrentUserId() 
                  ? conv.unreadCount + 1 
                  : conv.unreadCount
              }
            : conv
        )
      );
    };

    const handleMessagesRead = (data: { conversationId: number; messageIds: number[]; readBy: number }) => {
      setMessages(prev => 
        prev.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        )
      );
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    };

    const handleSocketError = (error: string) => {
      setError(error);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('error', handleSocketError);
    };
  }, [socket]);

  // Helper to get current user ID (you'll need to implement this based on your auth system)
  const getCurrentUserId = useCallback(() => {
    // This should return the current logged-in user's ID
    // You can get this from your auth context/store
    return parseInt(localStorage.getItem('userId') || '0');
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, messageType: string = 'text') => {
    if (!socket || !conversationId || !content.trim()) {
      return;
    }

    socket.emit('send_message', {
      conversationId,
      content: content.trim(),
      messageType
    });
  }, [socket, conversationId]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: number[]) => {
    if (!socket || !conversationId || messageIds.length === 0) {
      return;
    }

    socket.emit('mark_as_read', {
      conversationId,
      messageIds
    });
  }, [socket, conversationId]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit('typing_start', conversationId);
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit('typing_stop', conversationId);
  }, [socket, conversationId]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/mvp3/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (page: number = 1) => {
    if (!token || !conversationId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/mvp3/messages/conversations/${conversationId}/messages?page=${page}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      
      if (page === 1) {
        setMessages(data);
      } else {
        setMessages(prev => [...data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [token, conversationId]);

  // Create new conversation
  const createConversation = useCallback(async (providerId: number, initialMessage?: string) => {
    if (!token) return null;

    try {
      setLoading(true);
      const response = await fetch('/api/mvp3/messages/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerId,
          initialMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const conversation = await response.json();
      
      // Refresh conversations list
      fetchConversations();
      
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, fetchConversations]);

  return {
    // Data
    messages,
    conversations,
    currentConversation,
    typingUsers,
    
    // State
    connected,
    loading,
    error: error || socketError,
    
    // Actions
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    fetchConversations,
    fetchMessages,
    createConversation,
    
    // Setters
    setCurrentConversation,
    setError
  };
};

export default useChat;