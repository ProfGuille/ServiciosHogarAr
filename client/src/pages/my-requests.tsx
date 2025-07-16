import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceRequest } from "@shared/schema";

export default function MyRequests() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("all");

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/requests", { customerId: user?.id }],
    enabled: isAuthenticated && !!user?.id,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "quoted":
        return <AlertCircle className="w-4 h-4" />;
      case "accepted":
      case "in_progress":
        return <Loader className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  const filteredRequests = requests?.filter((request: ServiceRequest) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "active") {
      return ["pending", "quoted", "accepted", "in_progress"].includes(request.status);
    }
    if (selectedTab === "completed") {
      return ["completed", "cancelled"].includes(request.status);
    }
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceso requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para ver tus solicitudes de servicio.
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mis solicitudes</h1>
          <p className="text-lg text-slate-600">
            Gestiona y revisa el estado de tus solicitudes de servicio
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="completed">Finalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {requestsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : filteredRequests && filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request: ServiceRequest) => (
                  <Card key={request.id} className="w-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.serviceType}</CardTitle>
                          <CardDescription className="mt-1">
                            Solicitud #{request.id}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {getStatusText(request.status)}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">Fecha preferida</p>
                              <p className="text-sm text-gray-600">
                                {request.preferredDateTime 
                                  ? format(new Date(request.preferredDateTime), "PPP 'a las' HH:mm", { locale: es })
                                  : "No especificada"
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">Ubicación</p>
                              <p className="text-sm text-gray-600">
                                {request.address}, {request.city}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">Contacto</p>
                              <p className="text-sm text-gray-600">
                                {request.contactPhone || "No especificado"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Descripción</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {request.description}
                            </p>
                          </div>

                          {request.urgencyLevel && (
                            <div>
                              <p className="text-sm font-medium mb-1">Urgencia</p>
                              <Badge variant="outline" className="text-xs">
                                {request.urgencyLevel === "low" && "Baja"}
                                {request.urgencyLevel === "normal" && "Normal"}
                                {request.urgencyLevel === "high" && "Alta"}
                                {request.urgencyLevel === "emergency" && "Emergencia"}
                              </Badge>
                            </div>
                          )}

                          {request.estimatedBudget && (
                            <div>
                              <p className="text-sm font-medium mb-1">Presupuesto estimado</p>
                              <p className="text-sm text-gray-600">
                                ARS {Number(request.estimatedBudget).toLocaleString('es-AR')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {request.providerResponse && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Respuesta del profesional
                          </p>
                          <p className="text-sm text-blue-800">
                            {request.providerResponse}
                          </p>
                          {request.quotedPrice && (
                            <p className="text-sm text-blue-800 mt-2">
                              <strong>Precio cotizado:</strong> ARS {Number(request.quotedPrice).toLocaleString('es-AR')}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Creada el {format(new Date(request.createdAt), "PPP", { locale: es })}
                        </p>
                        
                        <div className="flex gap-2">
                          {request.status === "quoted" && (
                            <>
                              <Button variant="outline" size="sm">
                                Rechazar
                              </Button>
                              <Button size="sm">
                                Aceptar cotización
                              </Button>
                            </>
                          )}
                          {request.status === "completed" && (
                            <Button variant="outline" size="sm">
                              Dejar reseña
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
                  <p className="text-gray-600 mb-4">
                    {selectedTab === "all" 
                      ? "Aún no has realizado ninguna solicitud de servicio."
                      : `No tienes solicitudes ${selectedTab === "active" ? "activas" : "finalizadas"}.`
                    }
                  </p>
                  <Button onClick={() => window.location.href = "/services"}>
                    Buscar servicios
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}