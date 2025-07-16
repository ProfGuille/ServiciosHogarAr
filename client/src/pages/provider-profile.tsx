import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

export default function ProviderProfile() {
  const { id } = useParams();

  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/providers", id],
    enabled: !!id,
  });

  const { data: providerServices } = useQuery({
    queryKey: ["/api/providers", id, "services"],
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/providers", id, "reviews"],
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/providers", id, "stats"],
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
                Perfil no encontrado
              </h2>
              <p className="text-slate-600 mb-6">
                El perfil que buscas no existe o no está disponible.
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
          Volver
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="w-24 h-24 mx-auto sm:mx-0">
                    <AvatarImage 
                      src={provider.profileImageUrl || undefined} 
                      alt={provider.businessName || 'Profesional'} 
                    />
                    <AvatarFallback className="text-2xl">
                      {provider.businessName?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      {provider.businessName}
                    </h1>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      {provider.city}, {provider.province}
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-xl font-semibold">{provider.rating}</span>
                      <span className="text-slate-500">
                        ({provider.totalReviews} reseñas)
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
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

                    {provider.hourlyRate && (
                      <div className="text-2xl font-bold text-primary mb-4">
                        ${Number(provider.hourlyRate).toLocaleString('es-AR')} ARS/hora
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Solicitar servicio
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar mensaje
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            {provider.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Acerca de mí</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{provider.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {providerServices && providerServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Servicios ofrecidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {providerServices.map((service) => (
                      <div key={service.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {service.customServiceName}
                          </h3>
                          {service.basePrice && (
                            <div className="font-medium text-primary">
                              Desde ${Number(service.basePrice).toLocaleString('es-AR')} ARS
                            </div>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-slate-600">{service.description}</p>
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
                <CardTitle className="flex items-center justify-between">
                  Reseñas de clientes
                  {reviews && reviews.length > 0 && (
                    <span className="text-sm font-normal text-slate-500">
                      {reviews.length} reseñas
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 10).map((review) => (
                      <div key={review.id} className="border-b border-slate-100 pb-4 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {review.reviewerId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
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
                                {new Date(review.createdAt).toLocaleDateString('es-AR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-slate-700">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Sin reseñas aún
                    </h3>
                    <p className="text-slate-600">
                      Este profesional aún no tiene reseñas de clientes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Trabajos totales</span>
                    </div>
                    <span className="font-semibold">{stats.totalJobs}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Trabajos completados</span>
                    </div>
                    <span className="font-semibold">{stats.completedJobs}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Calificación promedio</span>
                    </div>
                    <span className="font-semibold">{stats.averageRating}/5</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Tasa de finalización</span>
                    </div>
                    <span className="font-semibold">
                      {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {provider.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{provider.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">Contactar por mensaje</span>
                </div>

                {provider.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div className="text-slate-700">
                      <div>{provider.address}</div>
                      <div>{provider.city}, {provider.province}</div>
                      {provider.postalCode && <div>CP: {provider.postalCode}</div>}
                    </div>
                  </div>
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
                        <span className="text-sm text-slate-700">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Response */}
            <Card>
              <CardHeader>
                <CardTitle>Respuesta rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">2 hrs</div>
                  <p className="text-sm text-slate-600">Tiempo promedio de respuesta</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">95%</div>
                  <p className="text-sm text-slate-600">Tasa de aceptación</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
