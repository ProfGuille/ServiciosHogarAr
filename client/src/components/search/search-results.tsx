import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Shield,
  CreditCard,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

interface Provider {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  totalReviews: number;
  hourlyRate: string;
  city: string;
  province: string;
  experienceYears: number;
  isVerified: boolean;
  profileImageUrl?: string;
  categories: Array<{ id: number; name: string }>;
  hasCredits: boolean;
  avgResponseTime: number;
  completedJobs: number;
  distance?: number;
}

interface SearchResultsProps {
  providers: Provider[];
  isLoading: boolean;
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function SearchResults({
  providers,
  isLoading,
  total,
  currentPage,
  itemsPerPage,
  onPageChange
}: SearchResultsProps) {
  const totalPages = Math.ceil(total / itemsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros o cambiar tu búsqueda
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, total)} de {total} resultados
        </p>
      </div>

      {/* Provider cards */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Provider image */}
                <div className="flex-shrink-0">
                  {provider.profileImageUrl ? (
                    <img
                      src={provider.profileImageUrl}
                      alt={provider.businessName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-2xl font-semibold text-muted-foreground">
                        {provider.businessName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Provider info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link href={`/provider/${provider.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                          {provider.businessName}
                          {provider.isVerified && (
                            <CheckCircle className="inline-block ml-2 h-4 w-4 text-blue-500" />
                          )}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {provider.city}, {provider.province}
                          </span>
                          {provider.distance && (
                            <span className="text-sm text-muted-foreground">
                              • {provider.distance.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    {provider.hourlyRate && (
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${parseFloat(provider.hourlyRate).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">por hora</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {provider.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {provider.categories.map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats and features */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-muted-foreground">
                        ({provider.totalReviews} reseñas)
                      </span>
                    </div>

                    {/* Experience */}
                    {provider.experienceYears > 0 && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>{provider.experienceYears} años exp.</span>
                      </div>
                    )}

                    {/* Response time */}
                    {provider.avgResponseTime > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Responde en ~{Math.round(provider.avgResponseTime)}h</span>
                      </div>
                    )}

                    {/* Completed jobs */}
                    {provider.completedJobs > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{provider.completedJobs} trabajos</span>
                      </div>
                    )}

                    {/* Available now */}
                    {provider.hasCredits && (
                      <Badge variant="default" className="bg-green-600">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Disponible ahora
                      </Badge>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/provider/${provider.id}`}>
                      <Button>Ver perfil</Button>
                    </Link>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={i}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}