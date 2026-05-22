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
            <p style="font-size:14px;color:#555">Para ver los datos completos y desbloquear el contacto del cliente, ingresá a tu dashboard:</p>
            <center>
              <a href="https://servicioshogar.com.ar/login?redirect=/dashboard-profesional" class="cta-button">
                Ver solicitud y desbloquear datos
              </a>
            </center>
            <p style="font-size:12px;color:#999;text-align:center">Este lead estará disponible mientras tenga estado pendiente. Los primeros en desbloquear tienen ventaja.</p>
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

export async function sendAdminVerificationNotificationEmail(
  providerName: string,
  documentType: string,
  documentNumber: string,
  personType: string
): Promise<void> {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ServiciosHogar <administrador@servicioshogar.com.ar>",
      to: ["administrador@servicioshogar.com.ar"],
      subject: "Nueva solicitud de verificación de identidad",
      html: `
        <h2>Nueva solicitud de verificación</h2>
        <p><strong>Proveedor:</strong> ${providerName}</p>
        <p><strong>Tipo de persona:</strong> ${personType === "fisica" ? "Persona física" : "Persona jurídica"}</p>
        <p><strong>Documento:</strong> ${documentType} ${documentNumber}</p>
        <p>Ingresá al panel de administración para aprobar o rechazar la solicitud:</p>
        <a href="https://servicioshogar.com.ar/admin" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
          Ver en panel admin
        </a>
      `,
    }),
  });
}

export async function sendContactFormEmail(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
): Promise<void> {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ServiciosHogar <administrador@servicioshogar.com.ar>",
      to: ["administrador@servicioshogar.com.ar"],
      subject: `Contacto: ${subject || "Sin asunto"}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || "No proporcionado"}</p>
        <p><strong>Asunto:</strong> ${subject || "Sin asunto"}</p>
        <hr/>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    }),
  });
}


export async function sendCustomerWelcomeEmail(
  toEmail: string,
  firstName: string
): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiciosHogar <administrador@servicioshogar.com.ar>',
      to: toEmail,
      subject: '¡Bienvenido a ServiciosHogar! 🏠',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1d4ed8">¡Hola ${firstName}, bienvenido a ServiciosHogar!</h2>
          <p>Tu cuenta fue creada con éxito. Ya podés publicar solicitudes de servicio y conectarte con profesionales de confianza en tu zona.</p>
          <p>Es completamente gratis para vos como cliente.</p>
          <a href="https://servicioshogar.com.ar/nueva-solicitud" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
            Publicar mi primera solicitud
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px">ServiciosHogar.com.ar</p>
        </div>
      `,
    });
    if (error) console.error('❌ Error Resend customer welcome:', error);
    else console.log('✅ Email bienvenida cliente enviado a', toEmail, '| ID:', data?.id);
  } catch (err) {
    console.error('❌ Error enviando email bienvenida cliente:', err);
  }
}

export async function sendProviderWelcomeEmail(
  toEmail: string,
  firstName: string,
  businessName: string,
  firstInProvince?: string
): Promise<void> {
  const bonusBlock = firstInProvince ? `
    <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0;font-weight:bold;color:#854d0e">🏆 ¡Sos el primer profesional de ${firstInProvince} en ServiciosHogar!</p>
      <p style="margin:8px 0 0;color:#713f12;font-size:14px">Te acreditamos <strong>5 créditos extra</strong> como reconocimiento. Tenés <strong>15 créditos</strong> para arrancar.</p>
    </div>` : '';
  const subject = firstInProvince
    ? `¡Sos el primer profesional de ${firstInProvince} en ServiciosHogar! 🏆`
    : '¡Bienvenido a ServiciosHogar! Tus 10 créditos te esperan 🎉';
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiciosHogar <administrador@servicioshogar.com.ar>',
      to: toEmail,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1d4ed8">¡Hola ${firstName}, bienvenido a ServiciosHogar!</h2>
          <p>Tu cuenta profesional para <strong>${businessName}</strong> fue creada con éxito.</p>
          ${bonusBlock}
          <p>Te regalamos <strong>${firstInProvince ? '15' : '10'} créditos</strong> para que puedas ver los datos de contacto de tus primeros clientes sin costo.</p>
          <p>Cada crédito te permite desbloquear los datos de una solicitud. Revisá las solicitudes disponibles en tu zona desde tu dashboard.</p>
          <a href="https://servicioshogar.com.ar/login?redirect=/dashboard-profesional" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
            Ver solicitudes disponibles
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px">ServiciosHogar.com.ar</p>
        </div>
      `,
    });
    if (error) console.error('❌ Error Resend provider welcome:', error);
    else console.log('✅ Email bienvenida proveedor enviado a', toEmail, '| ID:', data?.id);
  } catch (err) {
    console.error('❌ Error enviando email bienvenida proveedor:', err);
  }
}



export async function sendAdminInvalidRequestEmail(
  providerName: string,
  requestTitle: string,
  requestId: number
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'administrador@servicioshogar.com.ar';
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ServiciosHogar <administrador@servicioshogar.com.ar>",
      to: [adminEmail],
      subject: `❌ Solicitud inválida reportada — #${requestId}`,
      html: `
        <h2>Solicitud marcada como inválida</h2>
        <p><strong>Proveedor:</strong> ${providerName}</p>
        <p><strong>Solicitud:</strong> #${requestId} — ${requestTitle}</p>
        <p>El proveedor marcó esta solicitud como <strong>❌ Inválida</strong>. Verificar si corresponde devolver créditos.</p>
        <a href="https://servicioshogar.com.ar/admin" style="background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
          Ver en panel admin
        </a>
      `,
    }),
  });
}

export async function sendAdminStalePendingRequestsEmail(requests: Array<{
  id: number; title: string; city: string; province: string;
  isUrgent: boolean; createdAt: string;
}>) {
  const rows = requests.map(r =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">#${r.id}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${r.title}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${r.city}, ${r.province}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${r.isUrgent ? "🚨 URGENTE" : "Normal"}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0">${new Date(r.createdAt).toLocaleDateString("es-AR")}</td>
    </tr>`
  ).join("");

  const html = `<div style="font-family:sans-serif;max-width:620px;margin:0 auto">
    <h2 style="color:#dc2626">⚠️ Solicitudes sin respuesta — Seguimiento requerido</h2>
    <p>Las siguientes solicitudes llevan más de 24hs (normales) o 12hs (urgentes) sin que ningún proveedor las haya desbloqueado:</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead><tr style="background:#f1f5f9">
        <th style="padding:8px;text-align:left">ID</th>
        <th style="padding:8px;text-align:left">Solicitud</th>
        <th style="padding:8px;text-align:left">Ubicación</th>
        <th style="padding:8px;text-align:left">Tipo</th>
        <th style="padding:8px;text-align:left">Fecha</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:24px">
      <p><strong>Acciones sugeridas:</strong></p>
      <ul>
        <li>Verificar si hay proveedores disponibles para esas categorías</li>
        <li>Evaluar si corresponde desactivar la categoría por falta de cobertura</li>
        <li>Contactar al cliente para informar la demora</li>
      </ul>
      <a href="https://servicioshogar.com.ar/admin" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">Ver en panel admin</a>
    </div>
  </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "ServiciosHogar <administrador@servicioshogar.com.ar>",
      to: ["administrador@servicioshogar.com.ar"],
      subject: `⚠️ ${requests.length} solicitud${requests.length !== 1 ? "es" : ""} sin respuesta — Acción requerida`,
      html
    })
  });
}

export async function sendClientUnlockNotificationEmail(
  toEmail: string,
  firstName: string,
  requestTitle: string,
  neighborhood: string,
  preferredContactMethods?: string[] | null,
  telegramUsername?: string | null
): Promise<void> {
  const methods: string[] = Array.isArray(preferredContactMethods) && preferredContactMethods.length > 0
    ? preferredContactMethods
    : ['phone', 'email'];
  const methodLabels: Record<string, string> = { phone: 'teléfono', email: 'email', whatsapp: 'WhatsApp', telegram: 'Telegram' };
  const methodList = methods.map(m => methodLabels[m] || m).join(', ');
  const telegramNote = methods.includes('telegram') && telegramUsername
    ? `<p style="color:#374151;font-size:14px">Tu usuario de Telegram: <strong>@${telegramUsername}</strong></p>`
    : '';
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiciosHogar <administrador@servicioshogar.com.ar>',
      to: toEmail,
      subject: '¡Un profesional está interesado en tu solicitud! 🔔',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1d4ed8">¡Hola ${firstName}!</h2>
          <p>Un profesional de tu zona vio tu solicitud <strong>"${requestTitle}"</strong> en ${neighborhood} y desbloqueó tus datos de contacto para poder comunicarse con vos.</p>
          <p>Te va a contactar por <strong>${methodList}</strong> en las próximas horas.</p>
          ${telegramNote}
          <p style="color:#6b7280;font-size:14px">Si recibís su llamado o mensaje, recordá calificarlo después del servicio. Las reseñas ayudan a otros clientes a elegir mejor.</p>
          <a href="https://servicioshogar.com.ar/login?redirect=/mis-solicitudes" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
            Ver mis solicitudes
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px">ServiciosHogar.com.ar — Este email fue enviado porque tenés una solicitud activa.</p>
        </div>
      `,
    });
    if (error) console.error('❌ Error Resend unlock notification:', error);
    else console.log('✅ Email unlock enviado a cliente', toEmail, '| ID:', data?.id);
  } catch (err) {
    console.error('❌ Error enviando email unlock al cliente:', err);
  }
}

export async function sendClientReviewReminderEmail(
  toEmail: string,
  firstName: string,
  requestTitle: string
): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiciosHogar <administrador@servicioshogar.com.ar>',
      to: toEmail,
      subject: '¿Cómo te fue con el profesional? Dejá tu reseña ⭐',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1d4ed8">¡Hola ${firstName}!</h2>
          <p>Hace unos días un profesional se contactó con vos por tu solicitud <strong>"${requestTitle}"</strong>.</p>
          <p>¿Pudieron concretar el servicio? Tu opinión ayuda a otros vecinos a elegir mejor.</p>
          <p>Solo te lleva un minuto calificar al profesional.</p>
          <a href="https://servicioshogar.com.ar/login?redirect=/mis-solicitudes" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
            Calificar al profesional
          </a>
          <p style="color:#6b7280;font-size:13px">Si todavía no concretaron el servicio, podés ignorar este mensaje.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px">ServiciosHogar.com.ar</p>
        </div>
      `,
    });
    if (error) console.error('❌ Error Resend review reminder:', error);
    else console.log('✅ Email recordatorio reseña enviado a', toEmail, '| ID:', data?.id);
  } catch (err) {
    console.error('❌ Error enviando recordatorio reseña:', err);
  }
}

