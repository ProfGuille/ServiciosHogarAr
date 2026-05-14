import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users
} from "lucide-react";
import type { ServiceProvider } from "@shared/schema";

interface ProviderCardProps {
  provider: ServiceProvider;
  showStats?: boolean;
}

export function ProviderCard({ provider, showStats = false }: ProviderCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <Link href={`/profesional/${provider.id}`} className="block">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={provider.profileImageUrl || undefined} 
                alt={provider.businessName || 'Profesional'} 
              />
              <AvatarFallback>
                {provider.businessName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1 hover:text-primary transition-colors">
                {provider.businessName}
              </h3>
              <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                <MapPin className="h-3 w-3" />
                {provider.city}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{provider.rating}</span>
                  <span className="text-xs text-slate-500">
                    ({provider.totalReviews})
                  </span>
                </div>
                
                {provider.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>

            {provider.hourlyRate && (
              <div className="text-right">
                <div className="font-semibold text-primary">
                  ${Number(provider.hourlyRate).toLocaleString('es-AR')}
                </div>
                <div className="text-xs text-slate-500">ARS/hora</div>
              </div>
            )}
          </div>

          {provider.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {provider.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {provider.experienceYears && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {provider.experienceYears} años
                </Badge>
              )}
              
              {showStats && (
                <>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    50+ trabajos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    95% éxito
                  </Badge>
                </>
              )}
            </div>

            <div className="text-xs text-slate-500">
              Activo hace 2 horas
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
