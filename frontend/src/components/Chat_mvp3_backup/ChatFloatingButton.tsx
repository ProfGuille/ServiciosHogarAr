// frontend/src/components/Chat/ChatFloatingButton.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import ChatApp from './ChatApp';

interface ChatFloatingButtonProps {
  token?: string;
  // Optional: Start with a specific conversation or provider
  initialConversationId?: number;
  initialProviderId?: number;
  initialMessage?: string;
  // Customization
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  showUnreadBadge?: boolean;
}

const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({
  token,
  initialConversationId,
  initialProviderId,
  initialMessage,
  position = 'bottom-right',
  size = 'medium',
  showUnreadBadge = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Size classes
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28
  };

  // TODO: You can implement real-time unread count updates here
  // using WebSocket or periodic API calls

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    
    // Reset unread count when opening
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  // Don't render if no token (user not authenticated)
  if (!token) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div
        className={`fixed z-40 ${positionClasses[position]} transition-transform duration-200 ${
          isOpen ? 'scale-110' : 'scale-100 hover:scale-105'
        }`}
      >
        <button
          onClick={handleToggleChat}
          className={`${sizeClasses[size]} bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center relative`}
          title={isOpen ? 'Cerrar chat' : 'Abrir chat'}
        >
          {isOpen ? (
            <Minimize2 size={iconSizes[size]} />
          ) : (
            <MessageCircle size={iconSizes[size]} />
          )}
          
          {/* Unread Badge */}
          {!isOpen && showUnreadBadge && unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
          
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </button>
      </div>

      {/* Chat App Modal */}
      <ChatApp
        token={token}
        isOpen={isOpen}
        onClose={handleCloseChat}
        initialConversationId={initialConversationId}
        initialProviderId={initialProviderId}
        initialMessage={initialMessage}
      />
    </>
  );
};

export default ChatFloatingButton;