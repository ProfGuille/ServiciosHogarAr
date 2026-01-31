import { db } from '../db.js';
import { providerCategories, serviceProviders, users } from '../shared/schema/index.js';
import { eq } from 'drizzle-orm';
import { sendLeadNotificationViaResend } from './resendEmailService.js';

interface NewLeadData {
  id: number;
  title: string;
  description: string;
  neighborhood: string;
  categoryId: number;
  categoryName: string;
  createdAt: Date;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'administrador@servicioshogar.com.ar';

async function notifyAdminNoCategoryProviders(leadData: NewLeadData): Promise<void> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
            h1 { margin: 0; font-size: 24px; }
            .alert-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .lead-info { background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Sin Proveedores en Categoría</h1>
            </div>
            
            <div class="alert-box">
              <p><strong>¡Oportunidad de negocio!</strong></p>
              <p>Se recibió una solicitud pero no hay proveedores registrados para esta categoría.</p>
            </div>
            
            <div class="lead-info">
              <h2>Lead #${leadData.id} - ${leadData.categoryName}</h2>
              <p><strong>Título:</strong> ${leadData.title}</p>
              <p><strong>Descripción:</strong> ${leadData.description.substring(0, 200)}${leadData.description.length > 200 ? '...' : ''}</p>
              <p><strong>Zona:</strong> ${leadData.neighborhood}</p>
              <p><strong>Fecha:</strong> ${new Date(leadData.createdAt).toLocaleString('es-AR')}</p>
            </div>
            
            <p><strong>Acción requerida:</strong> Considera reclutar proveedores para la categoría "${leadData.categoryName}".</p>
            
            <div class="footer">
              <p>ServiciosHogar.com.ar - Panel de Administración</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendLeadNotificationViaResend(
      ADMIN_EMAIL,
      'Administrador',
      {
        id: leadData.id,
        title: `⚠️ Sin proveedores: ${leadData.categoryName}`,
        descriptionPreview: leadData.description.substring(0, 100),
        neighborhood: leadData.neighborhood,
        categoryName: leadData.categoryName,
        createdAt: leadData.createdAt,
      }
    );

    console.log(`📧 Notificación enviada al admin: Sin proveedores para ${leadData.categoryName}`);
  } catch (error) {
    console.error('❌ Error notificando al admin:', error);
  }
}

async function notifyAdminEmailFailure(leadData: NewLeadData, failedProviders: string[]): Promise<void> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
            h1 { margin: 0; font-size: 24px; }
            .alert-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .lead-info { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Fallo en Envío de Emails</h1>
            </div>
            
            <div class="alert-box">
              <p><strong>¡Problema técnico!</strong></p>
              <p>No se pudo enviar notificaciones a algunos proveedores.</p>
            </div>
            
            <div class="lead-info">
              <h2>Lead #${leadData.id} - ${leadData.categoryName}</h2>
              <p><strong>Proveedores afectados:</strong></p>
              <ul>
                ${failedProviders.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
            
            <p><strong>Acción requerida:</strong> Verificar configuración de emails o contactar manualmente a los proveedores.</p>
            
            <div class="footer">
              <p>ServiciosHogar.com.ar - Panel de Administración</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendLeadNotificationViaResend(
      ADMIN_EMAIL,
      'Administrador',
      {
        id: leadData.id,
        title: `⚠️ Error enviando emails: ${leadData.categoryName}`,
        descriptionPreview: `Falló el envío a: ${failedProviders.join(', ')}`,
        neighborhood: leadData.neighborhood,
        categoryName: leadData.categoryName,
        createdAt: leadData.createdAt,
      }
    );

    console.log(`📧 Notificación enviada al admin: Error en envío de emails`);
  } catch (error) {
    console.error('❌ Error notificando al admin sobre fallo de emails:', error);
  }
}

export async function notifyProvidersAboutNewLead(leadData: NewLeadData): Promise<void> {
  try {
    console.log(`📧 Nuevo lead #${leadData.id} - ${leadData.categoryName}`);
    
    const providersInCategory = await db
      .select({
        providerId: serviceProviders.id,
        businessName: serviceProviders.businessName,
        userId: serviceProviders.userId,
        email: users.email,
        isActive: serviceProviders.isActive,
      })
      .from(providerCategories)
      .innerJoin(serviceProviders, eq(providerCategories.providerId, serviceProviders.id))
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(providerCategories.categoryId, leadData.categoryId));

    console.log(`🔍 Encontrados ${providersInCategory.length} proveedores para categoría ${leadData.categoryName}`);

    // ⚠️ CASO CRÍTICO 1: Sin proveedores en categoría
    if (providersInCategory.length === 0) {
      console.log(`⚠️  No hay proveedores registrados para la categoría ${leadData.categoryName}`);
      await notifyAdminNoCategoryProviders(leadData);
      return;
    }

    const validProviders = providersInCategory.filter(
      (p) => p.isActive && p.email && p.email.trim() !== ''
    );

    console.log(`✅ ${validProviders.length} proveedores activos con email válido`);

    if (validProviders.length === 0) {
      console.log(`⚠️  No hay proveedores activos con email para notificar`);
      return;
    }

    const descriptionPreview = leadData.description.length > 100
      ? leadData.description.substring(0, 100) + '...'
      : leadData.description;

    const notificationPromises = validProviders.map(async (provider) => {
      try {
        const sent = await sendLeadNotificationViaResend(
          provider.email!,
          provider.businessName || 'Proveedor',
          {
            id: leadData.id,
            title: leadData.title,
            descriptionPreview,
            neighborhood: leadData.neighborhood,
            categoryName: leadData.categoryName,
            createdAt: leadData.createdAt,
          }
        );

        if (sent) {
          console.log(`✅ Email enviado a ${provider.businessName} (${provider.email})`);
          return { provider: provider.businessName, email: provider.email, success: true };
        } else {
          console.log(`❌ Error enviando a ${provider.businessName} (${provider.email})`);
          return { provider: provider.businessName, email: provider.email, success: false };
        }
      } catch (error) {
        console.error(`❌ Error enviando a ${provider.businessName}:`, error);
        return { provider: provider.businessName, email: provider.email, success: false, error };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    
    console.log(`📊 Resultado: ${successful}/${validProviders.length} emails enviados correctamente`);

    // ⚠️ CASO CRÍTICO 2: Fallos en envío de emails
    const failed = results.filter(
      (r) => r.status === 'fulfilled' && !r.value.success
    );

    if (failed.length > 0) {
      const failedProviders = failed.map(r => 
        r.status === 'fulfilled' ? `${r.value.provider} (${r.value.email})` : 'Unknown'
      );
      console.log(`⚠️  ${failed.length} emails fallaron, notificando al admin`);
      await notifyAdminEmailFailure(leadData, failedProviders);
    }

  } catch (error) {
    console.error('❌ Error crítico en sistema de notificaciones:', error);
  }
}
