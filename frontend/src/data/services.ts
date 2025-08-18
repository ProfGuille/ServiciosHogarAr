// Service data with ALL images from Recomendame project
// Images sourced from ProfGuille/Recomendame-proyectoCursoFullstack
// Complete implementation with all services

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
    id: 'electricidad',
    name: 'Electricidad',
    image: '/images/services/electricista.jpg',
    description: 'Instalaciones eléctricas, reparaciones y mantenimiento',
    category: 'construccion'
  },
  {
    id: 'plomeria',
    name: 'Plomería',
    image: '/images/services/plomero.jpg',
    description: 'Reparaciones, instalaciones y mantenimiento de plomería',
    category: 'construccion'
  },
  {
    id: 'pintura',
    name: 'Pintura',
    image: '/images/services/pintor.jpg',
    description: 'Pintura interior, exterior y trabajos especializados',
    category: 'construccion'
  },
  {
    id: 'albanileria',
    name: 'Albañilería',
    image: '/images/services/albanil.jpg',
    description: 'Construcción, reparaciones y trabajos en mampostería',
    category: 'construccion'
  },
  {
    id: 'carpinteria',
    name: 'Carpintería',
    image: '/images/services/carpintero.jpg',
    description: 'Muebles a medida, reparaciones y trabajos en madera',
    category: 'construccion'
  },
  {
    id: 'gasista',
    name: 'Gasista',
    image: '/images/services/gasista.jpg',
    description: 'Instalación y reparación de gas natural y envasado',
    category: 'construccion'
  },
  {
    id: 'herrero',
    name: 'Herrero',
    image: '/images/services/herrero.jpg',
    description: 'Trabajos en hierro y metal',
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
    description: 'Instalación, reparación y mantenimiento de AC',
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
    id: 'limpieza',
    name: 'Limpieza',
    image: '/images/services/limpieza_general.jpg',
    description: 'Servicios de limpieza residencial y comercial',
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
    id: 'jardineria',
    name: 'Jardinería',
    image: '/images/services/jardinero.jpg',
    description: 'Mantenimiento de jardines y espacios verdes',
    category: 'jardin'
  },
  
  // Seguridad y Servicios
  {
    id: 'cerrajeria',
    name: 'Cerrajería',
    image: '/images/services/cerrajero.jpg',
    description: 'Cerraduras, llaves y sistemas de seguridad',
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
    id: 'mudanzas',
    name: 'Mudanzas',
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

  // Servicios adicionales
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
    description: 'Reparación y mantenimiento de computadoras',
    category: 'tecnologia'
  },
  {
    id: 'tapicero',
    name: 'Tapicero',
    image: '/images/services/tapicero.jpg',
    description: 'Tapicería y reparación de muebles',
    category: 'hogar'
  },
  {
    id: 'pequenos_arreglos',
    name: 'Pequeños Arreglos',
    image: '/images/services/pequenos_arreglos.jpg',
    description: 'Arreglos menores del hogar',
    category: 'construccion'
  }
];

export const getServicesByCategory = (category: string): Service[] => {
  return servicesList.filter(service => service.category === category);
};

export const getServiceById = (id: string): Service | undefined => {
  return servicesList.find(service => service.id === id);
};
