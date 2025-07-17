import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const serviceIcons = {
  plomeria: Wrench,
  electricidad: Zap,
  limpieza: Brush,
  carpinteria: Hammer,
  pintura: PaintBucket,
  refrigeracion: Snowflake,
};

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProviders } = useQuery({
    queryKey: ["/api/providers"],
    queryFn: () => fetch("/api/providers?limit=4&isVerified=true").then(res => res.json()),
  });

  const handleSearch = () => {
    // Redirect to services page with search query
    let url = '/servicios';
    if (searchQuery) {
      url += `?buscar=${encodeURIComponent(searchQuery)}`;
    }
    window.location.href = url;
  };

  const handleProviderSignup = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Conectamos tu hogar con los mejores 
                <span className="text-blue-200"> profesionales</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Encuentra y contrata servicios de confianza para tu hogar. Profesionales verificados, pagos seguros y garantía de calidad en toda Argentina.
              </p>
              
              {/* Search Bar */}
              <Card className="p-6 shadow-2xl">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">¿Qué servicio necesitas?</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Ej: Plomería, Electricidad..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ubicación</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Ciudad o código postal"
                          className="pl-10"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full bg-secondary text-white hover:bg-green-700"
                        onClick={handleSearch}
                      >
                        Buscar Servicios
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Profesional de servicios para el hogar con herramientas" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Servicios más solicitados</h2>
            <p className="text-lg text-slate-600">Encuentra el profesional perfecto para cualquier tarea en tu hogar</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories?.map((category) => {
              const IconComponent = serviceIcons[category.name.toLowerCase() as keyof typeof serviceIcons] || Wrench;
              const categoryPath = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
          </div>
        </div>
      </section>

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
              <p className="text-slate-600">Contanos qué servicio necesitas y en qué zona te encontrás. Es gratis y sin compromiso.</p>
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
              <p className="text-slate-600">Todos nuestros profesionales pasan por un riguroso proceso de verificación de identidad y antecedentes.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Pagos seguros</h3>
              <p className="text-slate-600">Sistema de pagos protegido con garantía de devolución. No pagues hasta estar 100% satisfecho.</p>
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
              <h3 className="text-lg font-semibold mb-2">Pagos garantizados</h3>
              <p className="text-green-100">Sistema de pagos seguro y puntual</p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              className="w-full sm:w-auto bg-white text-secondary hover:bg-slate-50"
              onClick={handleProviderSignup}
            >
              Registrarme como Profesional
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-secondary"
            >
              Ver Planes y Precios
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
