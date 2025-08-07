// frontend/src/components/Chat/ChatApp.tsx
import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import { Conversation } from '../../hooks/mvp3/useChat';

interface ChatAppProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: number;
  // For starting new conversations
  initialProviderId?: number;
  initialMessage?: string;
}

const ChatApp: React.FC<ChatAppProps> = ({
  token,
  isOpen,
  onClose,
  initialConversationId,
  initialProviderId,
  initialMessage
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationsList, setShowConversationsList] = useState(true);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle initial conversation or provider
  useEffect(() => {
    if (initialConversationId) {
      // If we have an initial conversation ID, we'll select it once loaded
      // This will be handled by the ConversationsList component
    }
  }, [initialConversationId]);

  // Mobile behavior - show only one panel at a time
  useEffect(() => {
    if (isMobile) {
      if (selectedConversation) {
        setShowConversationsList(false);
      } else {
        setShowConversationsList(true);
      }
    } else {
      setShowConversationsList(true);
    }
  }, [selectedConversation, isMobile]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowConversationsList(true);
  };

  const handleNewConversation = () => {
    // TODO: Implement new conversation modal/flow
    console.log('New conversation requested');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            {selectedConversation && isMobile && (
              <button
                onClick={handleBackToList}
                className="ml-4 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                ← Volver
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          {showConversationsList && (
            <div className={`${
              isMobile ? 'w-full' : 'w-1/3 border-r border-gray-200'
            } flex-shrink-0`}>
              <ConversationsList
                token={token}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
                onNewConversation={handleNewConversation}
              />
            </div>
          )}

          {/* Chat Window */}
          {selectedConversation && (
            <div className={`${
              isMobile ? 'w-full' : 'flex-1'
            }`}>
              <ChatWindow
                conversationId={selectedConversation.id}
                token={token}
                onClose={isMobile ? handleBackToList : undefined}
              />
            </div>
          )}

          {/* Empty State */}
          {!selectedConversation && !isMobile && (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-600">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;