import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface LocationTrackerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number; accuracy?: number }) => void;
  autoTrack?: boolean;
  className?: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function LocationTracker({ onLocationUpdate, autoTrack = false, className }: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleLocationSuccess = (position: GeolocationPosition) => {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    };

    setLocation(newLocation);
    setError(null);
    
    if (onLocationUpdate) {
      onLocationUpdate({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        accuracy: newLocation.accuracy
      });
    }
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    let errorMessage = 'Error desconocido al obtener ubicación';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permisos de ubicación denegados';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Información de ubicación no disponible';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado al obtener ubicación';
        break;
    }
    
    setError(errorMessage);
    setTracking(false);
    
    toast({
      title: "Error de ubicación",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador');
      return;
    }

    setTracking(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    if (autoTrack) {
      // Continuous tracking
      const id = navigator.geolocation.watchPosition(
        handleLocationSuccess,
        handleLocationError,
        options
      );
      setWatchId(id);
    } else {
      // One-time position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSuccess(position);
          setTracking(false);
        },
        (error) => {
          handleLocationError(error);
          setTracking(false);
        },
        options
      );
    }
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setTracking(false);
  };

  useEffect(() => {
    if (autoTrack) {
      startTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [autoTrack]);

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 1000) {
      return `${Math.round(accuracy)}m`;
    }
    return `${(accuracy / 1000).toFixed(1)}km`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return 'text-green-600';
    if (accuracy <= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación GPS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tracking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">Obteniendo ubicación...</span>
              </>
            ) : location ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Ubicación actualizada</span>
              </>
            ) : error ? (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Error de ubicación</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Sin ubicación</span>
              </>
            )}
          </div>
          
          {autoTrack ? (
            <Button
              variant={tracking ? "destructive" : "default"}
              size="sm"
              onClick={tracking ? stopTracking : startTracking}
            >
              {tracking ? 'Detener' : 'Iniciar'} Seguimiento
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startTracking}
              disabled={tracking}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          )}
        </div>

        {/* Location Details */}
        {location && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Latitud:</span>
                <div className="font-mono">{formatCoordinate(location.latitude)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Longitud:</span>
                <div className="font-mono">{formatCoordinate(location.longitude)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Precisión:</span>
                <span className={`font-medium ml-1 ${getAccuracyColor(location.accuracy)}`}>
                  {formatAccuracy(location.accuracy)}
                </span>
              </div>
              <div className="text-muted-foreground">
                {new Date(location.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* GPS Status Badges */}
        <div className="flex gap-2">
          <Badge variant={location ? "default" : "secondary"}>
            GPS {location ? 'Activo' : 'Inactivo'}
          </Badge>
          {location && (
            <Badge variant={location.accuracy <= 10 ? "default" : location.accuracy <= 50 ? "secondary" : "destructive"}>
              {location.accuracy <= 10 ? 'Alta Precisión' : location.accuracy <= 50 ? 'Precisión Media' : 'Baja Precisión'}
            </Badge>
          )}
          {autoTrack && (
            <Badge variant={tracking ? "default" : "secondary"}>
              {tracking ? 'Seguimiento Activo' : 'Seguimiento Pausado'}
            </Badge>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          {autoTrack 
            ? 'El seguimiento automático actualiza tu ubicación en tiempo real.'
            : 'Haz clic en "Actualizar" para obtener tu ubicación actual.'
          }
        </div>
      </CardContent>
    </Card>
  );
}