import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotificationViaResend(
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
              <p>📝 Descripción: ${leadData.descriptionPreview}</p>
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

    console.log(`📤 Enviando email vía Resend a ${providerEmail}...`);

    const { data, error } = await resend.emails.send({
      from: 'ServiciosHogar <administrador@servicioshogar.com.ar>',
      to: providerEmail,
      subject: `Nuevo lead disponible - ${leadData.categoryName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error Resend API:', error);
      return false;
    }

    console.log(`✅ Email enviado vía Resend a ${providerEmail}. ID:`, data?.id);
    return true;
  } catch (error: any) {
    console.error('❌ Error enviando email vía Resend:', error);
    return false;
  }
}
