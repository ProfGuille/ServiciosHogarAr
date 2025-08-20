// Fallback provider data for when backend is unavailable
// This ensures the application remains functional even when the API is down

export interface FallbackProvider {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  totalReviews: number;
  hourlyRate: string;
  city: string;
  province: string;
  experienceYears: number;
  isVerified: boolean;
  profileImageUrl?: string;
  categories: Array<{ id: number; name: string }>;
  hasCredits: boolean;
  avgResponseTime: number;
  completedJobs: number;
  distance?: number;
  phone?: string;
  email?: string;
}

export const fallbackProviders: FallbackProvider[] = [
  {
    id: 1,
    businessName: "Plomería Express Buenos Aires",
    description: "Especialistas en reparaciones urgentes de plomería. Servicio 24/7 en CABA y GBA.",
    rating: "4.8",
    totalReviews: 127,
    hourlyRate: "$3,500",
    city: "Buenos Aires",
    province: "CABA",
    experienceYears: 8,
    isVerified: true,
    categories: [{ id: 1, name: "Plomería" }],
    hasCredits: true,
    avgResponseTime: 45,
    completedJobs: 340,
    phone: "11-4567-8901",
    email: "contacto@plomeriaexpress.com.ar"
  },
  {
    id: 2,
    businessName: "Electricistas Profesionales",
    description: "Instalaciones eléctricas residenciales y comerciales. Certificados por ENIC.",
    rating: "4.9",
    totalReviews: 89,
    hourlyRate: "$4,200",
    city: "La Plata",
    province: "Buenos Aires",
    experienceYears: 12,
    isVerified: true,
    categories: [{ id: 2, name: "Electricidad" }],
    hasCredits: true,
    avgResponseTime: 30,
    completedJobs: 275,
    phone: "221-456-7890",
    email: "info@electricistasprofesionales.com.ar"
  },
  {
    id: 3,
    businessName: "Pintura y Decoración Martínez",
    description: "Pintura interior y exterior. Especialistas en técnicas decorativas y revestimientos.",
    rating: "4.7",
    totalReviews: 156,
    hourlyRate: "$2,800",
    city: "Córdoba",
    province: "Córdoba",
    experienceYears: 15,
    isVerified: true,
    categories: [{ id: 3, name: "Pintura" }],
    hasCredits: false,
    avgResponseTime: 60,
    completedJobs: 420,
    phone: "351-789-0123",
    email: "contacto@pinturamartinez.com.ar"
  },
  {
    id: 4,
    businessName: "Limpieza Integral del Hogar",
    description: "Servicios de limpieza profunda para hogares y oficinas. Personal capacitado y asegurado.",
    rating: "4.6",
    totalReviews: 203,
    hourlyRate: "$2,200",
    city: "Rosario",
    province: "Santa Fe",
    experienceYears: 6,
    isVerified: true,
    categories: [{ id: 4, name: "Limpieza" }],
    hasCredits: true,
    avgResponseTime: 120,
    completedJobs: 580,
    phone: "341-234-5678",
    email: "servicios@limpiezaintegral.com.ar"
  },
  {
    id: 5,
    businessName: "Carpintería San Juan",
    description: "Muebles a medida y reparaciones en madera. Trabajos de alta calidad con garantía.",
    rating: "4.8",
    totalReviews: 94,
    hourlyRate: "$3,800",
    city: "Mendoza",
    province: "Mendoza",
    experienceYears: 20,
    isVerified: true,
    categories: [{ id: 5, name: "Carpintería" }],
    hasCredits: false,
    avgResponseTime: 180,
    completedJobs: 150,
    phone: "261-345-6789",
    email: "pedidos@carpinteriasanjuan.com.ar"
  },
  {
    id: 6,
    businessName: "Gasista Matriculado Norte",
    description: "Instalación y reparación de gas natural y envasado. Habilitado por Enargas.",
    rating: "4.9",
    totalReviews: 67,
    hourlyRate: "$5,500",
    city: "San Miguel de Tucumán",
    province: "Tucumán",
    experienceYears: 18,
    isVerified: true,
    categories: [{ id: 6, name: "Gasista" }],
    hasCredits: true,
    avgResponseTime: 90,
    completedJobs: 200,
    phone: "381-567-8901",
    email: "servicios@gasistanorte.com.ar"
  }
];

export const fallbackCategories = [
  { id: 1, name: "Plomería" },
  { id: 2, name: "Electricidad" },
  { id: 3, name: "Pintura" },
  { id: 4, name: "Limpieza" },
  { id: 5, name: "Carpintería" },
  { id: 6, name: "Gasista" },
  { id: 7, name: "Albañilería" },
  { id: 8, name: "Aire Acondicionado" },
  { id: 9, name: "Jardinería" },
  { id: 10, name: "Cerrajería" },
  { id: 11, name: "Mudanzas" },
  { id: 12, name: "Herrero" },
  { id: 13, name: "Techista" },
  { id: 14, name: "Fumigador" },
  { id: 15, name: "Técnico PC" },
  { id: 16, name: "Pequeños Arreglos" },
  { id: 17, name: "Tapicero" }
];

export function getProvidersByCategory(categoryName: string): FallbackProvider[] {
  const normalizedCategoryName = categoryName.toLowerCase();
  return fallbackProviders.filter(provider => 
    provider.categories.some(cat => 
      cat.name.toLowerCase().includes(normalizedCategoryName) ||
      normalizedCategoryName.includes(cat.name.toLowerCase())
    )
  );
}

export function searchProviders(query: string): FallbackProvider[] {
  if (!query) return fallbackProviders;
  
  const normalizedQuery = query.toLowerCase();
  return fallbackProviders.filter(provider => 
    provider.businessName.toLowerCase().includes(normalizedQuery) ||
    provider.description.toLowerCase().includes(normalizedQuery) ||
    provider.categories.some(cat => cat.name.toLowerCase().includes(normalizedQuery)) ||
    provider.city.toLowerCase().includes(normalizedQuery) ||
    provider.province.toLowerCase().includes(normalizedQuery)
  );
}