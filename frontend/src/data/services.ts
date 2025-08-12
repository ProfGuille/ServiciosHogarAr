// Service data with images from Recomendame project
// Images sourced from ProfGuille/Recomendame-proyectoCursoFullstack

interface Service {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}

export const servicesList: Service[] = [
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
    category: 'hogar'
  },
  {
    id: 'aire_acondicionado',
    name: 'Aire Acondicionado',
    image: '/images/services/aire_acondicionado.jpg',
    description: 'Instalación y service de AA',
    category: 'hogar'
  },
  {
    id: 'cerrajero',
    name: 'Cerrajero',
    image: '/images/services/cerrajero.jpg',
    description: 'Cerraduras y seguridad',
    category: 'seguridad'
  }
];

export const getServicesByCategory = (category: string): Service[] => {
  return servicesList.filter(service => service.category === category);
};

export const getServiceById = (id: string): Service | undefined => {
  return servicesList.find(service => service.id === id);
};