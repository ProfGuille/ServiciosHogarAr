import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceSearch } from "@/components/services/service-search";
import { 
  Wrench, 
  Zap, 
  Brush, 
  Hammer, 
  PaintBucket, 
  Snowflake,
  UserCheck,
  Shield,
  Star,
  Search,
  MapPin,
  Flame,
  HardHat,
  Wind,
  Home,
  Trees,
  Truck,
  Laptop,
  Bug,
  Sofa,
  Key,
  Square,
  Sun,
  Plus,
  MessageCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TestimonialSection } from "@/components/sections/testimonial-section";
import UserTypeSelector from "@/components/ui/UserTypeSelector";
import ServiceSelector from "@/components/ui/ServiceSelector";
import { servicesList } from "@/data/services";
import { useAuth } from "@/hooks/useAuth";

const serviceIcons = {
  plomeria: Wrench,
  electricidad: Zap,
  limpieza: Brush,
  carpinteria: Hammer,
  pintura: PaintBucket,
  refrigeracion: Snowflake,
  gasista: Flame,
  albañil: HardHat,
  "técnico de aire": Wind,
  techista: Home,
  herrero: Wrench,
  jardinería: Trees,
  mudanzas: Truck,
  "técnico pc": Laptop,
  fumigador: Bug,
  "pequeños arreglos": Hammer,
  tapicero: Sofa,
  cerrajero: Key,
  vidriero: Square,
  "instalador solar": Sun,
};

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [userType, setUserType] = useState<'client' | 'provider' | ''>('');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check for busco parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('busco') === 'true') {
      // For demo purposes, show selector without authentication
      // TODO: Re-enable authentication check in production
      setUserType('client');
      setShowServiceSelector(true);
    }
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fallback categories when API is not available
  const fallbackCategories = [
    { id: 1, name: "Plomería" },
    { id: 2, name: "Electricidad" },
    { id: 3, name: "Pintura" },
    { id: 4, name: "Limpieza" },
    { id: 5, name: "Carpintería" },
    { id: 6, name: "Gasista" },
    { id: 7, name: "Albañil" },
    { id: 8, name: "Técnico de aire" },
    { id: 9, name: "Jardinería" },
    { id: 10, name: "Cerrajero" },
    { id: 11, name: "Mudanzas" },
    { id: 12, name: "Herrero" },
    { id: 13, name: "Techista" },
    { id: 14, name: "Fumigador" },
    { id: 15, name: "Técnico PC" },
    { id: 16, name: "Pequeños arreglos" },
    { id: 17, name: "Tapicero" }
  ];

  // Use fallback if categories API fails
  const displayCategories = categories || fallbackCategories;

  const { data: featuredProviders } = useQuery({
    queryKey: ["/api/providers"],
    queryFn: () => fetch("/api/providers?limit=4&isVerified=true").then(res => {
      if (!res.ok) {
        throw new Error('Providers API not available');
      }
      return res.json();
    }),
    retry: false,
    enabled: false, // Disable this query for now since providers API is not implemented
  });

  const handleSearch = () => {
    // Redirect to advanced search page with search query
    let url = '/buscar';
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    if (location) {
      params.set('city', location);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    window.location.href = url;
  };

  const handleProviderSignup = () => {
    window.location.href = "/register-provider";
  };

  const handleUserTypeSelect = (type: 'client' | 'provider') => {
    setUserType(type);
    if (type === 'client') {
      // For demo purposes, allow ServiceSelector to show without authentication
      // TODO: Re-enable authentication check in production
      // if (!isAuthenticated) {
      //   window.location.href = "/login?redirect=buscar";
      //   return;
      // }
      setShowServiceSelector(true);
    } else {
      // Redirect to provider registration
      window.location.href = "/register-provider";
    }
  };

  const handleServiceSelect = (service: any) => {
    // Navigate to search page with the selected service
    const servicePath = service.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    window.location.href = `/servicios/${servicePath}`;
  };

  const prepareServicesForSelector = () => {
    if (!displayCategories) return [];
    
    // Create a mapping from category names to services
    const serviceMap = servicesList.reduce((acc, service) => {
      acc[service.name.toLowerCase()] = service;
      return acc;
    }, {} as Record<string, any>);

    return displayCategories.map((category: any) => {
      // Find matching service by name
      const matchingService = serviceMap[category.name.toLowerCase()];
      
      return {
        id: category.id.toString(),
        name: category.name,
        description: "150+ profesionales disponibles",
        category: category.name,
        image: matchingService?.image || `/images/services/${category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_")}.jpg`
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section with User Type Selection */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg mb-6 text-blue-100">
              {t('landing.hero.subtitle')}
            </p>
          </div>

          {/* User Type Selection - Primary Interaction */}
          {!userType && (
            <UserTypeSelector 
              onSelect={handleUserTypeSelect}
              selectedType={userType}
              className="mb-6"
            />
          )}

          {/* Service Selection for Clients */}
          {userType === 'client' && showServiceSelector && (
            <div className="bg-white rounded-lg p-8 shadow-2xl">
              <ServiceSelector
                title="¿Qué servicio necesitas?"
                subtitle="Elegí el tipo de profesional que buscas"
                services={prepareServicesForSelector()}
                onServiceSelect={handleServiceSelect}
                className="text-gray-900"
              />
            </div>
          )}

          {/* Fallback Traditional Search */}
          {!userType && (
            <ServiceSearch />
          )}
        </div>
      </section>

      {/* Service Categories - Hide when ServiceSelector is shown */}
      {!(userType === 'client' && showServiceSelector) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Servicios más solicitados</h2>
              <p className="text-lg text-slate-600">Encuentra el profesional perfecto para cualquier tarea en tu hogar</p>
            </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displayCategories?.slice(0, 17).map((category) => {
              const IconComponent = serviceIcons[category.name.toLowerCase() as keyof typeof serviceIcons] || Wrench;
              const categoryPath = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
              return (
                <Link key={category.id} href={`/servicios/${categoryPath}`}>
                  <Card className="text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <IconComponent className="h-8 w-8 text-primary group-hover:text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-slate-500">150+ profesionales</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            
            {/* Suggest a Service Button */}
            <Link href="/contacto?sugerir=servicio">
              <Card className="text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full border-dashed border-2">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="h-8 w-8 text-gray-500 group-hover:text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">¿No encuentras el servicio?</h3>
                  <p className="text-sm text-primary font-medium">Sugerir servicio</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
            <p className="text-lg text-slate-600">Solo 3 pasos para resolver cualquier problema en tu hogar</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Describe tu necesidad</h3>
              <p className="text-slate-600">Contanos qué servicio necesitas y en qué zona te encontrás. <strong>Es 100% gratis</strong> y sin compromiso.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Recibí presupuestos</h3>
              <p className="text-slate-600">Los profesionales verificados de tu zona te enviarán presupuestos personalizados.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Elegí y contratá</h3>
              <p className="text-slate-600">Compará perfiles, lee reseñas y elegí al profesional que más te convenga.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      {featuredProviders && featuredProviders.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Profesionales destacados</h2>
              <p className="text-lg text-slate-600">Conocé a algunos de nuestros mejores profesionales verificados</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProviders?.map((provider) => (
                <Link key={provider.id} href={`/profesional/${provider.id}`}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                    <img 
                      src={provider.profileImageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"} 
                      alt={`${provider.businessName} - Profesional`} 
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-slate-900 mb-1">{provider.businessName}</h3>
                    <p className="text-sm text-slate-600 mb-3">{provider.city}</p>
                    <div className="flex items-center justify-center mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600 ml-2">{provider.rating} ({provider.totalReviews} reseñas)</span>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                      {provider.isVerified && (
                        <div className="flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-secondary mr-2" />
                          <span>Verificado</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary mr-2" />
                        <span>Asegurado</span>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Simple Pricing Table Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Precios estimados por servicio</h2>
            <p className="text-lg text-slate-600">Rangos de precios referenciales para que tengas una idea del costo</p>
            <p className="text-sm text-slate-500 mt-2">*Los precios finales varían según la complejidad del trabajo y la zona</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Servicios básicos</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Plomería (consulta)</span>
                  <span className="font-medium">$8,000 - $15,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Electricidad (punto)</span>
                  <span className="font-medium">$5,000 - $12,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cerrajería básica</span>
                  <span className="font-medium">$6,000 - $18,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pequeños arreglos</span>
                  <span className="font-medium">$4,000 - $10,000</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Servicios de hogar</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Limpieza (4 horas)</span>
                  <span className="font-medium">$12,000 - $20,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pintura (m²)</span>
                  <span className="font-medium">$800 - $1,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jardinería (hora)</span>
                  <span className="font-medium">$2,500 - $4,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fumigación</span>
                  <span className="font-medium">$15,000 - $35,000</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Servicios especializados</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Técnico de aire (service)</span>
                  <span className="font-medium">$18,000 - $35,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Técnico PC (diagnóstico)</span>
                  <span className="font-medium">$8,000 - $15,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gasista (certificación)</span>
                  <span className="font-medium">$25,000 - $50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Carpintería (hora)</span>
                  <span className="font-medium">$4,000 - $8,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">¿Necesitas un presupuesto más preciso?</p>
            <Link href="/crear-solicitud">
              <Button className="bg-secondary text-white hover:bg-green-700">
                Solicitar Presupuestos Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Por qué elegir ServiciosHogar?</h2>
            <p className="text-lg text-slate-600">La tranquilidad de contratar con confianza</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Profesionales verificados</h3>
              <p className="text-slate-600">Nuestros profesionales completan un proceso de verificación de identidad para mayor seguridad.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">100% Gratis para clientes</h3>
              <p className="text-slate-600">Buscá y solicitá presupuestos sin costo. Pagás directamente al profesional por el servicio.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Calidad garantizada</h3>
              <p className="text-slate-600">Sistema de reseñas y calificaciones real. Solo los mejores profesionales permanecen en la plataforma.</p>
            </div>
          </div>
          
          <div className="mt-16 bg-slate-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <p className="text-slate-600">Servicios completados</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
                <p className="text-slate-600">Profesionales activos</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
                <p className="text-slate-600">Calificación promedio</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <p className="text-slate-600">Clientes satisfechos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="py-16 bg-gradient-to-r from-secondary to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Eres un profesional de servicios?</h2>
          <p className="text-xl mb-8 text-green-100">Únete a nuestra plataforma y conecta con miles de clientes potenciales</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <UserCheck className="h-16 w-16 mx-auto mb-4 text-green-200" />
              <h3 className="text-lg font-semibold mb-2">Más clientes</h3>
              <p className="text-green-100">Accede a una base de clientes en crecimiento</p>
            </div>
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-green-200" />
              <h3 className="text-lg font-semibold mb-2">Gestión simple</h3>
              <p className="text-green-100">Administra tus servicios y horarios fácilmente</p>
            </div>
            <div className="text-center">
              <Star className="h-16 w-16 mx-auto mb-4 text-green-200" />
              <h3 className="text-lg font-semibold mb-2">Más oportunidades</h3>
              <p className="text-green-100">Comprá créditos para responder a solicitudes</p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              className="w-full sm:w-auto bg-white text-secondary hover:bg-slate-50"
              onClick={handleProviderSignup}
            >
              Registrarme como Profesional
            </Button>
            <Link href="/precios">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-white text-white bg-white/10 hover:bg-white hover:text-secondary"
              >
                Ver Planes y Precios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
