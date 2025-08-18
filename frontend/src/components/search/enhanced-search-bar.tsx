import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Tag,
  Navigation,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { apiRequest } from '@/lib/queryClient';
import { useDebounce } from '@/hooks/useDebounce';

// Common Argentine cities for location suggestions
const argentineCities = [
  'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán',
  'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Neuquén',
  'Santiago del Estero', 'Corrientes', 'Posadas', 'Bahía Blanca', 'Paraná',
  'Formosa', 'San Luis', 'Catamarca', 'La Rioja', 'Río Gallegos', 'Ushuaia',
  'San Fernando del Valle de Catamarca', 'San Salvador de Jujuy', 'Santa Rosa',
  'Rawson', 'Viedma', 'Villa Mercedes', 'Concepción del Uruguay', 'Tandil',
  'Olavarría', 'Pergamino', 'Azul', 'Junín', 'San Nicolás', 'Campana'
];

interface SearchSuggestion {
  type: 'business' | 'service' | 'category' | 'city' | 'term';
  text: string;
  category?: string | null;
  count?: number;
  icon?: string;
}

interface EnhancedSearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  initialQuery?: string;
  showLocation?: boolean;
  placeholder?: string;
  className?: string;
}

export function EnhancedSearchBar({
  onSearch,
  initialQuery = '',
  showLocation = false,
  placeholder = 'Buscar servicios, profesionales...',
  className
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { getCurrentLocation, loading: geoLoading } = useGeolocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query for autocomplete
  const debouncedQuery = useDebounce(query, 300);
  const debouncedLocation = useDebounce(location, 300);

  // Update location suggestions
  useEffect(() => {
    if (debouncedLocation.length >= 2) {
      const filtered = argentineCities.filter(city => 
        city.toLowerCase().includes(debouncedLocation.toLowerCase())
      ).slice(0, 8);
      setLocationSuggestions(filtered);
    } else {
      setLocationSuggestions([]);
    }
  }, [debouncedLocation]);

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const response = await apiRequest('GET', '/api/search-suggestions/popular');
        setPopularSearches(response.popular || []);
      } catch (error) {
        console.error('Error loading popular searches:', error);
        // Fallback popular searches when API is not available
        setPopularSearches([
          'Plomería',
          'Electricidad',
          'Pintura',
          'Limpieza',
          'Jardinería',
          'Carpintería',
          'Aire acondicionado',
          'Cerrajería'
        ]);
      }
    };

    loadPopularSearches();
    
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiRequest('GET', `/api/search-suggestions/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        setSuggestions(response.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback suggestions when API is not available
        const fallbackSuggestions = [
          'Plomería', 'Electricidad', 'Pintura', 'Limpieza', 'Jardinería', 
          'Carpintería', 'Aire acondicionado', 'Cerrajería', 'Albañilería',
          'Gasista', 'Herrería', 'Fumigación', 'Mudanzas', 'Vidriero', 'Tapicería'
        ].filter(service => 
          service.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).map(service => ({
          type: 'service' as const,
          text: service,
          category: 'Servicios'
        }));
        setSuggestions(fallbackSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...suggestions,
      ...(query.length < 2 ? popularSearches : []),
      ...(query.length < 2 ? recentSearches.map(text => ({ type: 'term' as const, text })) : [])
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSuggestionSelect(allSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    const searchTerm = suggestion.text;
    setQuery(searchTerm);
    setShowSuggestions(false);
    
    // Add to recent searches
    addToRecentSearches(searchTerm);
    
    // Perform search with additional context
    const filters: any = {};
    if (suggestion.type === 'city') {
      filters.city = searchTerm;
      onSearch('', filters);
    } else {
      onSearch(searchTerm, filters);
    }
  };

  // Handle regular search
  const handleSearch = () => {
    if (query.trim()) {
      addToRecentSearches(query.trim());
      onSearch(query.trim(), { city: location.trim() || undefined });
    }
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
  };

  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setShowLocationSuggestions(value.length >= 1);
  };

  // Handle location suggestion selection
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationSuggestions(false);
    locationInputRef.current?.blur();
  };

  // Add search to recent searches
  const addToRecentSearches = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle location search
  const handleLocationSearch = async () => {
    try {
      const location = await getCurrentLocation();
      onSearch(query, {
        latitude: location.lat,
        longitude: location.lng,
        useCurrentLocation: true,
        radius: 10,
        sortBy: 'distance'
      });
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'business': return <Briefcase className="w-4 h-4" />;
      case 'service': return <Tag className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      case 'city': return <MapPin className="w-4 h-4" />;
      case 'term': return <Search className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  // Prepare display suggestions
  const displaySuggestions = query.length >= 2 
    ? suggestions 
    : [...popularSearches.slice(0, 5), ...recentSearches.map(text => ({ type: 'term' as const, text }))];

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="relative flex items-center gap-2">
          {/* Main search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-10 py-3 text-lg border-2 focus:border-primary"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Location input */}
          {showLocation && (
            <div className="relative w-64">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={locationInputRef}
                type="text"
                placeholder="Ciudad"
                value={location}
                onChange={handleLocationChange}
                onFocus={() => setShowLocationSuggestions(location.length >= 1)}
                className="pl-10 pr-10 py-3 text-lg border-2 focus:border-primary"
              />
              {location && (
                <button
                  onClick={() => {
                    setLocation('');
                    setShowLocationSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            {showLocation && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleLocationSearch}
                disabled={geoLoading}
                className="px-4"
                title="Usar mi ubicación actual"
              >
                {geoLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </Button>
            )}
            
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="px-6"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <Card 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto shadow-lg"
          >
            <CardContent className="p-0">
              {isLoading && (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Buscando sugerencias...
                </div>
              )}
              
              {!isLoading && displaySuggestions.length === 0 && query.length >= 2 && (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron sugerencias
                </div>
              )}
              
              {!isLoading && displaySuggestions.length > 0 && (
                <div className="py-2">
                  {query.length < 2 && recentSearches.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Búsquedas recientes
                      </div>
                      {recentSearches.slice(0, 3).map((search, index) => (
                        <button
                          key={`recent-${search}`}
                          onClick={() => handleSuggestionSelect({ type: 'term', text: search })}
                          className={cn(
                            "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3",
                            selectedIndex === suggestions.length + popularSearches.length + index && "bg-gray-50"
                          )}
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </>
                  )}
                  
                  {query.length < 2 && popularSearches.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center gap-2 border-t">
                        <TrendingUp className="w-4 h-4" />
                        Búsquedas populares
                      </div>
                      {popularSearches.slice(0, 5).map((suggestion, index) => (
                        <button
                          key={`popular-${suggestion.text}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className={cn(
                            "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3",
                            selectedIndex === suggestions.length + index && "bg-gray-50"
                          )}
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <span>{suggestion.text}</span>
                            {suggestion.category && (
                              <span className="text-sm text-gray-500 ml-2">
                                en {suggestion.category}
                              </span>
                            )}
                          </div>
                          {suggestion.count && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.count}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                  
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${suggestion.text}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={cn(
                        "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3",
                        selectedIndex === index && "bg-gray-50"
                      )}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1">
                        <span>{suggestion.text}</span>
                        {suggestion.category && (
                          <span className="text-sm text-gray-500 ml-2">
                            en {suggestion.category}
                          </span>
                        )}
                      </div>
                      {suggestion.count && suggestion.count > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location Suggestions Dropdown */}
        {showLocationSuggestions && showLocation && locationSuggestions.length > 0 && (
          <Card className="absolute top-full right-0 w-64 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
            <CardContent className="p-0">
              <div className="py-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ciudades sugeridas
                </div>
                {locationSuggestions.map((city, index) => (
                  <button
                    key={`location-${city}`}
                    onClick={() => handleLocationSelect(city)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Click outside handler */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}