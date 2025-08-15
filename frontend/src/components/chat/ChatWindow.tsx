import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useSocketIO } from '@/hooks/useSocketIO';
import { Send, User, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation, User as UserType, Message } from '@shared/schema';

interface ChatWindowProps {
  conversation: Conversation & { customer: UserType; provider: UserType };
  onClose?: () => void;
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const otherUser = user?.id === conversation.customerId ? conversation.provider : conversation.customer;
  const isCustomer = user?.id === conversation.customerId;

  // Socket.io connection for real-time messaging with enhanced error handling
  const socketIO = useSocketIO({
    onNewMessage: (message, conversationId) => {
      if (conversationId === conversation.id) {
        // Update local messages cache
        queryClient.setQueryData(['messages', conversation.id], (oldMessages: Message[] = []) => [
          ...oldMessages,
          message,
        ]);
      }
    },
    onUserTyping: (data) => {
      if (data.userId !== user?.id) {
        setIsTyping(data.isTyping);
        
        if (data.isTyping) {
          // Clear typing after 3 seconds if no update
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "Error de conexión",
        description: "Problema con el chat en tiempo real. Los mensajes se enviarán normalmente.",
        variant: "destructive",
      });
    }
  });

  // Fetch messages for this conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/conversations/${conversation.id}/messages`);
      return response.json();
    },
  });

  // Send message with enhanced real-time integration
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // First try Socket.io for real-time delivery
      if (socketIO.isConnected) {
        socketIO.sendMessage({
          conversationId: conversation.id,
          content,
          messageType: 'text'
        });
      }
      
      // Also send via HTTP API as fallback
      const response = await apiRequest('POST', `/api/conversations/${conversation.id}/messages`, {
        content,
      });
      return response.json();
    },
    onSuccess: (newMessage) => {
      // Update local messages cache (if not already updated by Socket.io)
      queryClient.setQueryData(['messages', conversation.id], (oldMessages: Message[] = []) => {
        const exists = oldMessages.some(msg => msg.id === newMessage.id);
        return exists ? oldMessages : [...oldMessages, newMessage];
      });

      // Update conversations cache to reflect new message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversation.id) {
      apiRequest('PUT', `/api/conversations/${conversation.id}/mark-read`, {})
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        })
        .catch(console.error);
    }
  // Join conversation when component mounts
  useEffect(() => {
    if (socketIO.isConnected && conversation.id) {
      socketIO.joinConversation(conversation.id);
    }
  }, [socketIO.isConnected, conversation.id, socketIO]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-mark messages as read when conversation is opened
  useEffect(() => {
    markAsRead();
  }, [conversation.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(message.trim());
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    // Send typing indicator via Socket.io
    if (socketIO.isConnected && conversation.id) {
      if (value.length > 0) {
        socketIO.startTyping(conversation.id);
      }

      // Clear typing indicator after 2 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketIO.stopTyping(conversation.id);
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.profileImageUrl || ''} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {otherUser.firstName || otherUser.lastName 
                ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim()
                : otherUser.email || 'Usuario'
              }
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isCustomer ? 'Profesional' : 'Cliente'}
              {!socketIO.isConnected && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                  • Sin conexión en tiempo real
                </span>
              )}
              {socketIO.isConnected && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  • En línea
                </span>
              )}
              {isTyping && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  • Escribiendo...
                </span>
              )}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No hay mensajes aún. ¡Envía el primer mensaje!
              </p>
            </div>
          ) : (
            messages.map((msg: Message) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn
                          ? 'text-primary-foreground/70'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}