import { Router } from 'express';
import { db } from "../db.js";
import { users } from "../shared/schema/index.js";
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.select().from(users).limit(10);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registration endpoint with legal compliance
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      termsAccepted,
      privacyAccepted,
      legalDisclaimerAccepted,
      dataProcessingConsent,
      marketingConsent
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, email y contraseña son obligatorios' 
      });
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ 
        error: 'Email no válido' 
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ 
        error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número' 
      });
    }

    // Legal compliance validation
    if (!termsAccepted || !privacyAccepted || !legalDisclaimerAccepted || !dataProcessingConsent) {
      return res.status(400).json({ 
        error: 'Debe aceptar todos los términos legales obligatorios' 
      });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe un usuario con este email' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with legal compliance data
    const newUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      legalDisclaimerAcceptedAt: new Date(),
      dataProcessingConsent,
      marketingConsent: marketingConsent || false,
      createdAt: new Date()
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      termsAcceptedAt: users.termsAcceptedAt,
      privacyPolicyAcceptedAt: users.privacyPolicyAcceptedAt,
      legalDisclaimerAcceptedAt: users.legalDisclaimerAcceptedAt,
      dataProcessingConsent: users.dataProcessingConsent,
      marketingConsent: users.marketingConsent
    });

    // Log for legal audit trail
    console.log('New user registered with legal compliance:', {
      userId: newUser[0].id,
      email: newUser[0].email,
      acceptedAt: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      legalAcceptances: {
        terms: termsAccepted,
        privacy: privacyAccepted,
        legalDisclaimer: legalDisclaimerAccepted,
        dataProcessing: dataProcessingConsent,
        marketing: marketingConsent
      }
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ARCO Rights endpoint (Access, Rectification, Cancellation, Opposition - Ley 25.326)
router.get('/legal-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, you'd verify the user's identity here
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      termsAcceptedAt: users.termsAcceptedAt,
      privacyPolicyAcceptedAt: users.privacyPolicyAcceptedAt,
      legalDisclaimerAcceptedAt: users.legalDisclaimerAcceptedAt,
      dataProcessingConsent: users.dataProcessingConsent,
      marketingConsent: users.marketingConsent
    }).from(users).where(eq(users.id, parseInt(userId)));

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Datos personales y consentimientos según Ley 25.326',
      personalData: user[0],
      legalRights: {
        access: 'Derecho de acceso a datos personales',
        rectification: 'Derecho de rectificación de datos erróneos',
        cancellation: 'Derecho de supresión/cancelación de datos',
        opposition: 'Derecho de oposición al tratamiento'
      },
      contact: 'privacidad@servicioshogar.com.ar'
    });

  } catch (error) {
    console.error('Error al obtener datos legales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Marketing consent update endpoint
router.put('/marketing-consent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { marketingConsent } = req.body;
    
    await db.update(users)
      .set({ marketingConsent })
      .where(eq(users.id, parseInt(userId)));

    // Log consent change for audit
    console.log('Marketing consent updated:', {
      userId,
      newConsent: marketingConsent,
      updatedAt: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({ 
      message: `Consentimiento de marketing ${marketingConsent ? 'otorgado' : 'retirado'} exitosamente` 
    });

  } catch (error) {
    console.error('Error al actualizar consentimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

