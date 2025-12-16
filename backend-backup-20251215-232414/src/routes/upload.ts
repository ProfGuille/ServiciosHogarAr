import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload single photo
router.post('/photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll return a local URL
    const photoUrl = `/uploads/photos/${req.file.filename}`;

    res.json({
      success: true,
      url: photoUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload multiple photos
router.post('/photos', upload.array('photos', 4), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const photoUrls = req.files.map(file => ({
      url: `/uploads/photos/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));

    res.json({
      success: true,
      photos: photoUrls
    });

  } catch (error) {
    console.error('Photos upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete photo
router.delete('/photo/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'photos', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Photo deleted' });
    } else {
      res.status(404).json({ error: 'Photo not found' });
    }

  } catch (error) {
    console.error('Photo deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;