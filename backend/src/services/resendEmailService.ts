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

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `https://servicioshogar.com.ar/reset-password?token=${resetToken}`;
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiciosHogar <administrador@servicioshogar.com.ar>',
      to: toEmail,
      subject: 'Recuperar contraseña — ServiciosHogar',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1d4ed8">Recuperar contraseña</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Hacé clic en el botón para crear una nueva contraseña. El link es válido por <strong>1 hora</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
            Restablecer contraseña
          </a>
          <p style="color:#6b7280;font-size:13px">Si no solicitaste esto, ignorá este email. Tu contraseña no cambiará.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px">ServiciosHogar.com.ar</p>
        </div>
      `,
    });
    if (error) console.error('❌ Error Resend password reset:', error);
    else console.log('✅ Email reset enviado a', toEmail, '| ID:', data?.id);
  } catch (err) {
    console.error('❌ Error enviando email reset:', err);
  }
}



export async function sendVerificationResultEmail(
  toEmail: string,
  providerName: string,
  status: "approved" | "rejected",
  adminNotes?: string
): Promise<void> {
  const isApproved = status === "approved";
  const subject = isApproved
    ? "✅ Tu verificación fue aprobada — ServiciosHogar"
    : "❌ Tu verificación fue rechazada — ServiciosHogar";
  const heading = isApproved
    ? "¡Tu identidad fue verificada!"
    : "Tu solicitud de verificación fue rechazada";
  const message = isApproved
    ? "Tu cuenta ahora muestra el distintivo de profesional verificado en ServiciosHogar. Esto aumenta la confianza de los clientes en tu perfil."
    : "Tu solicitud de verificación de identidad no pudo ser aprobada en esta oportunidad.";
  const notesHtml = adminNotes
    ? `<p style="margin-top:12px"><strong>Nota del equipo:</strong> ${adminNotes}</p>`
    : "";
  const actionHtml = isApproved
    ? ""
    : `<p style="margin-top:12px">Podés volver a enviar tu solicitud desde tu <a href="https://servicioshogar.com.ar/dashboard-profesional" style="color:#1d4ed8">dashboard profesional</a> corrigiendo los datos indicados.</p>`;
  try {
    const { data, error } = await resend.emails.send({
      from: "ServiciosHogar <administrador@servicioshogar.com.ar>",
      to: toEmail,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:${isApproved ? "#16a34a" : "#dc2626"}">${heading}</h2>
          <p>Hola ${providerName},</p>
          <p>${message}</p>
          ${notesHtml}
          ${actionHtml}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px">ServiciosHogar.com.ar</p>
        </div>
      `,
    });
    if (error) console.error("❌ Error Resend verification result:", error);
    else console.log("✅ Email verificación enviado a", toEmail, "| ID:", data?.id);
  } catch (err) {
    console.error("❌ Error enviando email verificación:", err);
  }
}
