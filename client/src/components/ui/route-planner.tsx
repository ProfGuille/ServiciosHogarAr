import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Route, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Navigation, 
  Target,
  CheckCircle,
  Play,
  Square,
  AlertTriangle
} from 'lucide-react';

interface ServiceRequest {
  id: number;
  title: string;
  latitude: string;
  longitude: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  customerName: string;
  address: string;
}

interface RouteOptimizationResult {
  optimization: {
    id: number;
    totalDistanceKm: string;
    estimatedDurationMinutes: number;
    status: string;
  };
  waypoints: Array<{
    requestId: number;
    latitude: number;
    longitude: number;
    title: string;
    urgency: string;
  }>;
}

interface RoutePlannerProps {
  availableRequests: ServiceRequest[];
  currentLocation?: { lat: number; lng: number };
  onRouteOptimized?: (result: RouteOptimizationResult) => void;
  className?: string;
}

export function RoutePlanner({ 
  availableRequests, 
  currentLocation, 
  onRouteOptimized,
  className 
}: RoutePlannerProps) {
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteOptimizationResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const optimizeRouteMutation = useMutation({
    mutationFn: async (data: { requestIds: number[]; startLocation?: { lat: number; lng: number } }) => {
      return apiRequest("POST", "/api/geolocation/optimize-route", data);
    },
    onSuccess: (result) => {
      setOptimizedRoute(result);
      if (onRouteOptimized) {
        onRouteOptimized(result);
      }
      toast({
        title: "Ruta optimizada",
        description: `Ruta calculada para ${result.waypoints.length} paradas`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/route-optimizations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo optimizar la ruta",
        variant: "destructive",
      });
    }
  });

  const updateRouteStatusMutation = useMutation({
    mutationFn: async (data: { routeId: number; status: string }) => {
      return apiRequest("PATCH", `/api/geolocation/route-optimizations/${data.routeId}`, {
        status: data.status
      });
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la ruta se ha actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/route-optimizations'] });
    }
  });

  const handleRequestToggle = (requestId: number) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleOptimizeRoute = () => {
    if (selectedRequests.length === 0) {
      toast({
        title: "Selecciona solicitudes",
        description: "Debes seleccionar al menos una solicitud para optimizar la ruta",
        variant: "destructive",
      });
      return;
    }

    optimizeRouteMutation.mutate({
      requestIds: selectedRequests,
      startLocation: currentLocation
    });
  };

  const handleStartRoute = () => {
    if (optimizedRoute) {
      updateRouteStatusMutation.mutate({
        routeId: optimizedRoute.optimization.id,
        status: 'in_progress'
      });
    }
  };

  const handleCompleteRoute = () => {
    if (optimizedRoute) {
      updateRouteStatusMutation.mutate({
        routeId: optimizedRoute.optimization.id,
        status: 'completed'
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Location Status */}
      {currentLocation && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Ubicación actual detectada</span>
              <Badge variant="outline">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Solicitudes Disponibles ({availableRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No hay solicitudes disponibles para planificar ruta</p>
            </div>
          ) : (
            availableRequests.map((request) => (
              <div 
                key={request.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequests.includes(request.id) 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleRequestToggle(request.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{request.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getUrgencyColor(request.urgency)}`} />
                      <Badge variant="outline" className="text-xs">
                        {getUrgencyLabel(request.urgency)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Cliente: {request.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {request.address}
                    </p>
                    {request.scheduledDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(request.scheduledDate).toLocaleDateString()} {new Date(request.scheduledDate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    {selectedRequests.includes(request.id) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {availableRequests.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedRequests.length} de {availableRequests.length} seleccionadas
                </span>
                <Button 
                  onClick={handleOptimizeRoute}
                  disabled={selectedRequests.length === 0 || optimizeRouteMutation.isPending}
                  size="sm"
                >
                  <Route className="h-4 w-4 mr-2" />
                  {optimizeRouteMutation.isPending ? 'Optimizando...' : 'Optimizar Ruta'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimized Route Results */}
      {optimizedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ruta Optimizada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Statistics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {parseFloat(optimizedRoute.optimization.totalDistanceKm).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">km totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatDuration(optimizedRoute.optimization.estimatedDurationMinutes)}
                </div>
                <div className="text-sm text-muted-foreground">tiempo estimado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {optimizedRoute.waypoints.length}
                </div>
                <div className="text-sm text-muted-foreground">paradas</div>
              </div>
            </div>

            {/* Route Waypoints */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Orden de Visitas
              </h4>
              {optimizedRoute.waypoints.map((waypoint, index) => (
                <div key={waypoint.requestId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{waypoint.title}</div>
                    <div className="text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${getUrgencyColor(waypoint.urgency)}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Route Actions */}
            <Separator />
            <div className="flex gap-2">
              <Button 
                onClick={handleStartRoute}
                disabled={updateRouteStatusMutation.isPending || optimizedRoute.optimization.status === 'in_progress'}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {optimizedRoute.optimization.status === 'in_progress' ? 'Ruta Iniciada' : 'Iniciar Ruta'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCompleteRoute}
                disabled={updateRouteStatusMutation.isPending || optimizedRoute.optimization.status !== 'in_progress'}
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Completar Ruta
              </Button>
            </div>

            {/* Route Status */}
            <div className="flex items-center justify-center">
              <Badge variant={
                optimizedRoute.optimization.status === 'completed' ? 'default' :
                optimizedRoute.optimization.status === 'in_progress' ? 'secondary' :
                'outline'
              }>
                {optimizedRoute.optimization.status === 'planned' && 'Planificada'}
                {optimizedRoute.optimization.status === 'in_progress' && 'En Progreso'}
                {optimizedRoute.optimization.status === 'completed' && 'Completada'}
                {optimizedRoute.optimization.status === 'cancelled' && 'Cancelada'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}