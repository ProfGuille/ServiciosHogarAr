import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

router.get('/test-smtp-connection', async (req, res) => {
  try {
    console.log('🔍 Testing SMTP connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true,
      logger: true,
    });

    console.log('📧 Verificando conexión SMTP...');
    await transporter.verify();
    
    console.log('✅ Conexión SMTP exitosa');
    
    res.json({
      success: true,
      message: 'Conexión SMTP exitosa',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
      }
    });
  } catch (error: any) {
    console.error('❌ Error SMTP:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
      }
    });
  }
});

export default router;
