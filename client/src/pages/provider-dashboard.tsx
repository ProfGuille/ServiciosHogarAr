import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceManagement } from "@/components/provider/service-management";
import { EarningsOverview } from "@/components/provider/earnings-overview";
import { AvailabilityCalendar } from "@/components/provider/availability-calendar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { BadgeShowcase } from "@/components/ui/badge-showcase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  TrendingUp,
  Star,
  AlertCircle,
  Settings,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceRequest, ServiceProvider } from "@shared/schema";

export default function ProviderDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [responseText, setResponseText] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acceso requerido",
        description: "Debes iniciar sesión para acceder al dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch provider profile
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/providers/me"],
    enabled: isAuthenticated && !!user?.id,
  });

  // Get credit balance
  const { data: creditBalance } = useQuery({
    queryKey: ["/api/payments/credits"],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch service requests for this provider
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/requests", { providerId: provider?.id }],
    enabled: !!provider?.id,
  });

  // Fetch provider stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/providers/${provider?.id}/stats`],
    enabled: !!provider?.id,
  });

  // Mutation to respond to requests
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, response, price }: { requestId: number; response: string; price?: number }) => {
      return await apiRequest("POST", `/api/requests/${requestId}/respond`, {
        response,
        quotedPrice: price,
      });
    },
    onSuccess: () => {
      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido enviada al cliente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      setSelectedRequest(null);
      setResponseText("");
      setQuotedPrice("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Iniciando sesión...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 2000);
        return;
      }
      
      // Handle insufficient credits error
      if (error.message?.includes("Créditos insuficientes")) {
        toast({
          title: "Créditos insuficientes",
          description: "Necesitas comprar más créditos para responder a solicitudes.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/comprar-creditos"}
            >
              Comprar créditos
            </Button>
          ),
        });
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la respuesta",
        variant: "destructive",
      });
    },
  });

  // Mutation to update request status
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      return await apiRequest("PUT", `/api/requests/${requestId}`, {
        status,
        ...(status === "completed" && { completedAt: new Date().toISOString() }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la solicitud ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Iniciando sesión...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 2000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "quoted":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "quoted":
        return "Cotizada";
      case "accepted":
        return "Aceptada";
      case "in_progress":
        return "En progreso";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const handleRespond = () => {
    if (!selectedRequest || !responseText.trim()) return;
    
    const price = quotedPrice ? parseFloat(quotedPrice) : undefined;
    
    respondToRequestMutation.mutate({
      requestId: selectedRequest.id,
      response: responseText,
      price,
    });
  };

  const handleStatusUpdate = (requestId: number, status: string) => {
    updateRequestStatusMutation.mutate({ requestId, status });
  };

  if (authLoading || providerLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceso requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para acceder al dashboard de profesionales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/api/login"}>
                Iniciar sesión
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de profesional no encontrado</CardTitle>
              <CardDescription>
                No tienes un perfil de profesional registrado. Contacta al administrador para activar tu cuenta.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Dashboard - {provider.businessName}
          </h1>
          <p className="text-lg text-slate-600">
            Gestiona tu negocio, servicios y ganancias desde un solo lugar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Trabajos totales</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.totalJobs || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Completados</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.completedJobs || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Rating promedio</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {provider.rating || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Créditos disponibles</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {creditBalance ? creditBalance.credits : 0}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = "/comprar-creditos"}
                >
                  Comprar más
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="earnings">Ganancias</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estadísticas Generales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Trabajos completados:</span>
                      <span className="font-semibold">{stats?.completedJobs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating promedio:</span>
                      <span className="font-semibold">{provider.rating || "N/A"}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ingresos totales:</span>
                      <span className="font-semibold">ARS ${(stats?.totalEarnings || 0).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Información del Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Negocio</p>
                      <p className="font-medium">{provider.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium">{provider.city}, {provider.province}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <Badge variant={provider.isVerified ? "default" : "secondary"}>
                        {provider.isVerified ? "Verificado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Achievement Showcase */}
              <BadgeShowcase 
                userId={user?.id || ""} 
                className="lg:col-span-2" 
              />
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <ServiceManagement providerId={provider.id} />
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-6">
            <EarningsOverview providerId={provider.id} />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <AvailabilityCalendar providerId={provider.id} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración del Perfil
                </CardTitle>
                <CardDescription>
                  Gestiona tu información profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Información de contacto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Teléfono</label>
                        <Input defaultValue={provider.phone || ""} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input defaultValue={provider.email || ""} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Descripción profesional</h4>
                    <Textarea 
                      defaultValue={provider.description || ""} 
                      placeholder="Describe tu experiencia y servicios..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>Guardar cambios</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de servicio</CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : requests && requests.length > 0 ? (
                  <div className="space-y-4">
                    {requests.map((request: ServiceRequest) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{request.title}</h3>
                              <p className="text-sm text-gray-600">
                                Solicitud #{request.id}
                              </p>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>
                                  {request.preferredDate 
                                    ? format(new Date(request.preferredDate), "PPP", { locale: es })
                                    : "Fecha no especificada"
                                  }
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>{request.address}, {request.city}</span>
                              </div>

                              {request.estimatedBudget && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-gray-500" />
                                  <span>Presupuesto: ARS {Number(request.estimatedBudget).toLocaleString('es-AR')}</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-1">Descripción:</p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {request.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            {request.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Responder
                              </Button>
                            )}
                            
                            {["quoted", "accepted"].includes(request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, "in_progress")}
                              >
                                Marcar en progreso
                              </Button>
                            )}

                            {request.status === "in_progress" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, "completed")}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Completar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes solicitudes
                    </h3>
                    <p className="text-gray-500">
                      Cuando los clientes soliciten tus servicios, aparecerán aquí
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Response Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responder a solicitud</DialogTitle>
              <DialogDescription>
                Envía una respuesta al cliente con tu cotización
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tu respuesta</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Escribe tu respuesta al cliente..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Precio cotizado (opcional)</label>
                <Input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="5000"
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleRespond}
                  disabled={!responseText.trim() || respondToRequestMutation.isPending}
                >
                  {respondToRequestMutation.isPending ? "Enviando..." : "Enviar respuesta"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
}