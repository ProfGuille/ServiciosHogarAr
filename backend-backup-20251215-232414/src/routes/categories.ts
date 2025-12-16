// src/routes/categories.ts
import { Router } from 'express';
import { db } from "../db.js";
import { categories } from "../shared/schema/categories.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Mock categories data when database is not available
    const mockCategories = [
      { id: 1, name: 'Plomería', description: 'Reparaciones, instalaciones y mantenimiento de plomería', isActive: true },
      { id: 2, name: 'Electricidad', description: 'Instalaciones eléctricas, reparaciones y mantenimiento', isActive: true },
      { id: 3, name: 'Limpieza', description: 'Servicios de limpieza residencial y comercial', isActive: true },
      { id: 4, name: 'Pintura', description: 'Pintura interior, exterior y trabajos especializados', isActive: true },
      { id: 5, name: 'Carpintería', description: 'Muebles a medida, reparaciones y trabajos en madera', isActive: true },
      { id: 6, name: 'Gasista', description: 'Instalación y reparación de gas natural y envasado', isActive: true },
      { id: 7, name: 'Albañilería', description: 'Construcción, reparaciones y trabajos en mampostería', isActive: true },
      { id: 8, name: 'Aire Acondicionado', description: 'Instalación, reparación y mantenimiento de AC', isActive: true },
      { id: 9, name: 'Jardinería', description: 'Mantenimiento de jardines y espacios verdes', isActive: true },
      { id: 10, name: 'Cerrajería', description: 'Cerraduras, llaves y sistemas de seguridad', isActive: true },
      { id: 11, name: 'Mudanzas', description: 'Servicios de mudanza y transporte', isActive: true },
      { id: 12, name: 'Herrero', description: 'Trabajos en hierro y metal', isActive: true },
      { id: 13, name: 'Techista', description: 'Reparación y mantenimiento de techos', isActive: true },
      { id: 14, name: 'Fumigador', description: 'Control de plagas y fumigación', isActive: true },
      { id: 15, name: 'Técnico PC', description: 'Reparación y mantenimiento de computadoras', isActive: true },
      { id: 16, name: 'Pequeños Arreglos', description: 'Arreglos menores del hogar', isActive: true },
      { id: 17, name: 'Tapicero', description: 'Tapicería y reparación de muebles', isActive: true }
    ];

    if (db) {
      try {
        const result = await db.select().from(categories);
        return res.json(result);
      } catch (dbError) {
        console.error('Database error in categories, falling back to mock data:', dbError);
        // Fall through to mock data
      }
    }

    // Return mock data when database is not available
    res.json(mockCategories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

