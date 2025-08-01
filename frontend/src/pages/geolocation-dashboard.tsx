import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  MapPin, 
  Navigation, 
  Route, 
  Target, 
  Clock, 
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  Circle,
  Timer
} from 'lucide-react';
import { LocationTracker } from '@/components/ui/location-tracker';
import { RoutePlanner } from '@/components/ui/route-planner';

interface ServiceArea {
  id: number;
  name: string;
  centerLat: string;
  centerLng: string;
  radiusKm: string;
  priority: number;
  maxDailyJobs: number;
  travelCostPerKm: string;
  isActive: boolean;
}

interface ProviderLocation {
  id: number;
  latitude: string;
  longitude: string;
  accuracy: string;
  timestamp: string;
  address: string;
  locationSource: string;
}

interface RouteOptimization {
  id: number;
  date: string;
  totalDistanceKm: string;
  estimatedDurationMinutes: number;
  actualDurationMinutes: number;
  status: string;
  waypoints: any[];
  optimizationAlgorithm: string;
}

interface LocationEvent {
  id: number;
  eventType: string;
  latitude: string;
  longitude: string;
  timestamp: string;
  metadata: any;
}

interface CoverageStats {
  serviceAreas: number;
  totalCoverageKm2: number;
  averageServiceRadius: number;
  recentLocationCount: number;
  lastLocationUpdate: string;
}

export default function GeolocationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newServiceArea, setNewServiceArea] = useState({
    name: '',
    centerLat: '',
    centerLng: '',
    radiusKm: '',
    priority: 1,
    maxDailyJobs: 10,
    travelCostPerKm: '0.00'
  });

  // Fetch provider's service areas
  const { data: serviceAreas, isLoading: areasLoading } = useQuery<ServiceArea[]>({
    queryKey: ['/api/geolocation/service-areas', user?.id],
    enabled: !!user,
  });

  // Fetch current location
  const { data: providerLocation } = useQuery<ProviderLocation>({
    queryKey: ['/api/geolocation/provider-location'],
    enabled: !!user,
  });

  // Fetch route optimizations
  const { data: routeOptimizations, isLoading: routesLoading } = useQuery<RouteOptimization[]>({
    queryKey: ['/api/geolocation/route-optimizations'],
    enabled: !!user,
  });

  // Fetch location events
  const { data: locationEvents } = useQuery<LocationEvent[]>({
    queryKey: ['/api/geolocation/location-events'],
    enabled: !!user,
  });

  // Fetch coverage stats
  const { data: coverageStats } = useQuery<CoverageStats>({
    queryKey: ['/api/geolocation/coverage-stats'],
    enabled: !!user,
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (location: {latitude: number, longitude: number, accuracy?: number}) => {
      return apiRequest("POST", "/api/geolocation/provider-location", location);
    },
    onSuccess: () => {
      toast({
        title: "Ubicación actualizada",
        description: "Tu ubicación se ha actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/provider-location'] });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/location-events'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ubicación.",
        variant: "destructive",
      });
    }
  });

  // Create service area mutation
  const createServiceAreaMutation = useMutation({
    mutationFn: async (serviceArea: any) => {
      return apiRequest("POST", "/api/geolocation/service-areas", serviceArea);
    },
    onSuccess: () => {
      toast({
        title: "Área de servicio creada",
        description: "El área de servicio se ha creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/service-areas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/coverage-stats'] });
      setNewServiceArea({
        name: '',
        centerLat: '',
        centerLng: '',
        radiusKm: '',
        priority: 1,
        maxDailyJobs: 10,
        travelCostPerKm: '0.00'
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el área de servicio.",
        variant: "destructive",
      });
    }
  });

  // Get current location from browser
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          updateLocationMutation.mutate({
            latitude,
            longitude,
            accuracy
          });
        },
        (error) => {
          toast({
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación actual.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  // Auto-update location every 5 minutes if enabled
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.userType === 'provider') {
        getCurrentLocation();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const handleCreateServiceArea = () => {
    if (!newServiceArea.name || !newServiceArea.centerLat || !newServiceArea.centerLng || !newServiceArea.radiusKm) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    createServiceAreaMutation.mutate(newServiceArea);
  };

  const useCurrentLocationForArea = () => {
    if (currentLocation) {
      setNewServiceArea(prev => ({
        ...prev,
        centerLat: currentLocation.lat.toString(),
        centerLng: currentLocation.lng.toString()
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { variant: 'secondary' as const, label: 'Planificado' },
      in_progress: { variant: 'default' as const, label: 'En Progreso' },
      completed: { variant: 'success' as const, label: 'Completado' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'enter_geofence':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exit_geofence':
        return <Circle className="h-4 w-4 text-gray-500" />;
      case 'arrive_job':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'complete_job':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user || user.userType !== 'provider') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Esta funcionalidad está disponible solo para proveedores de servicios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de Geolocalización</h1>
          <p className="text-muted-foreground">
            Gestiona tu ubicación, áreas de servicio y optimización de rutas
          </p>
        </div>
        <Button onClick={getCurrentLocation} disabled={updateLocationMutation.isPending}>
          <Navigation className="h-4 w-4 mr-2" />
          {updateLocationMutation.isPending ? 'Actualizando...' : 'Actualizar Ubicación'}
        </Button>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Áreas de Servicio</p>
                <p className="text-2xl font-bold">{coverageStats?.serviceAreas || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Circle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Cobertura Total</p>
                <p className="text-2xl font-bold">{coverageStats?.totalCoverageKm2 || 0} km²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Radio Promedio</p>
                <p className="text-2xl font-bold">{coverageStats?.averageServiceRadius?.toFixed(1) || 0} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                <p className="text-sm font-bold">
                  {coverageStats?.lastLocationUpdate 
                    ? new Date(coverageStats.lastLocationUpdate).toLocaleDateString()
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="location" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="location">Ubicación Actual</TabsTrigger>
          <TabsTrigger value="areas">Áreas de Servicio</TabsTrigger>
          <TabsTrigger value="routes">Optimización de Rutas</TabsTrigger>
          <TabsTrigger value="events">Eventos de Ubicación</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="space-y-6">
          <LocationTracker 
            onLocationUpdate={(location) => {
              updateLocationMutation.mutate(location);
            }}
            autoTrack={false}
          />
          
          {providerLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Historial de Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Latitud</Label>
                      <Input value={providerLocation.latitude} readOnly />
                    </div>
                    <div>
                      <Label>Longitud</Label>
                      <Input value={providerLocation.longitude} readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Precisión GPS</Label>
                      <Input value={`${providerLocation.accuracy} metros`} readOnly />
                    </div>
                    <div>
                      <Label>Última Actualización</Label>
                      <Input value={new Date(providerLocation.timestamp).toLocaleString()} readOnly />
                    </div>
                  </div>
                  {providerLocation.address && (
                    <div>
                      <Label>Dirección</Label>
                      <Input value={providerLocation.address} readOnly />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="areas" className="space-y-6">
          {/* Create New Service Area */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Área de Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="areaName">Nombre del Área</Label>
                  <Input
                    id="areaName"
                    placeholder="Ej: Buenos Aires Norte"
                    value={newServiceArea.name}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="radiusKm">Radio (km)</Label>
                  <Input
                    id="radiusKm"
                    type="number"
                    placeholder="15"
                    value={newServiceArea.radiusKm}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, radiusKm: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="centerLat">Latitud Central</Label>
                  <div className="flex gap-2">
                    <Input
                      id="centerLat"
                      placeholder="-34.6037"
                      value={newServiceArea.centerLat}
                      onChange={(e) => setNewServiceArea(prev => ({ ...prev, centerLat: e.target.value }))}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={useCurrentLocationForArea}
                      disabled={!currentLocation}
                    >
                      Usar Actual
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="centerLng">Longitud Central</Label>
                  <Input
                    id="centerLng"
                    placeholder="-58.3816"
                    value={newServiceArea.centerLng}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, centerLng: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newServiceArea.priority}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxJobs">Máx. Trabajos Diarios</Label>
                  <Input
                    id="maxJobs"
                    type="number"
                    min="1"
                    value={newServiceArea.maxDailyJobs}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, maxDailyJobs: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="travelCost">Costo por km</Label>
                  <Input
                    id="travelCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newServiceArea.travelCostPerKm}
                    onChange={(e) => setNewServiceArea(prev => ({ ...prev, travelCostPerKm: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateServiceArea} 
                disabled={createServiceAreaMutation.isPending}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                {createServiceAreaMutation.isPending ? 'Creando...' : 'Crear Área de Servicio'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Áreas de Servicio Activas</CardTitle>
            </CardHeader>
            <CardContent>
              {areasLoading ? (
                <div className="text-center py-4">Cargando áreas...</div>
              ) : serviceAreas && serviceAreas.length > 0 ? (
                <div className="space-y-4">
                  {serviceAreas.map((area) => (
                    <div key={area.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{area.name}</h3>
                        <Badge variant={area.isActive ? "default" : "secondary"}>
                          {area.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Radio:</span> {area.radiusKm} km
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prioridad:</span> {area.priority}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Máx. trabajos:</span> {area.maxDailyJobs}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Centro: {parseFloat(area.centerLat).toFixed(4)}, {parseFloat(area.centerLng).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No tienes áreas de servicio configuradas. Crea una para comenzar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <RoutePlanner 
            availableRequests={[]} // TODO: Connect to actual service requests
            currentLocation={currentLocation}
            onRouteOptimized={(result) => {
              console.log('Route optimized:', result);
              // Refresh route optimizations query
              queryClient.invalidateQueries({ queryKey: ['/api/geolocation/route-optimizations'] });
            }}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="h-5 w-5 mr-2" />
                Historial de Rutas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {routesLoading ? (
                <div className="text-center py-4">Cargando rutas...</div>
              ) : routeOptimizations && routeOptimizations.length > 0 ? (
                <div className="space-y-4">
                  {routeOptimizations.map((route) => (
                    <div key={route.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          <span className="font-semibold">
                            Ruta {new Date(route.date).toLocaleDateString()}
                          </span>
                        </div>
                        {getStatusBadge(route.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Distancia:</span> {route.totalDistanceKm} km
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tiempo estimado:</span> {route.estimatedDurationMinutes} min
                        </div>
                        <div>
                          <span className="text-muted-foreground">Paradas:</span> {route.waypoints?.length || 0}
                        </div>
                      </div>
                      {route.actualDurationMinutes && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Tiempo real:</span> {route.actualDurationMinutes} min
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay rutas optimizadas disponibles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Eventos de Ubicación Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationEvents && locationEvents.length > 0 ? (
                <div className="space-y-3">
                  {locationEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getEventIcon(event.eventType)}
                      <div className="flex-1">
                        <div className="font-medium">
                          {event.eventType === 'enter_geofence' && 'Entrada a zona'}
                          {event.eventType === 'exit_geofence' && 'Salida de zona'}
                          {event.eventType === 'arrive_job' && 'Llegada a trabajo'}
                          {event.eventType === 'complete_job' && 'Trabajo completado'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {parseFloat(event.latitude).toFixed(4)}, {parseFloat(event.longitude).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay eventos de ubicación registrados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}