/**
 * Mapeo de categorías a imágenes
 * Las claves deben coincidir con los nombres de categorías en la BD
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  // Categorías principales con imágenes existentes
  'Plomería': '/images/services/plomeria.jpg',
  'Electricidad': '/images/services/electricidad.jpg',
  'Pintura': '/images/services/pintura.jpg',
  'Limpieza': '/images/services/limpieza.jpg',
  'Carpintería': '/images/services/carpintero.jpg',
  'Albañilería': '/images/services/albanil.jpg',
  'Gasista': '/images/services/fumigador.jpg', // TODO: conseguir imagen gasista
  'Cerrajería': '/images/services/pequenos_arreglos.jpg', // TODO: conseguir imagen cerrajero
  'Jardinería': '/images/services/jardineria.jpg',
  'Mudanzas': '/images/services/pequenos_arreglos.jpg', // TODO: conseguir imagen mudanzas
  
  // Aire y climatización
  'Aire Acondicionado': '/images/services/aire_acondicionado.jpg',
  'Calefacción': '/images/services/aire_acondicionado.jpg', // Reutilizar hasta conseguir imagen
  
  // Especialidades
  'Herrería': '/images/services/herrero.jpg',
  'Vidriería': '/images/services/pequenos_arreglos.jpg', // TODO: conseguir imagen vidriero
  'Techos': '/images/services/pequenos_arreglos.jpg', // TODO: conseguir imagen techos
  'Pisos y Revestimientos': '/images/services/pequenos_arreglos.jpg', // TODO
  
  // Servicios técnicos
  'Fumigación': '/images/services/fumigador.jpg',
  'Tapicería': '/images/services/tapicero.jpg',
  'Electrodomésticos': '/images/services/reparacion_electrodomesticos.jpg',
  
  // Seguridad y tecnología
  'Alarmas y Seguridad': '/images/services/pequenos_arreglos.jpg', // TODO
  'Piscinas': '/images/services/pequenos_arreglos.jpg', // TODO
  
  // Construcción especializada
  'Decoración': '/images/services/pintura.jpg', // Reutilizar
  'Durlock': '/images/services/albanil.jpg', // Reutilizar
  'Automatización': '/images/services/tecnico_pc.jpg', // Reutilizar
  'Energía Solar': '/images/services/pequenos_arreglos.jpg', // TODO
};

/**
 * Imagen por defecto si no hay mapeo
 */
export const DEFAULT_CATEGORY_IMAGE = '/images/services/pequenos_arreglos.jpg';

/**
 * Obtiene la imagen para una categoría
 */
export function getCategoryImage(categoryName: string): string {
  return CATEGORY_IMAGES[categoryName] || DEFAULT_CATEGORY_IMAGE;
}
