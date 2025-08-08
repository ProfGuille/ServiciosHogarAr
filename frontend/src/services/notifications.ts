// frontend/src/services/notifications.ts
import { apiRequest } from '@/lib/queryClient';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  entityType?: string;
  entityId?: number;
  actionUrl?: string;
  pushSent: boolean;
  pushSentAt?: string;
  emailSent: boolean;
  emailSentAt?: string;
}

export interface NotificationPreferences {
  id: number;
  userId: number;
  emailBookingConfirmation: boolean;
  emailBookingReminder: boolean;
  emailNewMessage: boolean;
  emailPaymentUpdate: boolean;
  emailMarketing: boolean;
  pushBookingConfirmation: boolean;
  pushBookingReminder: boolean;
  pushNewMessage: boolean;
  pushPaymentUpdate: boolean;
  doNotDisturb: boolean;
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export interface PushSubscriptionData {
  subscription: PushSubscription;
  deviceInfo?: {
    userAgent: string;
  };
}

class NotificationService {
  // Get user notifications with pagination
  async getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
    const response = await apiRequest('GET', `/api/notifications?page=${page}&limit=${limit}`);
    return response.json();
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    const data = await response.json();
    return data.notification;
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiRequest('PATCH', '/api/notifications/read-all');
  }

  // Delete notification
  async deleteNotification(notificationId: number): Promise<void> {
    await apiRequest('DELETE', `/api/notifications/${notificationId}`);
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiRequest('GET', '/api/notifications/preferences');
    return response.json();
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiRequest('PUT', '/api/notifications/preferences', preferences);
    return response.json();
  }

  // Subscribe to push notifications
  async subscribeToPush(subscriptionData: PushSubscriptionData): Promise<void> {
    await apiRequest('POST', '/api/notifications/push/subscribe', subscriptionData);
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(endpoint: string): Promise<void> {
    await apiRequest('POST', '/api/notifications/push/unsubscribe', { endpoint });
  }

  // Send test push notification
  async sendTestPush(): Promise<void> {
    await apiRequest('POST', '/api/notifications/push/test');
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones push');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Check if push notifications are supported
  isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current push subscription
  async getCurrentPushSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported()) {
      return null;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return null;
    }

    return registration.pushManager.getSubscription();
  }

  // Setup push notifications
  async setupPushNotifications(): Promise<PushSubscription | null> {
    try {
      // Check support
      if (!this.isPushSupported()) {
        console.warn('Push notifications not supported');
        return null;
      }

      // Request permission
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
          )
        });
      }

      // Send subscription to server
      await this.subscribeToPush({
        subscription,
        deviceInfo: {
          userAgent: navigator.userAgent
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      return null;
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show browser notification (fallback)
  showBrowserNotification(title: string, body: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/icons/badge.png',
        ...options
      });
    }
  }

  // Format notification for display
  formatNotification(notification: Notification): {
    title: string;
    body: string;
    time: string;
    icon: string;
    color: string;
  } {
    const now = new Date();
    const createdAt = new Date(notification.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let timeString: string;
    if (diffDays > 0) {
      timeString = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeString = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      timeString = diffMinutes > 0 ? `hace ${diffMinutes} min` : 'ahora';
    }

    // Determine icon and color based on type
    let icon = '🔔';
    let color = '#6b7280';

    switch (notification.type) {
      case 'booking':
      case 'booking_confirmation':
        icon = '📅';
        color = '#10b981';
        break;
      case 'reminder_24h':
      case 'reminder_2h':
        icon = '⏰';
        color = '#f59e0b';
        break;
      case 'message':
      case 'new_message':
        icon = '💬';
        color = '#3b82f6';
        break;
      case 'payment':
        icon = '💳';
        color = '#8b5cf6';
        break;
      case 'follow_up':
        icon = '⭐';
        color = '#ec4899';
        break;
      case 'system':
        icon = '⚙️';
        color = '#6b7280';
        break;
    }

    return {
      title: notification.title,
      body: notification.content,
      time: timeString,
      icon,
      color
    };
  }
}

export const notificationService = new NotificationService();