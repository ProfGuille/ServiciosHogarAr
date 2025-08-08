// backend/src/cron/notificationCron.ts
import cron from 'node-cron';
import { db } from '../db.js';
import { appointments, serviceRequests, notifications, users, serviceProviders } from '../shared/schema/index.js';
import { EmailService } from '../services/email/emailService.js';
import { PushService } from '../services/push/pushService.js';
import { and, eq, gte, lte, between, isNull } from 'drizzle-orm';
import { addHours, subHours, format, isBefore, isAfter } from 'date-fns';

export class NotificationCronService {
  private emailService: EmailService;
  private pushService: PushService;
  private isStarted = false;

  constructor() {
    // Configuración del servicio de email (usando variables de entorno)
    this.emailService = new EmailService({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });

    this.pushService = new PushService();
  }

  start() {
    if (this.isStarted) {
      console.log('❌ Notification cron jobs already started');
      return;
    }

    console.log('🚀 Starting notification cron jobs...');

    // Ejecutar cada 5 minutos para verificar recordatorios
    cron.schedule('*/5 * * * *', () => {
      this.checkUpcomingAppointments();
    }, {
      timezone: 'America/Argentina/Buenos_Aires'
    });

    // Ejecutar cada hora para verificar seguimientos
    cron.schedule('0 * * * *', () => {
      this.checkFollowUpNotifications();
    }, {
      timezone: 'America/Argentina/Buenos_Aires'
    });

    // Limpiar notificaciones antiguas (diario a las 2 AM)
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldNotifications();
    }, {
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.isStarted = true;
    console.log('✅ Notification cron jobs started successfully');
  }

  stop() {
    console.log('🛑 Stopping notification cron jobs...');
    this.isStarted = false;
  }

  // Verificar citas próximas y enviar recordatorios
  async checkUpcomingAppointments() {
    try {
      const now = new Date();
      const in24Hours = addHours(now, 24);
      const in2Hours = addHours(now, 2);

      // Buscar citas en las próximas 24 horas
      const upcomingAppointments = await db
        .select({
          appointment: appointments,
          client: users,
          provider: serviceProviders
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.clientId, users.id))
        .leftJoin(serviceProviders, eq(appointments.providerId, serviceProviders.id))
        .where(
          and(
            between(appointments.scheduledAt, now, in24Hours),
            eq(appointments.status, 'confirmed')
          )
        );

      for (const { appointment, client, provider } of upcomingAppointments) {
        if (!client || !provider) continue;

        const timeToAppointment = new Date(appointment.scheduledAt).getTime() - now.getTime();
        const hoursToAppointment = timeToAppointment / (1000 * 60 * 60);

        // Recordatorio 24 horas antes
        if (hoursToAppointment <= 24 && hoursToAppointment > 23.5) {
          await this.send24HourReminder(appointment, client, provider);
        }

        // Recordatorio 2 horas antes
        if (hoursToAppointment <= 2 && hoursToAppointment > 1.5) {
          await this.send2HourReminder(appointment, client, provider);
        }
      }

      console.log(`✅ Checked ${upcomingAppointments.length} upcoming appointments`);
    } catch (error) {
      console.error('❌ Error checking upcoming appointments:', error);
    }
  }

  // Verificar notificaciones de seguimiento post-servicio
  async checkFollowUpNotifications() {
    try {
      const now = new Date();
      const yesterday = subHours(now, 24);

      // Buscar servicios completados ayer
      const completedServices = await db
        .select({
          request: serviceRequests,
          client: users,
          provider: serviceProviders
        })
        .from(serviceRequests)
        .leftJoin(users, eq(serviceRequests.userId, users.id))
        .leftJoin(serviceProviders, eq(serviceRequests.providerId, serviceProviders.id))
        .where(
          and(
            eq(serviceRequests.status, 'completed'),
            between(serviceRequests.completedAt!, subHours(yesterday, 1), addHours(yesterday, 1))
          )
        );

      for (const { request, client, provider } of completedServices) {
        if (!client || !provider) continue;
        await this.sendFollowUpNotification(request, client, provider);
      }

      console.log(`✅ Checked ${completedServices.length} completed services for follow-up`);
    } catch (error) {
      console.error('❌ Error checking follow-up notifications:', error);
    }
  }

  // Limpiar notificaciones antiguas (más de 30 días)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = subHours(new Date(), 24 * 30);
      
      const deletedCount = await db
        .delete(notifications)
        .where(lte(notifications.createdAt, thirtyDaysAgo));

      console.log(`✅ Cleaned up old notifications: ${deletedCount} deleted`);
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  }

  // Enviar recordatorio 24 horas antes
  private async send24HourReminder(appointment: any, client: any, provider: any) {
    try {
      // Verificar que no se haya enviado ya
      const existingNotification = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, client.id),
            eq(notifications.type, 'reminder_24h'),
            eq(notifications.entityType, 'appointment'),
            eq(notifications.entityId, appointment.id)
          )
        )
        .limit(1);

      if (existingNotification.length > 0) return;

      const appointmentDate = format(new Date(appointment.scheduledAt), 'dd/MM/yyyy HH:mm');
      
      // Crear notificación en BD
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: client.id,
          title: 'Recordatorio: Servicio mañana',
          content: `Tu servicio con ${provider.name} está programado para mañana ${appointmentDate}`,
          type: 'reminder_24h',
          entityType: 'appointment',
          entityId: appointment.id,
          actionUrl: `/appointments/${appointment.id}`
        })
        .returning();

      // Enviar email
      await this.emailService.sendEmail(
        client.email,
        this.emailService.appointmentReminderTemplate({
          clientName: client.name,
          providerName: provider.name,
          appointmentDate,
          timeToAppointment: '24 horas'
        })
      );

      // Enviar push notification
      await this.pushService.sendToUser(client.id, {
        title: '⏰ Recordatorio de servicio',
        body: `Tu servicio con ${provider.name} es mañana a las ${appointmentDate}`,
        icon: '/icons/appointment-reminder.png',
        data: { appointmentId: appointment.id }
      });

      console.log(`✅ Sent 24h reminder for appointment ${appointment.id}`);
    } catch (error) {
      console.error(`❌ Error sending 24h reminder for appointment ${appointment.id}:`, error);
    }
  }

  // Enviar recordatorio 2 horas antes
  private async send2HourReminder(appointment: any, client: any, provider: any) {
    try {
      // Verificar que no se haya enviado ya
      const existingNotification = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, client.id),
            eq(notifications.type, 'reminder_2h'),
            eq(notifications.entityType, 'appointment'),
            eq(notifications.entityId, appointment.id)
          )
        )
        .limit(1);

      if (existingNotification.length > 0) return;

      const appointmentTime = format(new Date(appointment.scheduledAt), 'HH:mm');
      
      // Crear notificación en BD
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: client.id,
          title: 'Recordatorio: Servicio en 2 horas',
          content: `Tu servicio con ${provider.name} comienza en 2 horas (${appointmentTime})`,
          type: 'reminder_2h',
          entityType: 'appointment',
          entityId: appointment.id,
          actionUrl: `/appointments/${appointment.id}`
        })
        .returning();

      // Enviar push notification (más urgente, no email)
      await this.pushService.sendToUser(client.id, {
        title: '🚨 ¡Tu servicio es en 2 horas!',
        body: `${provider.name} te atenderá a las ${appointmentTime}`,
        icon: '/icons/urgent-reminder.png',
        data: { appointmentId: appointment.id }
      });

      console.log(`✅ Sent 2h reminder for appointment ${appointment.id}`);
    } catch (error) {
      console.error(`❌ Error sending 2h reminder for appointment ${appointment.id}:`, error);
    }
  }

  // Enviar notificación de seguimiento post-servicio
  private async sendFollowUpNotification(request: any, client: any, provider: any) {
    try {
      // Verificar que no se haya enviado ya
      const existingNotification = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, client.id),
            eq(notifications.type, 'follow_up'),
            eq(notifications.entityType, 'service_request'),
            eq(notifications.entityId, request.id)
          )
        )
        .limit(1);

      if (existingNotification.length > 0) return;

      // Crear notificación en BD
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: client.id,
          title: '¿Cómo fue tu experiencia?',
          content: `Queremos saber tu opinión sobre el servicio de ${provider.name}`,
          type: 'follow_up',
          entityType: 'service_request',
          entityId: request.id,
          actionUrl: `/review/${request.id}`
        })
        .returning();

      // Enviar email de seguimiento
      await this.emailService.sendEmail(
        client.email,
        this.emailService.followUpTemplate({
          clientName: client.name,
          providerName: provider.name,
          serviceName: request.title || 'tu servicio',
          reviewUrl: `${process.env.FRONTEND_URL}/review/${request.id}`
        })
      );

      console.log(`✅ Sent follow-up notification for service ${request.id}`);
    } catch (error) {
      console.error(`❌ Error sending follow-up notification for service ${request.id}:`, error);
    }
  }
}

// Instancia singleton
export const notificationCron = new NotificationCronService();