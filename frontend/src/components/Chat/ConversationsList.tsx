// frontend/src/components/Chat/ConversationsList.tsx
import React, { useEffect } from 'react';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { useChat, Conversation } from '../../hooks/mvp3/useChat';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationsListProps {
  token: string;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: number;
  onNewConversation?: () => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  token,
  onSelectConversation,
  selectedConversationId,
  onNewConversation
}) => {
  const {
    conversations,
    loading,
    error,
    fetchConversations
  } = useChat({ token });

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const renderConversation = (conversation: Conversation) => {
    const timeAgo = formatDistanceToNow(new Date(conversation.lastMessageAt), { 
      addSuffix: true, 
      locale: es 
    });

    const isSelected = conversation.id === selectedConversationId;
    const hasUnread = conversation.unreadCount > 0;

    return (
      <div
        key={conversation.id}
        onClick={() => onSelectConversation(conversation)}
        className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
        }`}
      >
        {/* Avatar */}
        <div className="relative mr-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">
              {conversation.otherUserName?.charAt(0).toUpperCase()}
            </span>
          </div>
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className={`font-medium truncate ${
              hasUnread ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {conversation.otherUserName}
            </div>
            <div className="text-xs text-gray-500 ml-2">
              {timeAgo}
            </div>
          </div>
          
          <div className={`text-sm truncate ${
            hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
          }`}>
            {conversation.lastMessage || 'Sin mensajes'}
          </div>
          
          {/* Role indicator */}
          <div className="flex items-center mt-1">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              conversation.userRole === 'provider' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {conversation.userRole === 'provider' ? 'Proveedor' : 'Cliente'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error al cargar conversaciones</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button 
            onClick={fetchConversations}
            className="mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              title="Nueva conversación"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Cargando conversaciones...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <MessageCircle size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay conversaciones
            </h3>
            <p className="text-gray-600 mb-4">
              Inicia una conversación con un proveedor para comenzar
            </p>
            {onNewConversation && (
              <button
                onClick={onNewConversation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Nueva conversación
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map(renderConversation)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;