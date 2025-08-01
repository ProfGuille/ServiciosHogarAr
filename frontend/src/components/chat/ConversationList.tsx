import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation, User as UserType } from '@shared/schema';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation & { customer: UserType; provider: UserType }) => void;
  selectedConversationId?: number;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/conversations');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No hay conversaciones aún</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Las conversaciones aparecerán aquí cuando interactúes con profesionales o clientes
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {conversations.map((conversation: Conversation & { customer: UserType; provider: UserType; lastMessage?: any }) => {
          const otherUser = user?.id === conversation.customerId ? conversation.provider : conversation.customer;
          const isCustomer = user?.id === conversation.customerId;
          const unreadCount = isCustomer ? conversation.customerUnreadCount : conversation.providerUnreadCount;
          const isSelected = selectedConversationId === conversation.id;

          return (
            <Button
              key={conversation.id}
              variant={isSelected ? "default" : "ghost"}
              className={`w-full p-3 h-auto justify-start ${
                isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start space-x-3 w-full">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={otherUser.profileImageUrl || ''} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium truncate ${
                      isSelected ? 'text-primary-foreground' : 'text-gray-900 dark:text-white'
                    }`}>
                      {otherUser.firstName || otherUser.lastName 
                        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim()
                        : otherUser.email || 'Usuario'
                      }
                    </h4>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <p className={`text-xs mb-1 ${
                    isSelected ? 'text-primary-foreground/70' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {isCustomer ? 'Profesional' : 'Cliente'}
                  </p>
                  
                  {conversation.lastMessage && (
                    <>
                      <p className={`text-sm truncate ${
                        isSelected ? 'text-primary-foreground/80' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {conversation.lastMessage.senderId === user?.id ? 'Tú: ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isSelected ? 'text-primary-foreground/60' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}