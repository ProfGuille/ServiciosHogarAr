import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Users, Star } from "lucide-react";

export default function Precios() {
  useEffect(() => {
    document.title = "Guía de Precios - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  // Calculate price ranges by category
  const priceRanges = categories?.map(category => {
    const categoryProviders = providers?.filter(provider => 
      provider.categoryId === category.id && provider.hourlyRate
    ) || [];
    
    if (categoryProviders.length === 0) {
      return {
        category: category.name,
        description: category.description,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        providerCount: 0
      };
    }

    const rates = categoryProviders.map(p => Number(p.hourlyRate)).filter(rate => rate > 0);
    const minPrice = Math.min(...rates);
    const maxPrice = Math.max(...rates);
    const avgPrice = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

    return {
      category: category.name,
      description: category.description,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
      providerCount: categoryProviders.length
    };
  }) || [];

  const isLoading = categoriesLoading || providersLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Guía de Precios de Servicios
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Precios de referencia para servicios domésticos en Argentina. 
            Los precios pueden variar según la complejidad del trabajo, ubicación y experiencia del profesional.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Información importante sobre precios
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Los precios mostrados son tarifas por hora aproximadas</li>
                <li>• Los costos finales pueden variar según la complejidad del trabajo</li>
                <li>• Materiales no incluidos en las tarifas mostradas</li>
                <li>• Se recomienda solicitar múltiples presupuestos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            priceRanges.map((range, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-900">
                      {range.category}
                    </span>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{range.providerCount}</span>
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    {range.description}
                  </p>
                </CardHeader>
                <CardContent>
                  {range.providerCount > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-slate-900">
                            ${range.avgPrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">
                            Promedio por hora
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-sm text-slate-600 mb-1">Rango de precios:</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            ${range.minPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">a</span>
                          <span className="text-sm font-medium">
                            ${range.maxPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-slate-500 text-sm">
                        No hay datos de precios disponibles
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            ¿Necesitas un presupuesto personalizado?
          </h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Los precios reales pueden variar según tus necesidades específicas. 
            Publica tu solicitud y recibe presupuestos personalizados de profesionales verificados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/servicios"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Ver Profesionales
            </a>
            <a 
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}