import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceRequest, ServiceProvider } from "@shared/schema";

export default function ProviderDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("requests");
  const [responseText, setResponseText] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Fetch provider profile
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/providers/me"],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch service requests for this provider
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/requests", { providerId: provider?.id }],
    enabled: !!provider?.id,
  });

  // Fetch provider stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/providers", provider?.id, "stats"],
    enabled: !!provider?.id,
  });

  // Mutation to respond to service request
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, response, price }: { 
      requestId: number; 
      response: string; 
      price?: number;
    }) => {
      return await apiRequest("PUT", `/api/requests/${requestId}`, {
        status: price ? "quoted" : "accepted",
        providerResponse: response,
        quotedPrice: price,
        quotedAt: new Date().toISOString(),
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
    onError: (error: Error) => {
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

  const filteredRequests = requests?.filter((request: ServiceRequest) => {
    if (selectedTab === "pending") return request.status === "pending";
    if (selectedTab === "active") return ["quoted", "accepted", "in_progress"].includes(request.status);
    if (selectedTab === "completed") return ["completed", "cancelled"].includes(request.status);
    return true;
  });

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
            Gestiona tus solicitudes de servicio y revisa tu rendimiento
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
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Ingresos</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ARS {statsLoading ? "..." : (stats?.totalEarnings || 0).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Section */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes de servicio</CardTitle>
            <CardDescription>
              Gestiona las solicitudes de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="requests">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="active">Activas</TabsTrigger>
                <TabsTrigger value="completed">Finalizadas</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : filteredRequests && filteredRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRequests.map((request: ServiceRequest) => (
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

                          {request.customerNotes && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Notas del cliente:</p>
                              <p className="text-sm text-gray-700">{request.customerNotes}</p>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Creada el {format(new Date(request.createdAt), "PPP", { locale: es })}
                            </p>
                            
                            <div className="flex gap-2">
                              {request.status === "pending" && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm"
                                      onClick={() => setSelectedRequest(request)}
                                    >
                                      <MessageSquare className="w-4 h-4 mr-1" />
                                      Responder
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Responder solicitud</DialogTitle>
                                      <DialogDescription>
                                        Envía una respuesta al cliente para esta solicitud
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Respuesta</label>
                                        <Textarea
                                          placeholder="Escribe tu respuesta al cliente..."
                                          value={responseText}
                                          onChange={(e) => setResponseText(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label className="text-sm font-medium">Precio cotizado (opcional)</label>
                                        <Input
                                          type="number"
                                          placeholder="5000"
                                          value={quotedPrice}
                                          onChange={(e) => setQuotedPrice(e.target.value)}
                                          className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                          Si incluyes un precio, la solicitud se marcará como "cotizada"
                                        </p>
                                      </div>
                                      
                                      <div className="flex gap-2">
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
                              )}
                              
                              {request.status === "quoted" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(request.id, "accepted")}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  Aceptar trabajo
                                </Button>
                              )}
                              
                              {request.status === "accepted" && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, "in_progress")}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  Marcar en progreso
                                </Button>
                              )}
                              
                              {request.status === "in_progress" && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, "completed")}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Completar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay solicitudes
                      </h3>
                      <p className="text-gray-600">
                        {selectedTab === "pending" 
                          ? "No tienes solicitudes pendientes en este momento."
                          : `No tienes solicitudes ${selectedTab === "active" ? "activas" : "finalizadas"}.`
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}