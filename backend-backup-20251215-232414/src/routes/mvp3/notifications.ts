// backend/src/routes/mvp3/notifications.ts
import { Router } from 'express';
import { db } from '../../db.js';
import { notifications, notificationPreferences, pushSubscriptions } from '../../shared/schema/index.js';
import { PushService } from '../../services/push/pushService.js';
import { eq, desc, and, count } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const pushService = new PushService();

// Get user notifications (paginated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get notifications with pagination
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [total] = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    // Get unread count
    const [unreadCount] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    res.json({
      notifications: userNotifications,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      },
      unreadCount: unreadCount.count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [updated] = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get notification preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    // Create default preferences if not found
    if (preferences.length === 0) {
      const [newPrefs] = await db
        .insert(notificationPreferences)
        .values({ userId })
        .returning();
      preferences = [newPrefs];
    }

    res.json(preferences[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      emailBookingConfirmation,
      emailBookingReminder,
      emailNewMessage,
      emailPaymentUpdate,
      emailMarketing,
      pushBookingConfirmation,
      pushBookingReminder,
      pushNewMessage,
      pushPaymentUpdate,
      doNotDisturb,
      doNotDisturbStart,
      doNotDisturbEnd
    } = req.body;

    // Check if preferences exist
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    let updated;
    if (existing.length === 0) {
      // Create new preferences
      [updated] = await db
        .insert(notificationPreferences)
        .values({
          userId,
          emailBookingConfirmation,
          emailBookingReminder,
          emailNewMessage,
          emailPaymentUpdate,
          emailMarketing,
          pushBookingConfirmation,
          pushBookingReminder,
          pushNewMessage,
          pushPaymentUpdate,
          doNotDisturb,
          doNotDisturbStart,
          doNotDisturbEnd,
          updatedAt: new Date()
        })
        .returning();
    } else {
      // Update existing preferences
      [updated] = await db
        .update(notificationPreferences)
        .set({
          emailBookingConfirmation,
          emailBookingReminder,
          emailNewMessage,
          emailPaymentUpdate,
          emailMarketing,
          pushBookingConfirmation,
          pushBookingReminder,
          pushNewMessage,
          pushPaymentUpdate,
          doNotDisturb,
          doNotDisturbStart,
          doNotDisturbEnd,
          updatedAt: new Date()
        })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Subscribe to push notifications
router.post('/push/subscribe', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { subscription, deviceInfo } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Check if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, subscription.endpoint)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Create new subscription
      await db
        .insert(pushSubscriptions)
        .values({
          userId,
          endpoint: subscription.endpoint,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userAgent: deviceInfo?.userAgent || req.headers['user-agent'] || '',
          isActive: true,
          createdAt: new Date()
        });
    } else {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userAgent: deviceInfo?.userAgent || req.headers['user-agent'] || '',
          isActive: true,
          lastUsedAt: new Date()
        })
        .where(eq(pushSubscriptions.id, existing[0].id));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});

// Unsubscribe from push notifications
router.post('/push/unsubscribe', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await db
      .update(pushSubscriptions)
      .set({
        isActive: false,
        lastUsedAt: new Date()
      })
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
});

// Test send push notification (for development)
router.post('/push/test', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await pushService.sendToUser(userId, {
      title: '🧪 Notificación de Prueba',
      body: 'Esta es una notificación de prueba del sistema.',
      icon: '/icons/test-notification.png',
      data: { test: true }
    });

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Delete notification
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;