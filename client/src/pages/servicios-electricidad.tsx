import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Star, MapPin, Zap, CheckCircle, ArrowLeft } from "lucide-react";

export default function ServiciosElectricidad() {
  useEffect(() => {
    document.title = "Electricistas - ServiciosHogar.com.ar";
  }, []);

  // Get electricity category ID
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const electricityCategoryId = categories?.find(cat => 
    cat.name.toLowerCase() === "electricidad"
  )?.id;

  // Get electricians
  const { data: providers, isLoading } = useQuery({
    queryKey: ["/api/providers", "electricity", electricityCategoryId],
    queryFn: () => {
      if (!electricityCategoryId) return [];
      const params = new URLSearchParams();
      params.set('categoryId', electricityCategoryId.toString());
      return fetch(`/api/providers?${params.toString()}`).then(res => res.json());
    },
    enabled: !!electricityCategoryId
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/servicios" className="inline-flex items-center text-sm text-slate-600 hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a servicios
          </Link>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Servicios de Electricidad
                </h1>
                <p className="text-lg text-slate-700 mb-4">
                  Electricistas certificados para instalaciones seguras y reparaciones eléctricas.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Instalaciones eléctricas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Reparación de cortocircuitos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Cambio de tableros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Iluminación LED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              `${providers?.length || 0} electricistas disponibles`
            )}
          </h2>
        </div>

        {/* Providers Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Zap className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {provider.businessName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-600 ml-1">
                            {provider.rating} ({provider.totalReviews} reseñas)
                          </span>
                        </div>
                        {provider.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {provider.city}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {provider.description || "Servicios eléctricos profesionales con certificación y garantía."}
                  </p>
                  {provider.hourlyRate && (
                    <div className="text-lg font-semibold text-slate-900 mb-4">
                      ${Number(provider.hourlyRate).toLocaleString()}/hora
                    </div>
                  )}
                  <Link href={`/profesional/${provider.id}`}>
                    <Button className="w-full">Ver perfil completo</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                No hay electricistas disponibles en este momento.
              </p>
              <Link href="/servicios">
                <Button variant="outline" className="mt-4">
                  Ver todos los servicios
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}