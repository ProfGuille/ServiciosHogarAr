import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Loader2, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { geocodingService, type GeocodeResult } from '@/services/geocoding';
import { useToast } from '@/hooks/use-toast';

// Fix Leaflet icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
  showAddressSearch?: boolean;
  placeholder?: string;
  className?: string;
}

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

// Component to handle map click events
function MapClickHandler({ 
  onLocationClick 
}: { 
  onLocationClick: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  height = "400px",
  showAddressSearch = true,
  placeholder = "Buscar dirección...",
  className = ""
}: LocationPickerProps) {
  const { toast } = useToast();
  const { 
    location: userLocation, 
    getCurrentLocation, 
    loading: geoLoading 
  } = useGeolocation();

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : [-34.6037, -58.3816] // Buenos Aires default
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocodingClick, setIsGeocodingClick] = useState(false);

  // Initialize with initial location if provided
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation({
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        address: 'Ubicación seleccionada'
      });
    }
  }, [initialLocation]);

  // Search for addresses
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await geocodingService.searchPlaces(query, 'ar', 5);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Error de búsqueda",
        description: "No se pudo buscar la dirección. Intenta de nuevo.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Handle location click on map
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setIsGeocodingClick(true);
    try {
      const result = await geocodingService.reverseGeocode(lat, lng);
      const location = {
        lat,
        lng,
        address: result.displayName
      };
      
      setSelectedLocation(location);
      setMapCenter([lat, lng]);
      onLocationSelect(location);
    } catch (error) {
      toast({
        title: "Error de geocodificación",
        description: "No se pudo obtener la dirección de esta ubicación.",
        variant: "destructive",
      });
    } finally {
      setIsGeocodingClick(false);
    }
  }, [onLocationSelect, toast]);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: GeocodeResult) => {
    const location = {
      lat: result.lat,
      lng: result.lng,
      address: result.displayName
    };
    
    setSelectedLocation(location);
    setMapCenter([result.lat, result.lng]);
    setSearchQuery(result.displayName);
    setSearchResults([]);
    onLocationSelect(location);
  }, [onLocationSelect]);

  // Get current GPS location
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      const result = await geocodingService.reverseGeocode(location.lat, location.lng);
      
      const selectedLoc = {
        lat: location.lat,
        lng: location.lng,
        address: result.displayName
      };
      
      setSelectedLocation(selectedLoc);
      setMapCenter([location.lat, location.lng]);
      setSearchQuery(result.displayName);
      onLocationSelect(selectedLoc);
      
      toast({
        title: "Ubicación obtenida",
        description: "Se obtuvo tu ubicación actual correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación actual.",
        variant: "destructive",
      });
    }
  }, [getCurrentLocation, onLocationSelect, toast]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Search */}
      {showAddressSearch && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Seleccionar Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <Button
                onClick={handleGetCurrentLocation}
                variant="outline"
                disabled={geoLoading}
              >
                {geoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                    onClick={() => handleSearchResultSelect(result)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.address.street || result.address.city}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.displayName}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    Ubicación seleccionada
                  </p>
                  <p className="text-xs text-green-600 truncate">
                    {selectedLocation.address}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <div className="relative" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationClick={handleMapClick} />
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
          )}
        </MapContainer>

        {/* Loading overlay for geocoding */}
        {isGeocodingClick && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-md">
            <div className="bg-white p-3 rounded-md shadow-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Obteniendo dirección...</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        💡 Tip: Busca una dirección arriba o haz clic en el mapa para seleccionar una ubicación
      </div>
    </div>
  );
}