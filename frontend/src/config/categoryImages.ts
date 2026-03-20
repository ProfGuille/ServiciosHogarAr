export const CATEGORY_IMAGES: Record<string, string> = {
  'Plomería':               '/images/services/plomeria.jpg',
  'Electricidad':           '/images/services/electricidad.jpg',
  'Pintura':                '/images/services/pintura.jpg',
  'Limpieza':               '/images/services/limpieza.jpg',
  'Carpintería':            '/images/services/carpintero.jpg',
  'Albañilería':            '/images/services/albanil.jpg',
  'Gasista':                '/images/services/gasista.jpg',
  'Cerrajería':             '/images/services/cerrajero.jpg',
  'Jardinería':             '/images/services/jardineria.jpg',
  'Mudanzas':               '/images/services/mudanzas.jpg',
  'Aire Acondicionado':     '/images/services/aire_acondicionado.jpg',
  'Calefacción':            '/images/services/calefaccion.jpeg',
  'Herrería':               '/images/services/herrero.jpg',
  'Vidriería':              '/images/services/vidrieria.jpeg',
  'Techos':                 '/images/services/techista.jpg',
  'Pisos y Revestimientos': '/images/services/pisos.jpeg',
  'Fumigación':             '/images/services/fumigador.jpeg',
  'Tapicería':              '/images/services/tapiceria.jpeg',
  'Electrodomésticos':      '/images/services/reparacion_electrodomesticos.jpg',
  'Alarmas y Seguridad':    '/images/services/alarmas_seguridad.jpeg',
  'Piscinas':               '/images/services/mantenimiento_piscina.jpeg',
  'Decoración':             '/images/services/decorador_interiores.jpeg',
  'Durlock':                '/images/services/durlock.jpeg',
  'Automatización':         '/images/services/automatizacion.jpeg',
  'Energía Solar':          '/images/services/energia_solar.jpeg',
};

export const DEFAULT_CATEGORY_IMAGE = '/images/services/pequenos_arreglos.jpg';

export function getCategoryImage(categoryName: string): string {
  return CATEGORY_IMAGES[categoryName] ?? DEFAULT_CATEGORY_IMAGE;
}
