import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import type { ServiceProvider } from '@shared/schema';

interface StartConversationButtonProps {
  provider: ServiceProvider;
  serviceRequestId?: number;
  className?: string;
}

export function StartConversationButton({ 
  provider, 
  serviceRequestId, 
  className 
}: StartConversationButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/conversations', {
        customerId: user?.id,
        providerId: provider.userId,
        serviceRequestId,
      });
      return response.json();
    },
    onSuccess: (conversation) => {
      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Navigate to messages page
      setLocation('/mensajes');
      
      toast({
        title: "Conversación iniciada",
        description: "Ahora puedes chatear con el profesional.",
      });
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleStartConversation = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para chatear con profesionales.",
        variant: "destructive",
      });
      return;
    }

    createConversationMutation.mutate();
  };

  return (
    <Button
      onClick={handleStartConversation}
      disabled={createConversationMutation.isPending}
      className={className}
      variant="outline"
      size="sm"
    >
      {createConversationMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Enviar mensaje
    </Button>
  );
}