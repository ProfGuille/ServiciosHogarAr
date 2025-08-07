// backend/src/services/push/pushService.ts
import webpush from 'web-push';
import { db } from '../../db.js';
import { pushSubscriptions, notifications, notificationPreferences } from '../../shared/schema/index.js';
import { eq } from 'drizzle-orm';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushService {
  constructor() {
    // Set VAPID details
    webpush.setVapidDetails(
      'mailto:' + (process.env.VAPID_EMAIL || 'admin@servicioshogar.com.ar'),
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );
  }

  async sendPushNotification(
    subscription: any,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async sendToUser(userId: number, payload: PushNotificationPayload): Promise<void> {
    try {
      // Get all active subscriptions for user
      const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      // Send to all user devices
      const sendPromises = subscriptions.map(async (sub) => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dhKey,
            auth: sub.authKey
          }
        };

        const success = await this.sendPushNotification(subscription, payload);
        
        if (success) {
          // Update last used timestamp
          await db
            .update(pushSubscriptions)
            .set({ lastUsedAt: new Date() })
            .where(eq(pushSubscriptions.id, sub.id));
        } else {
          // Mark subscription as inactive if failed
          await db
            .update(pushSubscriptions)
            .set({ isActive: false })
            .where(eq(pushSubscriptions.id, sub.id));
        }

        return success;
      });

      const results = await Promise.all(sendPromises);
      const successCount = results.filter(Boolean).length;

      console.log(`Push notification sent to ${successCount}/${subscriptions.length} devices for user ${userId}`);

      // Log notification in database
      await db.insert(notifications).values({
        userId,
        title: payload.title,
        content: payload.body,
        type: 'push',
        pushSent: successCount > 0,
        pushSentAt: successCount > 0 ? new Date() : null
      });

    } catch (error) {
      console.error('Error sending push notification to user:', error);
    }
  }

  // Predefined notification templates
  async sendBookingConfirmation(userId: number, data: {
    serviceName: string;
    providerName: string;
    scheduledDate: string;
    bookingId: number;
  }): Promise<void> {
    // Check user preferences
    const prefs = await this.getUserPreferences(userId);
    if (prefs && !prefs.pushBookingConfirmation) {
      return;
    }

    const payload: PushNotificationPayload = {
      title: 'Reserva Confirmada',
      body: `Tu reserva de ${data.serviceName} con ${data.providerName} ha sido confirmada`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'booking_confirmation',
        bookingId: data.bookingId,
        url: `/bookings/${data.bookingId}`
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Reserva'
        },
        {
          action: 'chat',
          title: 'Contactar Proveedor'
        }
      ]
    };

    await this.sendToUser(userId, payload);
  }

  async sendBookingReminder(userId: number, data: {
    serviceName: string;
    hoursUntil: number;
    bookingId: number;
  }): Promise<void> {
    const prefs = await this.getUserPreferences(userId);
    if (prefs && !prefs.pushBookingReminder) {
      return;
    }

    const payload: PushNotificationPayload = {
      title: 'Recordatorio de Servicio',
      body: `Tu servicio de ${data.serviceName} es en ${data.hoursUntil} horas`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'booking_reminder',
        bookingId: data.bookingId,
        url: `/bookings/${data.bookingId}`
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Detalles'
        }
      ]
    };

    await this.sendToUser(userId, payload);
  }

  async sendNewMessage(userId: number, data: {
    senderName: string;
    messagePreview: string;
    conversationId: number;
  }): Promise<void> {
    const prefs = await this.getUserPreferences(userId);
    if (prefs && !prefs.pushNewMessage) {
      return;
    }

    const payload: PushNotificationPayload = {
      title: `Mensaje de ${data.senderName}`,
      body: data.messagePreview,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'new_message',
        conversationId: data.conversationId,
        url: `/chat/${data.conversationId}`
      },
      actions: [
        {
          action: 'reply',
          title: 'Responder'
        },
        {
          action: 'view',
          title: 'Ver Chat'
        }
      ]
    };

    await this.sendToUser(userId, payload);
  }

  private async getUserPreferences(userId: number) {
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    return prefs.length > 0 ? prefs[0] : null;
  }

  // Subscribe a user to push notifications
  async subscribe(userId: number, subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }, userAgent?: string): Promise<void> {
    try {
      // Check if subscription already exists
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription
        await db
          .update(pushSubscriptions)
          .set({
            userId,
            p256dhKey: subscription.keys.p256dh,
            authKey: subscription.keys.auth,
            userAgent,
            isActive: true,
            lastUsedAt: new Date()
          })
          .where(eq(pushSubscriptions.id, existing[0].id));
      } else {
        // Create new subscription
        await db.insert(pushSubscriptions).values({
          userId,
          endpoint: subscription.endpoint,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userAgent,
          isActive: true
        });
      }

      console.log(`Push subscription registered for user ${userId}`);
    } catch (error) {
      console.error('Error registering push subscription:', error);
      throw error;
    }
  }

  // Unsubscribe a user from push notifications
  async unsubscribe(endpoint: string): Promise<void> {
    try {
      await db
        .update(pushSubscriptions)
        .set({ isActive: false })
        .where(eq(pushSubscriptions.endpoint, endpoint));

      console.log('Push subscription deactivated:', endpoint);
    } catch (error) {
      console.error('Error deactivating push subscription:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const pushService = new PushService();