// frontend/src/components/notifications/NotificationCenter.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, X, Settings, Trash2, Check, CheckCheck } from 'lucide-react';
import { notificationService, type Notification, type NotificationsResponse } from '@/services/notifications';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Query para obtener notificaciones
  const { data: notificationsData, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', currentPage],
    queryFn: () => notificationService.getNotifications(currentPage, 10),
    staleTime: 30000, // 30 segundos
    enabled: isOpen, // Solo cargar cuando esté abierto
  });

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

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navegar a la URL de acción si existe
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setIsOpen(false);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const unreadCount = notificationsData?.unreadCount || 0;
  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination;

  return (
    <div className={cn('relative', className)}>
      {/* Botón de notificaciones */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs"
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Cargando...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">Error al cargar notificaciones</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notification) => {
                const formatted = notificationService.formatNotification(notification);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                      !notification.isRead && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{formatted.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={cn(
                            'text-sm font-medium text-gray-900 line-clamp-1',
                            !notification.isRead && 'font-semibold'
                          )}>
                            {formatted.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleMarkAsRead(e, notification.id)}
                                className="p-1 h-6 w-6"
                                title="Marcar como leída"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(e, notification.id)}
                              className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {formatted.body}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatted.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginación */}
          {pagination && pagination.pages > 1 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-xs text-gray-500">
                Página {currentPage} de {pagination.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          )}

          {/* Footer con configuración */}
          <div className="p-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-left justify-start"
              onClick={() => {
                setIsOpen(false);
                // Navegar a configuración de notificaciones
                window.location.href = '/settings/notifications';
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar notificaciones
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}