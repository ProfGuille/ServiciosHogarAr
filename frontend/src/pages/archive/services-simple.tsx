import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function ServicesSimple() {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch providers and categories
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from backend first
        try {
          const providersResponse = await fetch('/api/providers');
          if (providersResponse.ok) {
            const providersData = await providersResponse.json();
            setProviders(providersData || []);
          } else {
            throw new Error('Backend not available');
          }
          
          const categoriesResponse = await fetch('/api/categories');
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData || []);
          }
        } catch (backendError) {
          // If backend is not available, use mock data
          console.log('Using mock data (backend not available)');
          
          // Mock categories
          setCategories([
            { id: 1, name: "Plomería", description: "Servicios de plomería" },
            { id: 2, name: "Electricidad", description: "Servicios eléctricos" },
            { id: 3, name: "Pintura", description: "Servicios de pintura" },
            { id: 4, name: "Limpieza", description: "Servicios de limpieza" },
            { id: 5, name: "Jardinería", description: "Servicios de jardinería" },
            { id: 6, name: "Carpintería", description: "Servicios de carpintería" }
          ]);
          
          // Mock providers
          setProviders([
            {
              id: 1,
              name: "Juan Pérez",
              businessName: "Plomería Buenos Aires",
              city: "Buenos Aires",
              categoryId: 1,
              rating: 4.8,
              totalReviews: 156,
              hourlyRate: 4500,
              phone: "11-2345-6789",
              description: "Especialista en reparaciones de plomería con más de 10 años de experiencia."
            },
            {
              id: 2,
              name: "María González",
              businessName: "Electricidad Profesional",
              city: "Córdoba",
              categoryId: 2,
              rating: 4.9,
              totalReviews: 89,
              hourlyRate: 5000,
              phone: "351-234-5678",
              description: "Electricista matriculada especializada en instalaciones residenciales."
            },
            {
              id: 3,
              name: "Carlos López",
              businessName: "Pintura y Decoración",
              city: "Rosario",
              categoryId: 3,
              rating: 4.7,
              totalReviews: 124,
              hourlyRate: 3800,
              phone: "341-345-6789",
              description: "Pintor profesional con experiencia en interiores y exteriores."
            }
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Cargando servicios...</h1>
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Servicios Profesionales</h1>
            <p className="text-gray-600">Encuentra profesionales verificados para tu hogar</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{providers.length}</div>
              <div className="text-gray-600">Profesionales activos</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-gray-600">Categorías de servicios</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-gray-600">Profesionales verificados</div>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Categorías de Servicios</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((category: any) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-semibold">{category.name}</div>
                      <div className="text-sm text-gray-600">{category.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Providers */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Profesionales Destacados</h2>
            {providers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No se encontraron profesionales</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider: any) => (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{provider.businessName || provider.name}</CardTitle>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin size={14} className="mr-1" />
                            {provider.city}
                          </div>
                        </div>
                        <Badge variant={provider.isVerified ? "default" : "secondary"}>
                          {provider.isVerified ? "Verificado" : "Pendiente"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {provider.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-2" />
                            {provider.phone}
                          </div>
                        )}
                        
                        {provider.credits && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Créditos disponibles:</span>
                            <Badge variant="outline">{provider.credits}</Badge>
                          </div>
                        )}

                        <Link href={`/provider/${provider.id}`}>
                          <Button className="w-full" variant="outline">
                            Ver Perfil
                            <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}