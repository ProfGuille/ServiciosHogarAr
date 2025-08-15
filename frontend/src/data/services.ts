// Service data with ALL images from Recomendame project
// Images sourced from ProfGuille/Recomendame-proyectoCursoFullstack
// Complete implementation with all 20 services from original project

interface Service {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}

export const servicesList: Service[] = [
  // Construcción y Reparaciones
  {
    id: 'electricista',
    name: 'Electricista',
    image: '/images/services/electricista.jpg',
    description: 'Instalación y reparación eléctrica',
    category: 'construccion'
  },
  {
    id: 'plomero',
    name: 'Plomero',
    image: '/images/services/plomero.jpg',
    description: 'Plomería y sanitarios',
    category: 'construccion'
  },
  {
    id: 'pintor',
    name: 'Pintor',
    image: '/images/services/pintor.jpg',
    description: 'Pintura de interiores y exteriores',
    category: 'construccion'
  },
  {
    id: 'albanil',
    name: 'Albañil',
    image: '/images/services/albanil.jpg',
    description: 'Construcción y refacciones',
    category: 'construccion'
  },
  {
    id: 'carpintero',
    name: 'Carpintero',
    image: '/images/services/carpintero.jpg',
    description: 'Trabajos en madera y muebles',
    category: 'construccion'
  },
  {
    id: 'gasista',
    name: 'Gasista',
    image: '/images/services/gasista.jpg',
    description: 'Instalación y reparación de gas',
    category: 'construccion'
  },
  {
    id: 'herrero',
    name: 'Herrero',
    image: '/images/services/herrero.jpg',
    description: 'Trabajos en metal y soldadura',
    category: 'construccion'
  },
  {
    id: 'techista',
    name: 'Techista',
    image: '/images/services/techista.jpg',
    description: 'Reparación y mantenimiento de techos',
    category: 'construccion'
  },
  {
    id: 'plastificador',
    name: 'Plastificador',
    image: '/images/services/plastificador.jpg',
    description: 'Plastificado y pulido de pisos',
    category: 'construccion'
  },
  
  // Hogar y Electrodomésticos
  {
    id: 'aire_acondicionado',
    name: 'Aire Acondicionado',
    image: '/images/services/aire_acondicionado.jpg',
    description: 'Instalación y service de AA',
    category: 'hogar'
  },
  {
    id: 'heladeras',
    name: 'Reparación de Heladeras',
    image: '/images/services/heladeras.jpg',
    description: 'Reparación de heladeras y freezers',
    category: 'hogar'
  },
  {
    id: 'reparacion_electrodomesticos',
    name: 'Reparación de Electrodomésticos',
    image: '/images/services/reparacion_electrodomesticos.jpg',
    description: 'Reparación de lavarropas, microondas y más',
    category: 'hogar'
  },
  {
    id: 'destapacanerias',
    name: 'Destapacañerías',
    image: '/images/services/destapacanerias.jpg',
    description: 'Destapado de cañerías y desagües',
    category: 'hogar'
  },
  
  // Limpieza y Mantenimiento
  {
    id: 'limpieza_general',
    name: 'Limpieza General',
    image: '/images/services/limpieza_general.jpg',
    description: 'Limpieza profunda de hogares y oficinas',
    category: 'limpieza'
  },
  {
    id: 'limpieza_alfombras',
    name: 'Limpieza de Alfombras',
    image: '/images/services/limpieza_alfombras.jpg',
    description: 'Limpieza de alfombras y tapizados',
    category: 'limpieza'
  },
  {
    id: 'jardinero',
    name: 'Jardinero y Paisajista',
    image: '/images/services/jardinero.jpg',
    description: 'Mantenimiento de jardines y paisajismo',
    category: 'jardin'
  },
  
  // Seguridad y Servicios
  {
    id: 'cerrajero',
    name: 'Cerrajero',
    image: '/images/services/cerrajero.jpg',
    description: 'Cerraduras y seguridad',
    category: 'seguridad'
  },
  {
    id: 'seguridad_alarmas',
    name: 'Seguridad y Alarmas',
    image: '/images/services/seguridad_alarmas.jpg',
    description: 'Instalación de sistemas de seguridad',
    category: 'seguridad'
  },
  {
    id: 'mudanzas_fletes',
    name: 'Mudanzas y Fletes',
    image: '/images/services/mudanzas_fletes.jpg',
    description: 'Servicios de mudanza y transporte',
    category: 'transporte'
  },
  {
    id: 'cuidado_adultos',
    name: 'Cuidado de Adultos',
    image: '/images/services/cuidado_adultos.jpg',
    description: 'Cuidado y asistencia de adultos mayores',
    category: 'cuidados'
  },
  
  // Additional services mentioned by users
  {
    id: 'fumigador',
    name: 'Fumigador',
    image: '/images/services/fumigador.jpg',
    description: 'Control de plagas y fumigación',
    category: 'hogar'
  },
  {
    id: 'tecnico_pc',
    name: 'Técnico PC',
    image: '/images/services/tecnico_pc.jpg',
    description: 'Reparación y soporte de computadoras',
    category: 'tecnologia'
  },
  {
    id: 'tapicero',
    name: 'Tapicero',
    image: '/images/services/tapicero.jpg',
    description: 'Retapizado y restauración de muebles',
    category: 'hogar'
  },
  {
    id: 'pequenos_arreglos',
    name: 'Pequeños Arreglos',
    image: '/images/services/pequenos_arreglos.jpg',
    description: 'Arreglos menores y mantenimiento general del hogar',
    category: 'construccion'
  }
];

export const getServicesByCategory = (category: string): Service[] => {
  return servicesList.filter(service => service.category === category);
};

export const getServiceById = (id: string): Service | undefined => {
  return servicesList.find(service => service.id === id);
};