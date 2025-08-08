import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin, DollarSign, Star, Clock, Globe, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveFilter {
  key: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
}

interface QuickFiltersProps {
  filters: any;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function QuickFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  className
}: QuickFiltersProps) {
  const getActiveFilters = (): ActiveFilter[] => {
    const active: ActiveFilter[] = [];

    // Location filters
    if (filters.city) {
      active.push({
        key: 'city',
        label: `📍 ${filters.city}`,
        value: filters.city,
        icon: <MapPin className="w-3 h-3" />
      });
    }

    if (filters.province) {
      active.push({
        key: 'province',
        label: `📍 ${filters.province}`,
        value: filters.province,
        icon: <MapPin className="w-3 h-3" />
      });
    }

    if (filters.radius) {
      active.push({
        key: 'radius',
        label: `📍 Radio: ${filters.radius}km`,
        value: filters.radius,
        icon: <MapPin className="w-3 h-3" />
      });
    }

    // Price filters
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || '∞';
      active.push({
        key: 'price',
        label: `💰 $${min} - $${max}`,
        value: { min: filters.minPrice, max: filters.maxPrice },
        icon: <DollarSign className="w-3 h-3" />
      });
    }

    // Rating filter
    if (filters.minRating && filters.minRating > 0) {
      active.push({
        key: 'minRating',
        label: `⭐ ${filters.minRating}+ estrellas`,
        value: filters.minRating,
        icon: <Star className="w-3 h-3" />
      });
    }

    // Provider attributes
    if (filters.isVerified) {
      active.push({
        key: 'isVerified',
        label: '✅ Verificado',
        value: true,
        icon: <Award className="w-3 h-3" />
      });
    }

    if (filters.hasCredits) {
      active.push({
        key: 'hasCredits',
        label: '🟢 Disponible ahora',
        value: true,
        icon: <Clock className="w-3 h-3" />
      });
    }

    if (filters.hasReviews) {
      active.push({
        key: 'hasReviews',
        label: '📝 Con reseñas',
        value: true,
        icon: <Star className="w-3 h-3" />
      });
    }

    // Experience filter
    if (filters.experienceYears) {
      active.push({
        key: 'experienceYears',
        label: `🎯 ${filters.experienceYears}+ años exp.`,
        value: filters.experienceYears,
        icon: <Award className="w-3 h-3" />
      });
    }

    // Availability filters
    if (filters.availability && filters.availability !== 'anytime') {
      const availabilityLabels: Record<string, string> = {
        today: 'Hoy',
        tomorrow: 'Mañana',
        week: 'Esta semana'
      };
      active.push({
        key: 'availability',
        label: `📅 ${availabilityLabels[filters.availability] || filters.availability}`,
        value: filters.availability,
        icon: <Clock className="w-3 h-3" />
      });
    }

    if (filters.responseTime) {
      const responseLabels: Record<string, string> = {
        fast: 'Respuesta rápida',
        medium: 'Respuesta moderada',
        slow: 'Sin prisa'
      };
      active.push({
        key: 'responseTime',
        label: `⚡ ${responseLabels[filters.responseTime] || filters.responseTime}`,
        value: filters.responseTime,
        icon: <Clock className="w-3 h-3" />
      });
    }

    // Languages filter
    if (filters.languages && filters.languages.length > 0) {
      const languageLabels: Record<string, string> = {
        es: 'Español',
        en: 'Inglés',
        pt: 'Portugués',
        it: 'Italiano',
        de: 'Alemán',
        fr: 'Francés'
      };
      const langNames = filters.languages.map((code: string) => languageLabels[code] || code);
      active.push({
        key: 'languages',
        label: `🌐 ${langNames.join(', ')}`,
        value: filters.languages,
        icon: <Globe className="w-3 h-3" />
      });
    }

    // Categories filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      active.push({
        key: 'categoryIds',
        label: `🏷️ ${filters.categoryIds.length} categoría${filters.categoryIds.length > 1 ? 's' : ''}`,
        value: filters.categoryIds,
        icon: <Award className="w-3 h-3" />
      });
    }

    return active;
  };

  const handleRemoveFilter = (key: string) => {
    if (key === 'price') {
      onRemoveFilter('minPrice');
      onRemoveFilter('maxPrice');
    } else {
      onRemoveFilter(key);
    }
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
      
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 pr-1 hover:bg-gray-200 transition-colors"
        >
          <span className="text-xs">{filter.label}</span>
          <button
            onClick={() => handleRemoveFilter(filter.key)}
            className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {activeFilters.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-xs h-6 px-2"
        >
          <X className="w-3 h-3 mr-1" />
          Limpiar todo
        </Button>
      )}
    </div>
  );
}