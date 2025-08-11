import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceSearch } from "@/components/services/service-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import ChatFloatingButton from "@/components/Chat/ChatFloatingButton";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  User,
  Star,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: recentRequests } = useQuery({
    queryKey: ["/api/requests", { limit: 5 }],
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: nearbyProviders } = useQuery({
    queryKey: ["/api/providers", { limit: 4, isVerified: true }],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const },
      quoted: { label: "Cotizado", variant: "default" as const },
      accepted: { label: "Aceptado", variant: "default" as const },
      in_progress: { label: "En progreso", variant: "default" as const },
      completed: { label: "Completado", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ¡Bienvenido, {user.firstName || 'Usuario'}!
          </h1>
          <p className="text-lg text-slate-600">
            {user.userType === 'provider' 
              ? 'Gestiona tus servicios y conecta con nuevos clientes'
              : 'Encuentra los mejores profesionales para tu hogar'
            }
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <ServiceSearch />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {user.userType === 'provider' ? 'Solicitudes recientes' : 'Mis solicitudes'}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {recentRequests && recentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recentRequests.map((request) => {
                      const statusConfig = getStatusBadge(request.status);
                      return (
                        <div key={request.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">{request.title}</h3>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{request.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.city}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString('es-AR')}
                            </div>
                            {request.estimatedBudget && (
                              <div className="font-medium">
                                ${Number(request.estimatedBudget).toLocaleString('es-AR')} ARS
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">
                      {user.userType === 'provider' 
                        ? 'No hay solicitudes disponibles en este momento'
                        : 'Aún no has realizado ninguna solicitud'
                      }
                    </p>
                    <Button className="mt-4" variant="outline" onClick={() => window.location.href = user.userType === 'provider' ? '/buscar' : '/crear-solicitud'}>
                      {user.userType === 'provider' 
                        ? 'Explorar solicitudes'
                        : 'Crear nueva solicitud'
                      }
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Providers */}
            {user.userType === 'customer' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Profesionales recomendados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {nearbyProviders?.map((provider) => (
                      <div key={provider.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={provider.profileImageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                            alt={provider.businessName || 'Profesional'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-slate-900">{provider.businessName}</h3>
                            <p className="text-sm text-slate-600">{provider.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{provider.rating}</span>
                            <span className="text-xs text-slate-500">({provider.totalReviews})</span>
                          </div>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.userType === 'customer' ? (
                  <>
                    <Button className="w-full" size="sm" onClick={() => window.location.href = "/crear-solicitud"}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Nueva solicitud
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" onClick={() => window.location.href = "/buscar"}>
                      <User className="h-4 w-4 mr-2" />
                      Buscar profesionales
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="sm" onClick={() => window.location.href = "/perfil"}>
                      <User className="h-4 w-4 mr-2" />
                      Mi perfil
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" onClick={() => window.location.href = "/dashboard-profesional"}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver dashboard
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorías populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories?.slice(0, 6).map((category) => (
                    <Button 
                      key={category.id}
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      size="sm"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle>En números</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10,000+</div>
                  <p className="text-sm text-slate-600">Servicios completados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2,500+</div>
                  <p className="text-sm text-slate-600">Profesionales activos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.8/5</div>
                  <p className="text-sm text-slate-600">Calificación promedio</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Floating Button - MVP3 Integration */}
      {/* TODO: Implement chat floating button
      {user && (
        <ChatFloatingButton
          position="bottom-right"
          size="medium"
          showUnreadBadge={true}
        />
      )}
      */}

      <Footer />
    </div>
  );
}
