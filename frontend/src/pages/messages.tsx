import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Conversation, User } from '@shared/schema';

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { customer: User; provider: User }) | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {isMobile && selectedConversation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="mr-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <MessageCircle className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isMobile && selectedConversation ? 'Chat' : 'Mensajes'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-12rem)]">
          {isMobile ? (
            // Mobile layout - show either list or chat
            <>
              {!selectedConversation ? (
                <ConversationList
                  onSelectConversation={setSelectedConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              ) : (
                <ChatWindow
                  conversation={selectedConversation}
                  onClose={handleBackToList}
                />
              )}
            </>
          ) : (
            // Desktop layout - show both side by side
            <div className="flex h-full">
              {/* Conversations Sidebar */}
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Conversaciones
                  </h2>
                </div>
                <ConversationList
                  onSelectConversation={setSelectedConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>

              {/* Chat Area */}
              <div className="flex-1">
                {selectedConversation ? (
                  <ChatWindow conversation={selectedConversation} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Selecciona una conversación
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Elige una conversación de la lista para comenzar a chatear
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}