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
    
    // TODO: Implementar búsqueda real de proveedores por categoría
    // Por ahora, enviamos email de prueba al administrador
    
    const descriptionPreview = leadData.description.length > 100
      ? leadData.description.substring(0, 100)
      : leadData.description;

    const sent = await sendLeadNotification(
      'circaireargentino@gmail.com', // TODO: Reemplazar con búsqueda de proveedores reales
      'Administrador',
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
      console.log(`✅ Notificación de prueba enviada`);
    } else {
      console.log(`❌ Error enviando notificación`);
    }

  } catch (error) {
    console.error('❌ Error en notificaciones:', error);
  }
}
