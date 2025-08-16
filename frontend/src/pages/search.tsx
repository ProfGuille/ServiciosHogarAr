import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch as useWouterSearch } from 'wouter';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { EnhancedSearchBar } from '@/components/search/enhanced-search-bar';
import { AdvancedSearchFilters } from '@/components/search/advanced-search-filters';
import { SearchResults } from '@/components/search/search-results';
import { SavedSearches } from '@/components/search/saved-searches';
import { QuickFilters } from '@/components/search/quick-filters';
import { LeafletMap } from '@/components/maps/LeafletMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X, MapPin, List, Navigation, Loader2, Bookmark, TrendingUp, AlertCircle, Search as SearchIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface SearchFilters {
  query?: string;
  city?: string;
  province?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  hasReviews?: boolean;
  isVerified?: boolean;
  experienceYears?: number;
  languages?: string[];
  hasCredits?: boolean;
  sortBy?: string;
  // Geolocation filters - MVP3 Phase 3
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  useCurrentLocation?: boolean;
}

export default function Search() {
  const { toast } = useToast();
  const urlSearchParams = new URLSearchParams(useWouterSearch());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const itemsPerPage = 20;

  // Geolocation hook
  const { 
    location: userLocation, 
    getCurrentLocation, 
    loading: geoLoading,
    calculateDistance 
  } = useGeolocation();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const initialFilters: SearchFilters = {
      query: urlSearchParams.get('q') || '',
      city: urlSearchParams.get('city') || undefined,
      province: urlSearchParams.get('province') || undefined,
      sortBy: urlSearchParams.get('sortBy') || 'relevance',
    };

    // Parse category IDs
    const categoryIds = urlSearchParams.get('categories');
    if (categoryIds) {
      initialFilters.categoryIds = categoryIds.split(',').map(Number);
    }

    // Parse numeric filters
    const minPrice = urlSearchParams.get('minPrice');
    if (minPrice) initialFilters.minPrice = Number(minPrice);

    const maxPrice = urlSearchParams.get('maxPrice');
    if (maxPrice) initialFilters.maxPrice = Number(maxPrice);

    const minRating = urlSearchParams.get('minRating');
    if (minRating) initialFilters.minRating = Number(minRating);

    // Parse boolean filters
    if (urlSearchParams.get('verified') === 'true') {
      initialFilters.isVerified = true;
    }

    if (urlSearchParams.get('hasReviews') === 'true') {
      initialFilters.hasReviews = true;
    }

    if (urlSearchParams.get('hasCredits') === 'true') {
      initialFilters.hasCredits = true;
    }

    return initialFilters;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.city) params.set('city', filters.city);
    if (filters.province) params.set('province', filters.province);
    if (filters.categoryIds?.length) params.set('categories', filters.categoryIds.join(','));
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.isVerified) params.set('verified', 'true');
    if (filters.hasReviews) params.set('hasReviews', 'true');
    if (filters.hasCredits) params.set('hasCredits', 'true');
    if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Fetch categories for filters
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiRequest('GET', '/api/categories'),
  });

  // Fallback categories when API is not available
  const fallbackCategories = [
    { id: 1, name: "Plomería" },
    { id: 2, name: "Electricidad" },
    { id: 3, name: "Pintura" },
    { id: 4, name: "Limpieza" },
    { id: 5, name: "Carpintería" },
    { id: 6, name: "Gasista" },
    { id: 7, name: "Albañil" },
    { id: 8, name: "Técnico de aire" },
    { id: 9, name: "Jardinería" },
    { id: 10, name: "Cerrajero" },
    { id: 11, name: "Mudanzas" },
    { id: 12, name: "Herrero" }
  ];

  // Use fallback if categories API fails
  const displayCategories = categories || fallbackCategories;

  // Build search query params
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.city) params.set('city', filters.city);
    if (filters.province) params.set('province', filters.province);
    if (filters.categoryIds?.length) params.set('categoryIds', filters.categoryIds.join(','));
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined) params.set('minRating', filters.minRating.toString());
    if (filters.hasReviews) params.set('hasReviews', 'true');
    if (filters.isVerified) params.set('verified', 'true');
    if (filters.hasCredits) params.set('hasCredits', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    
    // Geolocation parameters - MVP3 Phase 3
    if (filters.latitude !== undefined) params.set('latitude', filters.latitude.toString());
    if (filters.longitude !== undefined) params.set('longitude', filters.longitude.toString());
    if (filters.radius !== undefined) params.set('radius', filters.radius.toString());
    
    params.set('limit', itemsPerPage.toString());
    params.set('offset', ((currentPage - 1) * itemsPerPage).toString());

    return params.toString();
  };

  // Fetch search results with better error handling
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/search/providers', filters, currentPage],
    queryFn: () => apiRequest('GET', `/api/search/providers?${buildSearchParams()}`),
    retry: false, // Don't retry failed requests
    // Add fallback data to prevent blank page
    placeholderData: {
      providers: [],
      total: 0,
      data: [],
      facets: {}
    }
  });

  // Handle backend unavailable state - be more permissive with error detection
  const isBackendUnavailable = error || (searchResults && !searchResults?.providers && !isLoading);

  // Process results to add distance if location is available
  const processedResults = React.useMemo(() => {
    if (!searchResults?.providers || !userLocation) {
      return searchResults;
    }

    const providersWithDistance = searchResults.providers.map((provider: any) => {
      if (provider.latitude && provider.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          provider.latitude,
          provider.longitude
        );
        return { ...provider, distance };
      }
      return provider;
    });

    // Sort by distance if location-based search
    if (filters.latitude && filters.longitude && filters.sortBy === 'distance') {
      providersWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return {
      ...searchResults,
      providers: providersWithDistance
    };
  }, [searchResults, userLocation, calculateDistance, filters.latitude, filters.longitude, filters.sortBy]);

  const handleSearch = (query: string, additionalFilters?: any) => {
    setFilters(prev => ({ 
      ...prev, 
      query,
      ...(additionalFilters || {})
    }));
    setCurrentPage(1);
  };

  // Handle loading saved search
  const handleLoadSavedSearch = (savedSearch: any) => {
    setFilters({
      query: savedSearch.query,
      ...savedSearch.filters
    });
    setCurrentPage(1);
  };

  // Handle removing individual filters
  const handleRemoveFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setFilters({ sortBy: 'relevance' });
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Location-related handlers - MVP3 Phase 3
  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setFilters(prev => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
        useCurrentLocation: true,
        radius: prev.radius || 10, // Default 10km radius
        sortBy: 'distance'
      }));
      setCurrentPage(1);
      
      toast({
        title: "Ubicación actualizada",
        description: "Se activó la búsqueda por cercanía.",
      });
    } catch (error) {
      toast({
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación actual.",
        variant: "destructive",
      });
    }
  };

  const handleRadiusChange = (radius: number) => {
    setFilters(prev => ({ ...prev, radius }));
    setCurrentPage(1);
  };

  const handleClearLocation = () => {
    setFilters(prev => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
      radius: undefined,
      useCurrentLocation: false,
      sortBy: prev.sortBy === 'distance' ? 'relevance' : prev.sortBy
    }));
    setCurrentPage(1);
  };

  const handleProviderClick = (provider: any) => {
    // Navigate to provider profile or open chat
    window.location.href = `/profesional/${provider.id}`;
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'sortBy' && key !== 'query' && value !== undefined && value !== ''
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <EnhancedSearchBar 
            onSearch={handleSearch} 
            initialQuery={filters.query || ''}
            showLocation={true}
            placeholder="Buscar servicios, profesionales, categorías..."
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop filters sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            {/* Saved Searches */}
            <SavedSearches
              currentFilters={filters}
              currentQuery={filters.query || ''}
              onLoadSearch={handleLoadSavedSearch}
            />
            
            <Separator />
            
            {/* Advanced Filters */}
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={displayCategories || []}
              facets={processedResults?.facets}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Location controls and view toggle - MVP3 Phase 3 */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Button
                      variant={filters.useCurrentLocation ? "default" : "outline"}
                      onClick={handleUseCurrentLocation}
                      disabled={geoLoading}
                      size="sm"
                    >
                      {geoLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 mr-2" />
                      )}
                      Cerca de mí
                    </Button>

                    {filters.useCurrentLocation && (
                      <>
                        <div className="flex items-center gap-2">
                          <select 
                            value={filters.radius || 10}
                            onChange={(e) => handleRadiusChange(Number(e.target.value))}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value={1}>1 km</option>
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                            <option value={20}>20 km</option>
                            <option value={50}>50 km</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearLocation}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          Búsqueda por ubicación activa
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4 mr-2" />
                      Lista
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Mapa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick filters and results header */}
            <div className="space-y-4">
              {/* Quick filters */}
              <QuickFilters
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />

              {/* Results summary */}
              {processedResults && (
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="text-sm text-gray-600">
                    {processedResults.total > 0 ? (
                      <>
                        <span className="font-medium">{processedResults.total}</span> resultado{processedResults.total !== 1 ? 's' : ''} encontrado{processedResults.total !== 1 ? 's' : ''}
                        {filters.query && (
                          <span> para "<span className="font-medium">{filters.query}</span>"</span>
                        )}
                        {filters.useCurrentLocation && (
                          <span> cerca de tu ubicación</span>
                        )}
                      </>
                    ) : (
                      <span>No se encontraron resultados</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Página {currentPage} de {Math.ceil((processedResults?.total || 0) / itemsPerPage)}
                  </div>
                </div>
              )}
            </div>

            {/* Backend unavailable message */}
            {isBackendUnavailable && (
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-900 mb-2">Sistema de búsqueda temporalmente no disponible</h3>
                      <p className="text-orange-700 text-sm mb-4">
                        Los servicios de búsqueda están en mantenimiento. Por el momento, puedes navegar directamente a los servicios específicos desde el menú principal.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link href="/servicios/plomeria">
                          <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100">
                            Ver Plomería
                          </Button>
                        </Link>
                        <Link href="/servicios/electricidad">
                          <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100">
                            Ver Electricidad
                          </Button>
                        </Link>
                        <Link href="/servicios">
                          <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100">
                            Ver Todos los Servicios
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No professionals found message */}
            {!isBackendUnavailable && !isLoading && processedResults && processedResults.total === 0 && filters.query && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <SearchIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 mb-2">Buscaremos profesionales en tu área</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        No encontramos {filters.query.toLowerCase()} en tu ubicación actual, pero te ayudaremos a encontrar los mejores profesionales disponibles. Te contactaremos pronto con opciones.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100" onClick={() => {
                          // In a real app, this would trigger an admin notification
                          toast({
                            title: "Solicitud registrada",
                            description: `Te contactaremos pronto con profesionales de ${filters.query} en tu área.`,
                          });
                        }}>
                          Solicitar Búsqueda
                        </Button>
                        <Link href="/servicios">
                          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                            Ver Otros Servicios
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results display */}
            {isLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-slate-600">Buscando profesionales...</p>
                </CardContent>
              </Card>
            ) : viewMode === 'list' ? (
              <SearchResults
                providers={processedResults?.data || processedResults?.providers || []}
                isLoading={isLoading}
                total={processedResults?.total || 0}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                showDistance={filters.useCurrentLocation}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Mapa de Proveedores
                    {processedResults?.data && (
                      <Badge variant="secondary">
                        {(processedResults.data || processedResults.providers || []).length} resultados
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <LeafletMap
                    center={
                      userLocation && filters.useCurrentLocation 
                        ? [userLocation.lat, userLocation.lng]
                        : [-34.6037, -58.3816] // Buenos Aires default
                    }
                    zoom={filters.radius ? Math.max(10, 16 - Math.log2(filters.radius)) : 13}
                    providers={processedResults?.data || processedResults?.providers || []}
                    userLocation={userLocation && filters.useCurrentLocation ? userLocation : undefined}
                    searchRadius={filters.radius}
                    onProviderClick={handleProviderClick}
                    height="600px"
                  />
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filters modal */}
      {showMobileFilters && (
        <AdvancedSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={displayCategories || []}
          facets={processedResults?.facets}
          showMobileFilters={showMobileFilters}
          onCloseMobileFilters={() => setShowMobileFilters(false)}
        />
      )}

      <Footer />
    </div>
  );
}