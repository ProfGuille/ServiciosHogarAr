import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  MapPin,
  Calendar,
  DollarSign,
  Star,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceRequest, ServiceProvider, ServiceCategory } from "@shared/schema";

interface ExtendedServiceRequest extends ServiceRequest {
  provider?: ServiceProvider;
  category?: ServiceCategory;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: Clock,
  quoted: DollarSign,
  accepted: CheckCircle,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusLabels = {
  pending: "Pendiente",
  quoted: "Cotizado",
  accepted: "Aceptado",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export default function MyRequests() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<ExtendedServiceRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Sesión requerida",
        description: "Debes iniciar sesión para ver tus solicitudes.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch service requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/requests", { customerId: user?.id }],
    enabled: isAuthenticated && !!user?.id,
  });

  // Cancel request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest("PUT", `/api/requests/${requestId}`, {
        status: "cancelled",
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitud cancelada",
        description: "Tu solicitud ha sido cancelada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      setSelectedRequest(null);
    },
    onError: (error) => {
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
        description: "No se pudo cancelar la solicitud",
        variant: "destructive",
      });
    },
  });

  // Accept quote mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest("PUT", `/api/requests/${requestId}`, {
        status: "accepted",
      });
    },
    onSuccess: () => {
      toast({
        title: "Cotización aceptada",
        description: "Has aceptado la cotización del profesional.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      setSelectedRequest(null);
    },
    onError: (error) => {
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
        description: "No se pudo aceptar la cotización",
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ requestId, providerId }: { requestId: number; providerId: number }) => {
      return await apiRequest("POST", "/api/reviews", {
        serviceRequestId: requestId,
        providerId: providerId,
        rating: rating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      toast({
        title: "Reseña enviada",
        description: "Gracias por tu feedback.",
      });
      setShowReviewDialog(false);
      setRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error) => {
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
        description: "No se pudo enviar la reseña",
        variant: "destructive",
      });
    },
  });

  if (authLoading || requestsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const filterRequestsByStatus = (status: string) => {
    if (!requests) return [];
    return status === "all" 
      ? requests 
      : requests.filter((req: ExtendedServiceRequest) => req.status === status);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Solicitudes</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="quoted">Cotizadas</TabsTrigger>
          <TabsTrigger value="accepted">Aceptadas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
        </TabsList>

        {["all", "pending", "quoted", "accepted", "completed"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              {filterRequestsByStatus(status).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No tienes solicitudes {status !== "all" ? statusLabels[status as keyof typeof statusLabels]?.toLowerCase() + "s" : ""}.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterRequestsByStatus(status).map((request: ExtendedServiceRequest) => {
                  const StatusIcon = statusIcons[request.status as keyof typeof statusIcons];
                  return (
                    <Card key={request.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => setSelectedRequest(request)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {request.category?.name || "Servicio"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {request.description}
                            </CardDescription>
                          </div>
                          <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusLabels[request.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {request.city}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {format(new Date(request.serviceDate), "dd 'de' MMMM, yyyy", { locale: es })}
                          </div>
                          {request.estimatedBudget && (
                            <div className="flex items-center text-muted-foreground">
                              <DollarSign className="w-4 h-4 mr-2" />
                              ${request.estimatedBudget}
                            </div>
                          )}
                        </div>
                        {request.provider && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="font-medium">{request.provider.businessName}</span>
                              </div>
                              {request.provider.rating > 0 && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1">{request.provider.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRequest.category?.name || "Detalles de la solicitud"}</DialogTitle>
                <DialogDescription>
                  Creada el {format(new Date(selectedRequest.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Estado</Label>
                  <Badge className={`mt-1 ${statusColors[selectedRequest.status as keyof typeof statusColors]}`}>
                    {statusLabels[selectedRequest.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <p className="mt-1 text-sm">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ubicación</Label>
                    <p className="mt-1 text-sm">{selectedRequest.city}</p>
                  </div>
                  <div>
                    <Label>Fecha del servicio</Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedRequest.serviceDate), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                {selectedRequest.estimatedBudget && (
                  <div>
                    <Label>Precio cotizado</Label>
                    <p className="mt-1 text-sm font-semibold">${selectedRequest.estimatedBudget}</p>
                  </div>
                )}

                {selectedRequest.provider && (
                  <div className="border-t pt-4">
                    <Label>Profesional asignado</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <p className="font-medium">{selectedRequest.provider.businessName}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.provider.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.provider.phone}</p>
                    </div>
                  </div>
                )}

                {/* Actions based on status */}
                <div className="flex gap-2 pt-4">
                  {selectedRequest.status === "pending" && (
                    <Button
                      variant="destructive"
                      onClick={() => cancelRequestMutation.mutate(selectedRequest.id)}
                      disabled={cancelRequestMutation.isPending}
                    >
                      Cancelar solicitud
                    </Button>
                  )}
                  
                  {selectedRequest.status === "quoted" && selectedRequest.provider && (
                    <>
                      <Button
                        onClick={() => acceptQuoteMutation.mutate(selectedRequest.id)}
                        disabled={acceptQuoteMutation.isPending}
                      >
                        Aceptar cotización
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => cancelRequestMutation.mutate(selectedRequest.id)}
                        disabled={cancelRequestMutation.isPending}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                  
                  {selectedRequest.status === "completed" && selectedRequest.provider && (
                    <Button
                      onClick={() => {
                        setShowReviewDialog(true);
                        setSelectedRequest(null);
                      }}
                    >
                      Dejar reseña
                    </Button>
                  )}
                  
                  {selectedRequest.provider && ["accepted", "in_progress", "completed"].includes(selectedRequest.status) && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/mensajes?userId=${selectedRequest.provider?.userId}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contactar profesional
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dejar una reseña</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con este profesional
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Calificación</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review">Comentario</Label>
              <Textarea
                id="review"
                placeholder="Cuéntanos sobre tu experiencia..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedRequest?.provider) {
                    submitReviewMutation.mutate({
                      requestId: selectedRequest.id,
                      providerId: selectedRequest.provider.id,
                    });
                  }
                }}
                disabled={submitReviewMutation.isPending}
              >
                Enviar reseña
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewDialog(false);
                  setRating(5);
                  setReviewComment("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}