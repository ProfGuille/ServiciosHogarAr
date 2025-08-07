import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MapPin,
  Calendar,
  DollarSign,
  Plus
} from "lucide-react";

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Sesión requerida",
        description: "Debes iniciar sesión para ver tus solicitudes.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch service requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/requests"],
    enabled: isAuthenticated,
  });

  if (authLoading || requestsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mis Solicitudes</h1>
          <Button onClick={() => window.location.href = "/crear-solicitud"}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva solicitud
          </Button>
        </div>

        {!requests || requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No tienes solicitudes aún
              </h3>
              <p className="text-slate-600 mb-6">
                Crea tu primera solicitud para conectar con profesionales verificados.
              </p>
              <Button onClick={() => window.location.href = "/crear-solicitud"}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera solicitud
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request: any) => {
              const StatusIcon = statusIcons[request.status as keyof typeof statusIcons] || Clock;
              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {request.title}
                        </CardTitle>
                        <p className="text-slate-600 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                      <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusLabels[request.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {request.city}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(request.createdAt).toLocaleDateString('es-AR')}
                      </div>
                      {request.estimatedBudget && (
                        <div className="flex items-center text-slate-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${Number(request.estimatedBudget).toLocaleString('es-AR')} ARS
                        </div>
                      )}
                    </div>

                    {request.preferredDate && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Fecha preferida: {new Date(request.preferredDate).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                    )}

                    {request.isUrgent && (
                      <div className="mt-2">
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Information card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>1.</strong> Crea una solicitud detallada del servicio que necesitas</p>
            <p><strong>2.</strong> Los profesionales verificados verán tu solicitud</p>
            <p><strong>3.</strong> Te contactarán directamente para coordinar el trabajo</p>
            <p><strong>4.</strong> Selecciona el profesional que mejor se adapte a tus necesidades</p>
            <p className="text-slate-500 italic mt-4">
              ServiciosHogar.com.ar actúa como intermediario. La plataforma no garantiza ni participa en la ejecución de los trabajos.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}