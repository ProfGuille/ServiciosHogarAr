import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { 
  MapPin, 
  Navigation, 
  Route, 
  Star, 
  DollarSign,
  Clock,
  Filter,
  Map,
  List,
  Target,
  Zap,
  Phone
} from 'lucide-react';
import { LeafletMap } from '@/components/maps/LeafletMap';
import { LocationPicker } from '@/components/maps/LocationPicker';

interface Provider {
  id: number;
  businessName: string;
  city: string;
  averageRating: number;
  totalReviews: number;
  credits: number;
  isVerified: boolean;
  phone: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  services?: {
    id: number;
    name: string;
    basePrice: number;
  }[];
}

interface LocationBasedSearchProps {
  initialCategory?: string;
  className?: string;
}

export function LocationBasedSearch({ initialCategory, className = "" }: LocationBasedSearchProps) {
  const { trackServiceSearch } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [radiusKm, setRadiusKm] = useState([10]);
  const [minRating, setMinRating] = useState([0]);
  const [maxPrice, setMaxPrice] = useState([50000]);
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    getCurrentLocation,
    calculateDistance 
  } = useGeolocation({ autoUpdate: true });

  // Categories query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      return response.json();
    },
  });

  // Current location to use for search (user location or manually selected)
  const searchLocation = selectedLocation || userLocation;

  // Providers query with location filtering
  const { data: providers = [], isLoading, refetch } = useQuery<Provider[]>({
    queryKey: ['providers', 'location-search', {
      category: selectedCategory,
      location: searchLocation,
      radius: radiusKm[0],
      minRating: minRating[0],
      maxPrice: maxPrice[0],
      sortBy,
      searchTerm
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (searchLocation) {
        params.append('latitude', searchLocation.lat.toString());
        params.append('longitude', searchLocation.lng.toString());
        params.append('radius', radiusKm[0].toString());
      }
      params.append('minRating', minRating[0].toString());
      params.append('maxPrice', maxPrice[0].toString());
      params.append('sortBy', sortBy);

      const response = await apiRequest('GET', `/api/providers/location-search?${params}`);
      return response.json();
    },
    enabled: !!searchLocation,
  });

  // Calculate distances and enhance provider data
  const enhancedProviders = useMemo(() => {
    if (!searchLocation) return providers;

    return providers.map(provider => {
      const distance = provider.latitude && provider.longitude
        ? calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            provider.latitude,
            provider.longitude
          )
        : null;

      return {
        ...provider,
        distance: distance ? Math.round(distance * 10) / 10 : null
      };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 999) - (b.distance || 999);
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'price':
          const aPrice = a.services?.[0]?.basePrice || 0;
          const bPrice = b.services?.[0]?.basePrice || 0;
          return aPrice - bPrice;
        default:
          return 0;
      }
    });
  }, [providers, searchLocation, calculateDistance, sortBy]);

  // Track search analytics
  useEffect(() => {
    if (searchTerm || selectedCategory) {
      trackServiceSearch(searchTerm, selectedCategory, enhancedProviders.length);
    }
  }, [searchTerm, selectedCategory, enhancedProviders.length, trackServiceSearch]);

  const handleLocationRequest = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSearch = () => {
    refetch();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const renderProviderCard = (provider: Provider) => (
    <Card key={provider.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-lg">{provider.businessName}</h3>
            {provider.isVerified && (
              <Badge variant="secondary" className="text-xs">Verificado</Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{provider.city}</span>
              {provider.distance && (
                <span className="text-blue-600 font-medium">
                  ({provider.distance} km)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{provider.averageRating}</span>
              <span className="text-gray-400">({provider.totalReviews})</span>
            </div>
          </div>

          {provider.services && provider.services.length > 0 && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Servicios: </span>
              {provider.services.slice(0, 2).map((service, index) => (
                <Badge key={service.id} variant="outline" className="mr-1 text-xs">
                  {service.name} - {formatPrice(service.basePrice)}
                </Badge>
              ))}
              {provider.services.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{provider.services.length - 2} más
                </span>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="default">
              Ver Detalles
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4 mr-1" />
              Contactar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Búsqueda por Ubicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4" />
              <span className="text-sm">
                {searchLocation 
                  ? `Ubicación: ${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}`
                  : 'Ubicación no disponible'
                }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {!userLocation && (
                <Button size="sm" onClick={handleLocationRequest} disabled={locationLoading}>
                  {locationLoading ? (
                    <Zap className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-1" />
                  )}
                  Obtener Ubicación
                </Button>
              )}
              <LocationPicker 
                onLocationSelect={setSelectedLocation}
                initialLocation={searchLocation}
              />
            </div>
          </div>

          {locationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {locationError}
            </div>
          )}

          {/* Search Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar Servicios</Label>
              <Input
                id="search"
                placeholder="Ej: plomero, electricista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort">Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distancia</SelectItem>
                  <SelectItem value="rating">Calificación</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="view">Vista</Label>
              <div className="flex rounded-md shadow-sm">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-l-none"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">
                Radio de búsqueda: {radiusKm[0]} km
              </Label>
              <Slider
                value={radiusKm}
                onValueChange={setRadiusKm}
                min={1}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Calificación mínima: {minRating[0]} estrellas
              </Label>
              <Slider
                value={minRating}
                onValueChange={setMinRating}
                min={0}
                max={5}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Precio máximo: {formatPrice(maxPrice[0])}
              </Label>
              <Slider
                value={maxPrice}
                onValueChange={setMaxPrice}
                min={1000}
                max={100000}
                step={1000}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={handleSearch} disabled={isLoading || !searchLocation}>
              <Filter className="h-4 w-4 mr-2" />
              Buscar Profesionales
            </Button>
            
            <span className="text-sm text-gray-600">
              {enhancedProviders.length} profesionales encontrados
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchLocation && (
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Zap className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Buscando profesionales...</p>
              </div>
            ) : enhancedProviders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No se encontraron profesionales</h3>
                  <p className="text-gray-600">
                    Intenta expandir el radio de búsqueda o cambiar los filtros.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {enhancedProviders.map(renderProviderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardContent className="p-0">
                <div style={{ height: '500px' }}>
                  <LeafletMap
                    center={searchLocation ? [searchLocation.lat, searchLocation.lng] : [undefined, undefined]}
                    zoom={12}
                    providers={enhancedProviders}
                    searchRadius={radiusKm[0]}
                    onProviderClick={(provider) => {
                      // Handle provider click
                      console.log('Provider clicked:', provider);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}