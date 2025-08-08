// frontend/src/hooks/mvp3/useNotifications.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationService, type Notification, type NotificationsResponse } from '@/services/notifications';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '../useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);

  // Query para obtener notificaciones
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', 1], // Página 1 por defecto
    queryFn: () => notificationService.getNotifications(1, 10),
    enabled: !!user,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch cada minuto
  });

  // Setup inicial de notificaciones push
  useEffect(() => {
    const setupInitialNotifications = async () => {
      if (!user) return;

      try {
        // Verificar soporte
        if (!notificationService.isPushSupported()) {
          console.warn('Push notifications not supported');
          return;
        }

        // Verificar permiso actual
        const permission = Notification.permission;
        setHasPermission(permission === 'granted');

        // Obtener suscripción actual si existe
        const currentSubscription = await notificationService.getCurrentPushSubscription();
        setPushSubscription(currentSubscription);

        console.log('Notification setup:', { permission, hasSubscription: !!currentSubscription });
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupInitialNotifications();
  }, [user]);

  // Función para solicitar permisos y configurar push
  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      const subscription = await notificationService.setupPushNotifications();
      if (subscription) {
        setPushSubscription(subscription);
        setHasPermission(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return false;
    }
  };

  // Mutación para marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Función para mostrar notificación local
  const showLocalNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (hasPermission) {
      notificationService.showBrowserNotification(title, body, options);
    }
  };

  // Función para enviar notificación de prueba
  const sendTestNotification = async (): Promise<boolean> => {
    try {
      await notificationService.sendTestPush();
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };

  // Datos computados
  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const pagination = notificationsData?.pagination;

  return {
    // Estado
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    hasPermission,
    pushSubscription,
    
    // Acciones
    enablePushNotifications,
    showLocalNotification,
    sendTestNotification,
    refetch,
    
    // Mutaciones
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    
    // Estados de mutación
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}

// Hook específico para el contador de notificaciones no leídas
export function useUnreadNotifications() {
  const { user } = useAuth();
  
  const { data: notificationsData } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', 1],
    queryFn: () => notificationService.getNotifications(1, 1), // Solo necesitamos el contador
    enabled: !!user,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch cada minuto
    select: (data) => ({ unreadCount: data.unreadCount }), // Solo seleccionar el contador
  });

  return {
    unreadCount: notificationsData?.unreadCount || 0,
  };
}

// Hook para preferencias de notificación
export function useNotificationPreferences() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: notificationService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}