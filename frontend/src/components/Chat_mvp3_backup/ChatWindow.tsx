// frontend/src/components/Chat/ChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { useChat, Message } from '../../hooks/mvp3/useChat';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWindowProps {
  conversationId: number;
  token: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, token, onClose }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    messages,
    currentConversation,
    typingUsers,
    connected,
    loading,
    error,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    fetchMessages,
    setCurrentConversation
  } = useChat({ token, conversationId });

  // Load messages on mount
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    const unreadMessages = messages.filter(msg => 
      !msg.isRead && msg.senderId !== getCurrentUserId()
    );
    
    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages.map(msg => msg.id));
    }
  }, [messages, markAsRead]);

  const getCurrentUserId = () => {
    return parseInt(localStorage.getItem('userId') || '0');
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput.trim());
    setMessageInput('');
    handleStopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === getCurrentUserId();
    const timeAgo = formatDistanceToNow(new Date(message.createdAt), { 
      addSuffix: true, 
      locale: es 
    });

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {!isOwn && (
            <div className="text-sm text-gray-600 mb-1">{message.senderName}</div>
          )}
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwn
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <div className={`text-xs mt-1 ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {timeAgo}
              {isOwn && (
                <span className="ml-2">
                  {message.isRead ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    const typingUserNames = typingUsers
      .filter(user => user.isTyping)
      .map(user => `Usuario ${user.userId}`); // You might want to fetch actual names

    if (typingUserNames.length === 0) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">
              {typingUserNames.join(', ')} está escribiendo
            </span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error de conexión</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">
              {currentConversation?.otherUserName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold">{currentConversation?.otherUserName}</div>
            <div className="text-sm text-gray-500">
              {connected ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  En línea
                </span>
              ) : (
                'Desconectado'
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Phone size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Video size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <MoreVertical size={20} />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Cargando mensajes...</div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Paperclip size={20} />
          </button>
          <div className="flex-1">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={!connected}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !connected}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;