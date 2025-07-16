import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Settings,
  Edit,
  Eye,
  MapPin
} from "lucide-react";

export default function ProviderDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== 'provider')) {
      toast({
        title: "Acceso denegado",
        description: "Solo los profesionales pueden acceder a esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: provider } = useQuery({
    queryKey: ["/api/providers", "me"],
    enabled: !!user && user.userType === 'provider',
  });

  const { data: requests } = useQuery({
    queryKey: ["/api/requests", { limit: 10 }],
    enabled: !!user && user.userType === 'provider',
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/providers", provider?.id, "stats"],
    enabled: !!provider,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.userType !== 'provider') {
    return null; // Will redirect
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
      quoted: { label: "Cotizado", variant: "default" as const, icon: DollarSign },
      accepted: { label: "Aceptado", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "En progreso", variant: "default" as const, icon: Clock },
      completed: { label: "Completado", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: AlertCircle },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Dashboard Profesional
              </h1>
              <p className="text-lg text-slate-600">
                Gestiona tus servicios y solicitudes
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Provider Profile Card */}
        {provider && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={provider.profileImageUrl || undefined} 
                    alt={provider.businessName || 'Profesional'} 
                  />
                  <AvatarFallback className="text-xl">
                    {provider.businessName?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {provider.businessName}
                    </h2>
                    {provider.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendiente verificación
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {provider.city}, {provider.province}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      {provider.rating} ({provider.totalReviews} reseñas)
                    </div>
                  </div>
                  
                  {provider.description && (
                    <p className="text-slate-700 mb-4">{provider.description}</p>
                  )}
                  
                  <div className="flex gap-3">
                    <Button size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver perfil público
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar información
                    </Button>
                  </div>
                </div>
                
                {provider.hourlyRate && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${Number(provider.hourlyRate).toLocaleString('es-AR')}
                    </div>
                    <div className="text-sm text-slate-500">ARS/hora</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Trabajos totales</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.totalJobs || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completados</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.completedJobs || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Calificación</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.averageRating || provider?.rating || 0}/5
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Ingresos</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${(stats?.totalEarnings || 0).toLocaleString('es-AR')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="calendar">Agenda</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Solicitudes recientes
                </CardTitle>
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent>
                {requests && requests.length > 0 ? (
                  <div className="space-y-4">
                    {requests.map((request) => {
                      const statusConfig = getStatusBadge(request.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={request.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">
                                {request.title}
                              </h3>
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                {request.description}
                              </p>
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
                            
                            <div className="flex items-center gap-3">
                              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                              <Button size="sm">
                                Ver detalles
                              </Button>
                            </div>
                          </div>
                          
                          {request.isUrgent && (
                            <div className="flex items-center gap-2 text-orange-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">Urgente</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay solicitudes
                    </h3>
                    <p className="text-slate-600 mb-4">
                      No tienes solicitudes pendientes en este momento.
                    </p>
                    <Button variant="outline">
                      Buscar nuevas oportunidades
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mi agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Calendario próximamente
                  </h3>
                  <p className="text-slate-600">
                    Esta funcionalidad estará disponible pronto.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Sin mensajes nuevos
                  </h3>
                  <p className="text-slate-600">
                    Cuando recibas mensajes de clientes aparecerán aquí.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análisis de rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Estadísticas del mes</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Solicitudes recibidas</span>
                        <span className="font-semibold">12</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Tasa de aceptación</span>
                        <span className="font-semibold text-green-600">85%</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Tiempo de respuesta promedio</span>
                        <span className="font-semibold">2.5 hrs</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Ingresos del mes</span>
                        <span className="font-semibold text-primary">
                          ${(25000).toLocaleString('es-AR')} ARS
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Recomendaciones</h4>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Mejora tu tiempo de respuesta:</strong> Responder en menos de 2 horas aumenta tus posibilidades de conseguir el trabajo.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Actualiza tu perfil:</strong> Los perfiles completos con fotos reciben 40% más solicitudes.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Solicita reseñas:</strong> Pide a tus clientes satisfechos que dejen una reseña para mejorar tu reputación.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
