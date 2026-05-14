import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingForm } from "@/components/booking/booking-form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Clock,
  Phone,
  Calendar
} from "lucide-react";
import type { ServiceProvider } from "@shared/schema";

interface ServiceCardProps {
  provider: ServiceProvider;
}

export function ServiceCard({ provider }: ServiceCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para solicitar un servicio",
        variant: "destructive",
      });
      window.location.href = "/api/login";
      return;
    }
    setShowBookingForm(true);
  };

  const handleContactClick = () => {
    if (provider.phoneNumber) {
      window.open(`tel:${provider.phoneNumber}`, '_self');
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={provider.profileImageUrl || undefined} 
                alt={provider.businessName || 'Profesional'} 
              />
              <AvatarFallback className="text-lg">
                {provider.businessName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1 truncate">
                {provider.businessName}
              </h3>
              <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                <MapPin className="h-3 w-3" />
                {provider.city}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
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

              {provider.experienceYears && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                  <Clock className="h-3 w-3" />
                  {provider.experienceYears} años de experiencia
                </div>
              )}
            </div>

            {provider.hourlyRate && (
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  ${Number(provider.hourlyRate).toLocaleString('es-AR')}
                </div>
                <div className="text-xs text-slate-500">ARS/hora</div>
              </div>
            )}
          </div>

          {provider.description && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {provider.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {provider.serviceAreas && provider.serviceAreas.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {provider.serviceAreas.join(', ')}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleContactClick}
                disabled={!provider.phoneNumber}
              >
                <Phone className="h-3 w-3 mr-1" />
                Llamar
              </Button>
              <Button 
                size="sm"
                onClick={handleBookingClick}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Solicitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <BookingForm
        provider={provider}
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    </>
  );
}
