import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Search, MapPin, Loader2, TrendingUp, Clock } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  showLocation?: boolean;
  currentLocation?: { lat: number; lng: number; city?: string };
  className?: string;
}

export function SearchBar({
  onSearch,
  initialQuery = '',
  placeholder = '¿Qué servicio necesitas?',
  showSuggestions = true,
  showLocation = true,
  currentLocation,
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch search suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/search/suggestions', debouncedQuery],
    queryFn: () => apiRequest('GET', `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: showSuggestions && debouncedQuery.length >= 2 && isFocused,
  });

  // Fetch popular searches
  const { data: popularSearches } = useQuery({
    queryKey: ['/api/search/popular'],
    queryFn: () => apiRequest('GET', '/api/search/popular'),
    enabled: showSuggestions && !query && isFocused,
  });

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions?.suggestions || popularSearches?.searches || [];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          const selectedItem = items[selectedIndex];
          const selectedQuery = typeof selectedItem === 'string' ? selectedItem : selectedItem.term;
          setQuery(selectedQuery);
          onSearch(selectedQuery);
          setIsFocused(false);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setIsFocused(false);
  };

  const showDropdown = isFocused && showSuggestions && (
    (query.length >= 2 && suggestions?.suggestions?.length > 0) ||
    (!query && popularSearches?.searches?.length > 0)
  );

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-4 h-12 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        {showLocation && currentLocation && (
          <div className="hidden md:flex items-center gap-2 px-4 bg-muted rounded-md">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{currentLocation.city || 'Mi ubicación'}</span>
          </div>
        )}

        <Button onClick={handleSearch} size="lg" className="px-8">
          Buscar
        </Button>
      </div>

      {/* Search suggestions dropdown */}
      {showDropdown && (
        <Card className="absolute z-50 w-full mt-2 p-0 shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {/* Loading state */}
            {suggestionsLoading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Suggestions */}
            {query.length >= 2 && suggestions?.suggestions && (
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-muted-foreground">Sugerencias</div>
                {suggestions.suggestions.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2 ${
                      selectedIndex === index ? 'bg-muted' : ''
                    }`}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches */}
            {!query && popularSearches?.searches && (
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Búsquedas populares
                </div>
                {popularSearches.searches.map((search: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search.term)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center justify-between ${
                      selectedIndex === index ? 'bg-muted' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {search.term}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {search.count.toLocaleString()}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}