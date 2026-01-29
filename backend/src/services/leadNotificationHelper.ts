import { db } from '../db.js';
import { providerCategories, serviceProviders, users } from '../shared/schema/index.js';
import { eq } from 'drizzle-orm';
import { sendLeadNotification } from './emailService.js';

interface NewLeadData {
  id: number;
  title: string;
  description: string;
  neighborhood: string;
  categoryId: number;
  categoryName: string;
  createdAt: Date;
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

    if (providersInCategory.length === 0) {
      console.log(`⚠️  No hay proveedores registrados para la categoría ${leadData.categoryName}`);
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
        const sent = await sendLeadNotification(
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
          return { provider: provider.businessName, success: true };
        } else {
          console.log(`❌ Error enviando a ${provider.businessName} (${provider.email})`);
          return { provider: provider.businessName, success: false };
        }
      } catch (error) {
        console.error(`❌ Error enviando a ${provider.businessName}:`, error);
        return { provider: provider.businessName, success: false, error };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    
    console.log(`📊 Resultado: ${successful}/${validProviders.length} emails enviados correctamente`);

  } catch (error) {
    console.error('❌ Error crítico en sistema de notificaciones:', error);
  }
}
