import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookingForm } from "@/components/booking/booking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import ChatFloatingButton from "@/components/Chat/ChatFloatingButton";
import { useAuth } from "@/hooks/useAuth";
import { 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail,
  Calendar,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { useState } from "react";

export default function ServiceDetail() {
  const { id } = useParams();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/providers", id],
    queryFn: () => fetch(`/api/providers/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: providerServices } = useQuery({
    queryKey: ["/api/providers", id, "services"],
    queryFn: () => fetch(`/api/providers/${id}/services`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/providers", id, "reviews"],
    queryFn: () => fetch(`/api/providers/${id}/reviews`).then(res => res.json()),
    enabled: !!id,
  });

  if (providerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Profesional no encontrado
              </h2>
              <p className="text-slate-600 mb-6">
                El profesional que buscas no existe o no está disponible.
              </p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a resultados
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage 
                      src={provider.profileImageUrl || undefined} 
                      alt={provider.businessName || 'Profesional'} 
                    />
                    <AvatarFallback className="text-lg">
                      {provider.businessName?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">
                          {provider.businessName}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          {provider.city}, {provider.province}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="text-lg font-semibold">{provider.rating}</span>
                          <span className="text-sm text-slate-500">
                            ({provider.totalReviews} reseñas)
                          </span>
                        </div>
                        {provider.hourlyRate && (
                          <div className="text-lg font-bold text-primary">
                            ${Number(provider.hourlyRate).toLocaleString('es-AR')} ARS/hora
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Asegurado
                      </Badge>
                      {provider.experienceYears && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {provider.experienceYears} años de experiencia
                        </Badge>
                      )}
                    </div>

                    {provider.description && (
                      <p className="text-slate-700">{provider.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Offered */}
            {providerServices && providerServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Servicios ofrecidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {providerServices.map((service) => (
                      <div key={service.id} className="border border-slate-200 rounded-lg p-4">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {service.customServiceName}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                        )}
                        {service.basePrice && (
                          <div className="font-medium text-primary">
                            Desde ${Number(service.basePrice).toLocaleString('es-AR')} ARS
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de clientes</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {review.reviewerId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < review.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-slate-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString('es-AR')}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-slate-700">{review.comment}</p>
                            )}
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                    
                    {reviews.length > 5 && (
                      <Button variant="outline" className="w-full">
                        Ver todas las reseñas ({reviews.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">
                      Este profesional aún no tiene reseñas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contactar profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => setShowBookingForm(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Solicitar servicio
                </Button>
                
                {provider.phoneNumber && (
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                )}
                
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full" onClick={() => {
                    // This would open chat with the provider
                    const event = new CustomEvent('openChat', { 
                      detail: { 
                        providerId: provider.id,
                        initialMessage: `Hola! Me interesa el servicio: ${provider.businessName}`
                      }
                    });
                    window.dispatchEvent(event);
                  }}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat directo
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => {
                    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                  }}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Iniciar sesión para chatear
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Service Areas */}
            {provider.serviceAreas && provider.serviceAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Zonas de servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.serviceAreas.map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Trabajos completados</span>
                  <span className="font-semibold">150+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tiempo de respuesta</span>
                  <span className="font-semibold">2 horas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tasa de aceptación</span>
                  <span className="font-semibold">95%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BookingForm 
              provider={provider}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}

      {/* Chat Floating Button - MVP3 Phase 3 Integration */}
      {/* TODO: Implement chat floating button 
      {isAuthenticated && provider && (
        <ChatFloatingButton
          initialProviderId={provider.id}
          initialMessage={`Hola! Me interesa el servicio: ${provider.businessName}`}
          position="bottom-right"
          size="medium"
          showUnreadBadge={true}
        />
      )}
      */}

      <Footer />
    </div>
  );
}
