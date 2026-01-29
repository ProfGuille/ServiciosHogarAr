import { Router, Request, Response } from 'express';
import { sendTestEmail, verifyEmailConnection, sendLeadNotification } from '../services/emailService.js';

const router = Router();

/**
 * GET /api/test-email
 * Envía un email de prueba para verificar configuración SMTP
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Email de destino (por defecto el administrador)
    const toEmail = (req.query.to as string) || 'administrador@servicioshogar.com.ar';

    console.log(`📧 Enviando email de prueba a: ${toEmail}`);

    // Verificar conexión SMTP primero
    const isConnected = await verifyEmailConnection();
    
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo conectar al servidor SMTP',
        details: 'Verifica las credenciales SMTP_USER y SMTP_PASS en las variables de entorno'
      });
    }

    // Enviar email de prueba
    const sent = await sendTestEmail(toEmail);

    if (sent) {
      return res.status(200).json({
        success: true,
        message: `Email de prueba enviado exitosamente a ${toEmail}`,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Error al enviar el email de prueba',
        details: 'Revisa los logs del servidor para más información'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint test-email:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/test-email/lead-notification
 * Envía un email de notificación de lead de prueba
 * 
 * Body: {
 *   providerEmail: string,
 *   providerName: string
 * }
 */
router.post('/lead-notification', async (req: Request, res: Response) => {
  try {
    const { providerEmail, providerName } = req.body;

    if (!providerEmail || !providerName) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos',
        details: 'Se requieren: providerEmail, providerName'
      });
    }

    console.log(`📧 Enviando notificación de lead de prueba a: ${providerEmail}`);

    // Datos de prueba de un lead
    const mockLeadData = {
      id: 999,
      title: 'Reparación de aire acondicionado',
      descriptionPreview: 'Necesito reparar mi aire acondicionado split que no enfría correctamente. El equipo tiene 3 años...',
      neighborhood: 'Palermo, CABA',
      categoryName: 'Climatización',
      createdAt: new Date()
    };

    const sent = await sendLeadNotification(
      providerEmail,
      providerName,
      mockLeadData
    );

    if (sent) {
      return res.status(200).json({
        success: true,
        message: `Notificación de lead de prueba enviada a ${providerEmail}`,
        leadData: mockLeadData,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Error al enviar la notificación de lead',
        details: 'Revisa los logs del servidor para más información'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint test-email/lead-notification:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/test-email/verify
 * Verifica la conexión SMTP sin enviar email
 */
router.get('/verify', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Verificando conexión SMTP...');

    const isConnected = await verifyEmailConnection();

    if (isConnected) {
      return res.status(200).json({
        success: true,
        message: 'Conexión SMTP verificada correctamente',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          hasPassword: !!process.env.SMTP_PASS
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'No se pudo verificar la conexión SMTP',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          hasPassword: !!process.env.SMTP_PASS
        }
      });
    }

  } catch (error) {
    console.error('❌ Error verificando SMTP:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error al verificar conexión SMTP',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
