import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration
const createTransporter = (): Transporter | null => {
  // Check if email credentials are provided
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email configuration missing. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const transporter = createTransporter();

// Email templates
export const emailTemplates = {
  newServiceRequest: (providerName: string, serviceName: string, customerName: string, location: string) => ({
    subject: 'Nueva solicitud de servicio - ServiciosHogar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">Nueva solicitud de servicio</h2>
        <p>Hola ${providerName},</p>
        <p>Has recibido una nueva solicitud de servicio:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Servicio:</strong> ${serviceName}</p>
          <p><strong>Cliente:</strong> ${customerName}</p>
          <p><strong>Ubicación:</strong> ${location}</p>
        </div>
        <p>Ingresa a tu panel de control para responder a esta solicitud.</p>
        <a href="${process.env.APP_URL || 'https://servicioshgar.com.ar'}/dashboard" 
           style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Ver solicitud
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Recuerda: necesitas 1 crédito para responder a esta solicitud.
        </p>
      </div>
    `,
  }),

  providerResponse: (customerName: string, providerName: string, serviceName: string, quotedPrice?: number) => ({
    subject: 'Respuesta a tu solicitud - ServiciosHogar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">Respuesta a tu solicitud</h2>
        <p>Hola ${customerName},</p>
        <p>El profesional ${providerName} ha respondido a tu solicitud de ${serviceName}.</p>
        ${quotedPrice ? `
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Precio cotizado:</strong> $${quotedPrice.toLocaleString('es-AR')}</p>
          </div>
        ` : ''}
        <p>Ingresa a la plataforma para ver los detalles completos y contactar al profesional.</p>
        <a href="${process.env.APP_URL || 'https://servicioshgar.com.ar'}/mis-solicitudes" 
           style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Ver respuesta
        </a>
      </div>
    `,
  }),

  creditsPurchased: (providerName: string, credits: number, amount: number) => ({
    subject: 'Compra de créditos confirmada - ServiciosHogar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">Compra de créditos confirmada</h2>
        <p>Hola ${providerName},</p>
        <p>Tu compra de créditos ha sido procesada exitosamente.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Créditos comprados:</strong> ${credits}</p>
          <p><strong>Monto pagado:</strong> $${amount.toLocaleString('es-AR')}</p>
        </div>
        <p>Los créditos ya están disponibles en tu cuenta y puedes usarlos para responder a solicitudes.</p>
        <a href="${process.env.APP_URL || 'https://servicioshgar.com.ar'}/dashboard" 
           style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Ir al panel de control
        </a>
      </div>
    `,
  }),

  welcome: (userName: string, userType: 'customer' | 'provider') => ({
    subject: 'Bienvenido a ServiciosHogar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">¡Bienvenido a ServiciosHogar!</h2>
        <p>Hola ${userName},</p>
        ${userType === 'customer' ? `
          <p>Gracias por registrarte en nuestra plataforma. Ahora puedes:</p>
          <ul>
            <li>Buscar profesionales calificados para tus necesidades</li>
            <li>Solicitar presupuestos sin costo</li>
            <li>Comparar precios y calificaciones</li>
            <li>Contactar directamente con los profesionales</li>
          </ul>
        ` : `
          <p>Gracias por unirte como profesional a nuestra plataforma. Para comenzar a recibir solicitudes:</p>
          <ol>
            <li>Completa tu perfil profesional</li>
            <li>Agrega los servicios que ofreces</li>
            <li>Compra créditos para responder a solicitudes</li>
            <li>Mantén tus datos de contacto actualizados</li>
          </ol>
        `}
        <a href="${process.env.APP_URL || 'https://servicioshgar.com.ar'}" 
           style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Comenzar ahora
        </a>
      </div>
    `,
  }),
};

// Email sending functions
export const sendEmail = async (to: string, template: { subject: string; html: string }) => {
  if (!transporter) {
    console.log('Email would be sent to:', to, 'Subject:', template.subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"ServiciosHogar" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Notification functions
export const notifyProviderNewRequest = async (
  providerEmail: string,
  providerName: string,
  serviceName: string,
  customerName: string,
  location: string
) => {
  const template = emailTemplates.newServiceRequest(providerName, serviceName, customerName, location);
  return sendEmail(providerEmail, template);
};

export const notifyCustomerProviderResponse = async (
  customerEmail: string,
  customerName: string,
  providerName: string,
  serviceName: string,
  quotedPrice?: number
) => {
  const template = emailTemplates.providerResponse(customerName, providerName, serviceName, quotedPrice);
  return sendEmail(customerEmail, template);
};

export const notifyProviderCreditsPurchased = async (
  providerEmail: string,
  providerName: string,
  credits: number,
  amount: number
) => {
  const template = emailTemplates.creditsPurchased(providerName, credits, amount);
  return sendEmail(providerEmail, template);
};

export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  userType: 'customer' | 'provider'
) => {
  const template = emailTemplates.welcome(userName, userType);
  return sendEmail(userEmail, template);
};