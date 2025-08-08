import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookmarkPlus, 
  Bookmark, 
  X, 
  MapPin, 
  DollarSign,
  Star,
  Clock,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    city?: string;
    province?: string;
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    radius?: number;
    sortBy?: string;
  };
  createdAt: Date;
  resultCount?: number;
}

interface SavedSearchesProps {
  currentFilters: any;
  currentQuery: string;
  onLoadSearch: (search: SavedSearch) => void;
  className?: string;
}

export function SavedSearches({
  currentFilters,
  currentQuery,
  onLoadSearch,
  className
}: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSavedSearches(saved.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt)
    })));
  }, []);

  // Save search to localStorage
  const saveSearch = (name: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: currentQuery,
      filters: currentFilters,
      createdAt: new Date()
    };

    const updated = [newSearch, ...savedSearches.slice(0, 9)]; // Keep max 10
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    setShowSaveModal(false);
    setSearchName('');
  };

  // Delete saved search
  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Check if current search is similar to a saved one
  const isSimilarToSaved = (search: SavedSearch) => {
    return search.query === currentQuery && 
           JSON.stringify(search.filters) === JSON.stringify(currentFilters);
  };

  // Generate filter description
  const getFilterDescription = (search: SavedSearch) => {
    const descriptions = [];
    
    if (search.filters.city) {
      descriptions.push(`📍 ${search.filters.city}`);
    }
    
    if (search.filters.minPrice || search.filters.maxPrice) {
      const min = search.filters.minPrice || 0;
      const max = search.filters.maxPrice || '∞';
      descriptions.push(`💰 $${min} - $${max}`);
    }
    
    if (search.filters.minRating) {
      descriptions.push(`⭐ ${search.filters.minRating}+`);
    }
    
    if (search.filters.radius) {
      descriptions.push(`📍 ${search.filters.radius}km`);
    }

    return descriptions;
  };

  const hasActiveFilters = currentQuery || Object.keys(currentFilters).some(
    key => currentFilters[key] !== undefined && currentFilters[key] !== ''
  );

  const alreadySaved = savedSearches.some(s => isSimilarToSaved(s));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Save Current Search */}
      {hasActiveFilters && !alreadySaved && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  ¿Guardar esta búsqueda?
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveModal(true)}
              >
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5" />
              Guardar Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nombre de la búsqueda
              </label>
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Ej: Plomeros en CABA"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchName.trim()) {
                    saveSearch(searchName.trim());
                  }
                }}
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Se guardará:</div>
              <div>• Consulta: "{currentQuery || 'Sin texto'}"</div>
              {getFilterDescription({ filters: currentFilters } as SavedSearch).map((desc, i) => (
                <div key={i}>• {desc}</div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => searchName.trim() && saveSearch(searchName.trim())}
                disabled={!searchName.trim()}
                className="flex-1"
              >
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveModal(false);
                  setSearchName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches List */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Búsquedas Guardadas
              <Badge variant="secondary" className="ml-auto">
                {savedSearches.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className={cn(
                    "border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer",
                    isSimilarToSaved(search) && "border-blue-200 bg-blue-50"
                  )}
                  onClick={() => onLoadSearch(search)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {search.name}
                        {isSimilarToSaved(search) && (
                          <Badge variant="outline" className="text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                      
                      {search.query && (
                        <div className="text-xs text-gray-600 mt-1">
                          "{search.query}"
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {getFilterDescription(search).map((desc, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {desc}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {search.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSearch(search.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}