import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  DollarSign,
  Star,
  Award,
  Clock,
  Globe,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';

interface SearchFilters {
  // Location
  city?: string;
  province?: string;
  radiusKm?: number;
  
  // Categories
  categoryIds?: number[];
  
  // Price
  minPrice?: number;
  maxPrice?: number;
  
  // Rating
  minRating?: number;
  hasReviews?: boolean;
  
  // Provider attributes
  isVerified?: boolean;
  experienceYears?: number;
  languages?: string[];
  hasCredits?: boolean;
  
  // Availability & Response Time (Phase 4)
  availability?: string; // 'today', 'tomorrow', 'week', 'anytime'
  responseTime?: string; // 'fast', 'medium', 'slow'
  
  // Sorting
  sortBy?: string;
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories?: Array<{ id: number; name: string }>;
  cities?: Array<{ name: string; count: number }>;
  showMobileFilters?: boolean;
  onCloseMobileFilters?: () => void;
  facets?: {
    cities: { name: string; count: number }[];
    categories: { id: number; name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

export function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  categories = [],
  cities = [],
  showMobileFilters = false,
  onCloseMobileFilters,
  facets
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = { sortBy: 'relevance' };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = Object.entries(localFilters).filter(
    ([key, value]) => key !== 'sortBy' && value !== undefined && value !== ''
  ).length;

  const argentineProvinces = [
    "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
    "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
    "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
    "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
    "Tierra del Fuego", "Tucumán"
  ];

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'pt', name: 'Portugués' },
    { code: 'it', name: 'Italiano' },
    { code: 'de', name: 'Alemán' },
    { code: 'fr', name: 'Francés' }
  ];

  const filterContent = (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        {/* Sort Options */}
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            Ordenar por
          </Label>
          <Select
            value={localFilters.sortBy || 'relevance'}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Más relevantes</SelectItem>
              <SelectItem value="rating">Mejor calificación</SelectItem>
              <SelectItem value="reviews">Más reseñas</SelectItem>
              <SelectItem value="distance">Más cercano</SelectItem>
              <SelectItem value="price_low">Precio: menor a mayor</SelectItem>
              <SelectItem value="price_high">Precio: mayor a menor</SelectItem>
              <SelectItem value="experience">Mayor experiencia</SelectItem>
              <SelectItem value="response_time">Respuesta más rápida</SelectItem>
              <SelectItem value="newest">Más recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Accordion type="multiple" defaultValue={["location", "categories", "price"]} className="w-full">
          {/* Location Filter */}
          <AccordionItem value="location">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <Label>Provincia</Label>
                <Select
                  value={localFilters.province || ''}
                  onValueChange={(value) => updateFilter('province', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las provincias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las provincias</SelectItem>
                    {argentineProvinces.map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ciudad</Label>
                <Select
                  value={localFilters.city || ''}
                  onValueChange={(value) => updateFilter('city', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    {(facets?.cities || cities).map(city => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name} {city.count && `(${city.count})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Radio de búsqueda: {localFilters.radiusKm || 10} km</Label>
                <Slider
                  value={[localFilters.radiusKm || 10]}
                  onValueChange={([value]) => updateFilter('radiusKm', value)}
                  min={1}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Categories Filter */}
          <AccordionItem value="categories">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categorías
                {localFilters.categoryIds && localFilters.categoryIds.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {localFilters.categoryIds.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {(facets?.categories || categories).map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={localFilters.categoryIds?.includes(category.id) || false}
                      onCheckedChange={(checked) => {
                        const currentIds = localFilters.categoryIds || [];
                        const newIds = checked
                          ? [...currentIds, category.id]
                          : currentIds.filter(id => id !== category.id);
                        updateFilter('categoryIds', newIds.length > 0 ? newIds : undefined);
                      }}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {category.name}
                      {(category as any).count && (
                        <span className="text-muted-foreground ml-1">
                          ({(category as any).count})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Filter */}
          <AccordionItem value="price">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precio por hora
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rango de precio (ARS)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={localFilters.minPrice || ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-1 border rounded-md"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-1 border rounded-md"
                  />
                </div>
              </div>

              {facets?.priceRanges && (
                <RadioGroup
                  value={`${localFilters.minPrice || 0}-${localFilters.maxPrice || 999999}`}
                  onValueChange={(value) => {
                    const [min, max] = value.split('-').map(Number);
                    updateFilter('minPrice', min || undefined);
                    updateFilter('maxPrice', max < 999999 ? max : undefined);
                  }}
                >
                  {facets.priceRanges.map((range, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={`${range.min}-${range.max}`} id={`price-${index}`} />
                      <Label htmlFor={`price-${index}`} className="cursor-pointer">
                        {range.min === 0 ? 'Menos de' : `$${range.min.toLocaleString()} -`}
                        {range.max < 999999 ? ` $${range.max.toLocaleString()}` : ' o más'}
                        <span className="text-muted-foreground ml-1">({range.count})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Rating Filter */}
          <AccordionItem value="rating">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Calificación
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={localFilters.minRating?.toString() || '0'}
                onValueChange={(value) => updateFilter('minRating', Number(value) || undefined)}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="rating-all" />
                    <Label htmlFor="rating-all" className="cursor-pointer">
                      Todas las calificaciones
                    </Label>
                  </div>
                  {[4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="cursor-pointer flex items-center gap-1">
                        <span className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </span>
                        <span className="ml-1">y más</span>
                        {facets?.ratings?.find(r => r.rating === rating) && (
                          <span className="text-muted-foreground ml-1">
                            ({facets.ratings.find(r => r.rating === rating)?.count})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="mt-4 flex items-center space-x-2">
                <Checkbox
                  id="has-reviews"
                  checked={localFilters.hasReviews || false}
                  onCheckedChange={(checked) => updateFilter('hasReviews', checked || undefined)}
                />
                <Label htmlFor="has-reviews" className="cursor-pointer">
                  Solo con reseñas
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Professional Attributes */}
          <AccordionItem value="attributes">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Características del profesional
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={localFilters.isVerified || false}
                    onCheckedChange={(checked) => updateFilter('isVerified', checked || undefined)}
                  />
                  <Label htmlFor="verified" className="cursor-pointer">
                    Solo verificados
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-credits"
                    checked={localFilters.hasCredits || false}
                    onCheckedChange={(checked) => updateFilter('hasCredits', checked || undefined)}
                  />
                  <Label htmlFor="has-credits" className="cursor-pointer">
                    Disponible ahora (con créditos)
                  </Label>
                </div>
              </div>

              <div>
                <Label>Años de experiencia mínimos</Label>
                <Select
                  value={localFilters.experienceYears?.toString() || ''}
                  onValueChange={(value) => updateFilter('experienceYears', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier experiencia</SelectItem>
                    <SelectItem value="1">1+ años</SelectItem>
                    <SelectItem value="3">3+ años</SelectItem>
                    <SelectItem value="5">5+ años</SelectItem>
                    <SelectItem value="10">10+ años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Idiomas</Label>
                <div className="space-y-2">
                  {languages.map(language => (
                    <div key={language.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language.code}`}
                        checked={localFilters.languages?.includes(language.code) || false}
                        onCheckedChange={(checked) => {
                          const currentLangs = localFilters.languages || [];
                          const newLangs = checked
                            ? [...currentLangs, language.code]
                            : currentLangs.filter(lang => lang !== language.code);
                          updateFilter('languages', newLangs.length > 0 ? newLangs : undefined);
                        }}
                      />
                      <Label htmlFor={`lang-${language.code}`} className="cursor-pointer">
                        {language.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Availability & Response Time */}
          <AccordionItem value="availability">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Disponibilidad
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <Label>Disponibilidad</Label>
                <Select
                  value={localFilters.availability || ''}
                  onValueChange={(value) => updateFilter('availability', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier momento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier momento</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="tomorrow">Mañana</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="anytime">Cuando sea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tiempo de respuesta</Label>
                <RadioGroup
                  value={localFilters.responseTime || ''}
                  onValueChange={(value) => updateFilter('responseTime', value || undefined)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="response-any" />
                      <Label htmlFor="response-any" className="cursor-pointer">
                        Cualquier tiempo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="response-fast" />
                      <Label htmlFor="response-fast" className="cursor-pointer">
                        Rápido (menos de 2 horas)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="response-medium" />
                      <Label htmlFor="response-medium" className="cursor-pointer">
                        Moderado (menos de 24 horas)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="response-slow" />
                      <Label htmlFor="response-slow" className="cursor-pointer">
                        Sin prisa (más de 24 horas)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros ({activeFilterCount})
          </Button>
        )}
      </div>
    </ScrollArea>
  );

  // Mobile filters in a modal/drawer - only render on mobile screens
  if (showMobileFilters) {
    return (
      <div className="fixed inset-0 z-50 bg-white md:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <Button variant="ghost" size="icon" onClick={onCloseMobileFilters}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-[calc(100vh-60px)] overflow-y-auto p-4 bg-white">
          {filterContent}
        </div>
      </div>
    );
  }

  // Desktop filters in sidebar
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 pb-6 max-h-[calc(100vh-200px)]">
          {filterContent}
        </div>
      </CardContent>
    </Card>
  );
}