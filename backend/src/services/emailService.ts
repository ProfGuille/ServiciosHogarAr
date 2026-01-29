import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'administrador@servicioshogar.com.ar',
    pass: process.env.SMTP_PASS,
  },
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'administrador@servicioshogar.com.ar';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

export async function sendLeadNotification(
  providerEmail: string,
  providerName: string,
  leadData: {
    id: number;
    title: string;
    descriptionPreview: string;
    neighborhood: string;
    categoryName: string;
    createdAt: Date;
  }
): Promise<boolean> {
  try {
    const transport = getTransporter();

    if (!SMTP_CONFIG.auth.pass) {
      console.error('❌ SMTP_PASS no está configurado');
      return false;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
            h1 { margin: 0; font-size: 24px; }
            .lead-info { background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nuevo Lead Disponible</h1>
            </div>
            <p>Hola <strong>${providerName}</strong>,</p>
            <p>Tenemos una nueva solicitud de servicio que coincide con tu categoría:</p>
            <div class="lead-info">
              <h2>${leadData.title}</h2>
              <p>📍 Zona: ${leadData.neighborhood}</p>
              <p>🏷️ Categoría: ${leadData.categoryName}</p>
              <p>📝 Descripción: ${leadData.descriptionPreview}...</p>
              <p>🕐 Fecha: ${new Date(leadData.createdAt).toLocaleString('es-AR')}</p>
            </div>
            <center>
              <a href="https://servicioshogar.com.ar/dashboard-profesional" class="cta-button">
                Ver Lead en Dashboard
              </a>
            </center>
            <div class="footer">
              <p>ServiciosHogar.com.ar</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"ServiciosHogar.com.ar" <${EMAIL_FROM}>`,
      to: providerEmail,
      subject: `🔔 Nuevo Lead: ${leadData.categoryName} en ${leadData.neighborhood}`,
      html: htmlContent,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${providerEmail}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
}

export async function sendTestEmail(toEmail: string): Promise<boolean> {
  try {
    const transport = getTransporter();
    if (!SMTP_CONFIG.auth.pass) {
      console.error('❌ SMTP_PASS no está configurado');
      return false;
    }

    const mailOptions = {
      from: `"ServiciosHogar.com.ar" <${EMAIL_FROM}>`,
      to: toEmail,
      subject: '✅ Test de Email - ServiciosHogar.com.ar',
      html: '<h1>✅ Email funcionando correctamente</h1>',
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Email de prueba enviado a ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    return false;
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('✅ Conexión SMTP verificada');
    return true;
  } catch (error) {
    console.error('❌ Error verificando SMTP:', error);
    return false;
  }
}
