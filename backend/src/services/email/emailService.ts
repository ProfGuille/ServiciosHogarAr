// backend/src/services/email/emailService.ts
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { db } from '../../db.js';
import { notifications, notificationPreferences, users } from '../../shared/schema/index.js';
import { eq } from 'drizzle-orm';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@servicioshogar.com.ar',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Email Templates
  bookingConfirmationTemplate(data: {
    customerName: string;
    providerName: string;
    serviceName: string;
    scheduledDate: string;
    bookingId: number;
  }): EmailTemplate {
    return {
      subject: `Confirmación de Reserva - ${data.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">¡Reserva Confirmada!</h2>
          <p>Hola ${data.customerName},</p>
          <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalles de la Reserva</h3>
            <p><strong>Servicio:</strong> ${data.serviceName}</p>
            <p><strong>Proveedor:</strong> ${data.providerName}</p>
            <p><strong>Fecha:</strong> ${data.scheduledDate}</p>
            <p><strong>ID de Reserva:</strong> #${data.bookingId}</p>
          </div>
          
          <p>El proveedor se pondrá en contacto contigo pronto.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ServiciosHogar.com.ar - Tu plataforma de confianza para servicios del hogar
            </p>
          </div>
        </div>
      `,
      text: `Reserva Confirmada - ${data.serviceName}\n\nHola ${data.customerName},\n\nTu reserva ha sido confirmada:\n- Servicio: ${data.serviceName}\n- Proveedor: ${data.providerName}\n- Fecha: ${data.scheduledDate}\n- ID: #${data.bookingId}`
    };
  }

  bookingReminderTemplate(data: {
    customerName: string;
    providerName: string;
    serviceName: string;
    scheduledDate: string;
    hoursUntil: number;
  }): EmailTemplate {
    return {
      subject: `Recordatorio: ${data.serviceName} en ${data.hoursUntil} horas`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Recordatorio de Servicio</h2>
          <p>Hola ${data.customerName},</p>
          <p>Te recordamos que tienes un servicio programado:</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">En ${data.hoursUntil} horas</h3>
            <p><strong>Servicio:</strong> ${data.serviceName}</p>
            <p><strong>Proveedor:</strong> ${data.providerName}</p>
            <p><strong>Fecha:</strong> ${data.scheduledDate}</p>
          </div>
          
          <p>Asegúrate de estar disponible en el horario acordado.</p>
        </div>
      `,
      text: `Recordatorio: ${data.serviceName} en ${data.hoursUntil} horas\n\n- Proveedor: ${data.providerName}\n- Fecha: ${data.scheduledDate}`
    };
  }

  newMessageTemplate(data: {
    recipientName: string;
    senderName: string;
    messagePreview: string;
    conversationUrl: string;
  }): EmailTemplate {
    return {
      subject: `Nuevo mensaje de ${data.senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Nuevo Mensaje</h2>
          <p>Hola ${data.recipientName},</p>
          <p>Has recibido un nuevo mensaje de <strong>${data.senderName}</strong>:</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="font-style: italic;">"${data.messagePreview}"</p>
          </div>
          
          <a href="${data.conversationUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Conversación
          </a>
        </div>
      `,
      text: `Nuevo mensaje de ${data.senderName}: "${data.messagePreview}"\n\nVer conversación: ${data.conversationUrl}`
    };
  }

  appointmentReminderTemplate(data: {
    clientName: string;
    providerName: string;
    appointmentDate: string;
    timeToAppointment: string;
  }): EmailTemplate {
    return {
      subject: `Recordatorio: Tu servicio con ${data.providerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⏰ Recordatorio de Servicio</h2>
          <p>Hola ${data.clientName},</p>
          <p>Te recordamos que tienes un servicio programado:</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">En ${data.timeToAppointment}</h3>
            <p><strong>Proveedor:</strong> ${data.providerName}</p>
            <p><strong>Fecha y hora:</strong> ${data.appointmentDate}</p>
          </div>
          
          <p>Por favor, asegúrate de estar disponible en el horario acordado.</p>
          <p>Si necesitas contactar al proveedor, puedes hacerlo a través de nuestra plataforma.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ServiciosHogar.com.ar - Tu plataforma de confianza para servicios del hogar
            </p>
          </div>
        </div>
      `,
      text: `Recordatorio: Tu servicio con ${data.providerName}\n\nEn ${data.timeToAppointment}\nFecha: ${data.appointmentDate}\n\nAsegúrate de estar disponible en el horario acordado.`
    };
  }

  followUpTemplate(data: {
    clientName: string;
    providerName: string;
    serviceName: string;
    reviewUrl: string;
  }): EmailTemplate {
    return {
      subject: `¿Cómo fue tu experiencia con ${data.providerName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">💜 ¿Cómo fue tu experiencia?</h2>
          <p>Hola ${data.clientName},</p>
          <p>Esperamos que el servicio "${data.serviceName}" con <strong>${data.providerName}</strong> haya sido de tu agrado.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Tu opinión es muy importante</h3>
            <p>Tu feedback nos ayuda a:</p>
            <ul>
              <li>Mantener la calidad del servicio</li>
              <li>Ayudar a otros usuarios en su elección</li>
              <li>Reconocer a los mejores proveedores</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.reviewUrl}" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              ⭐ Escribir Reseña
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <em>Tu reseña será anónima y ayudará a mejorar nuestra comunidad de servicios.</em>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              ServiciosHogar.com.ar - Tu plataforma de confianza para servicios del hogar
            </p>
          </div>
        </div>
      `,
      text: `¿Cómo fue tu experiencia con ${data.providerName}?\n\nTu opinión sobre el servicio "${data.serviceName}" es muy importante para nosotros.\n\nEscribir reseña: ${data.reviewUrl}`
    };
  }

  // Send notification with email preferences check
  async sendNotificationEmail(
    userId: number, 
    notificationType: string, 
    templateData: any
  ): Promise<void> {
    try {
      // Check user's email preferences
      const prefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      // Default to sending if no preferences found
      let shouldSend = true;
      if (prefs.length > 0) {
        const pref = prefs[0];
        switch (notificationType) {
          case 'booking_confirmation':
            shouldSend = pref.emailBookingConfirmation;
            break;
          case 'booking_reminder':
            shouldSend = pref.emailBookingReminder;
            break;
          case 'new_message':
            shouldSend = pref.emailNewMessage;
            break;
          default:
            shouldSend = true;
        }
      }

      if (!shouldSend) {
        console.log(`Email skipped for user ${userId} - type ${notificationType} disabled`);
        return;
      }

      // Get user email from users table
      const user = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        console.error(`User ${userId} not found`);
        return;
      }

      // Prepare template based on type
      let template: EmailTemplate;
      switch (notificationType) {
        case 'booking_confirmation':
          template = this.bookingConfirmationTemplate(templateData);
          break;
        case 'booking_reminder':
          template = this.bookingReminderTemplate(templateData);
          break;
        case 'appointment_reminder':
          template = this.appointmentReminderTemplate(templateData);
          break;
        case 'follow_up':
          template = this.followUpTemplate(templateData);
          break;
        case 'new_message':
          template = this.newMessageTemplate(templateData);
          break;
        default:
          console.error(`Unknown notification type: ${notificationType}`);
          return;
      }

      // Send email
      const emailSent = await this.sendEmail(user[0].email, template);

      // Log notification in database
      await db.insert(notifications).values({
        userId,
        title: template.subject,
        content: template.text || template.html,
        type: notificationType,
        emailSent,
        emailSentAt: emailSent ? new Date() : null
      });

    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
}

// Create singleton instance
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

export const emailService = new EmailService(emailConfig);