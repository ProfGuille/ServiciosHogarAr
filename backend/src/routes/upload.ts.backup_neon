import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth.js';
import { neon } from '@neondatabase/serverless';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sql = neon(process.env.DATABASE_URL!);

// Multer en memoria — no guarda en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// POST /api/upload/profile-image — sube foto de perfil del proveedor
router.post('/profile-image', requireAuth, upload.single('photo'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

    // Subir a Cloudinary como stream desde buffer
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'servicioshogar/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    // Guardar URL en service_providers
    const userId = req.user.id;
    await sql`
      UPDATE service_providers
      SET profile_image_url = ${result.secure_url}, updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Error subiendo imagen de perfil:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

export default router;
