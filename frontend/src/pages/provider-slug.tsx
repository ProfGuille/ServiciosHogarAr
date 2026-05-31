import { useParams, Link } from "wouter";
import { SEOHead } from "@/components/layout/seo-head";
import { useState, useEffect } from "react";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { getApiUrl } from '@/lib/api';
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
  Award,
} from "lucide-react";

export default function ProviderSlug() {
  const { slug } = useParams();

  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/providers/slug", slug],
    queryFn: () => fetch(getApiUrl(`/api/providers/slug/${slug}`)).then((res) => res.json()),
    enabled: !!slug,
  });

  const { data: providerServices } = useQuery({
    queryKey: ["/api/providers", provider?.id, "services"],
    queryFn: () =>
      fetch(getApiUrl(`/api/providers/${provider?.id}/services`)).then((res) => res.json()),
    enabled: !!provider?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/providers", provider?.id, "reviews"],
    queryFn: () =>
      fetch(getApiUrl(`/api/providers/${provider?.id}/reviews`)).then((res) => res.json()),
    enabled: !!provider?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/providers", id, "stats"],
    queryFn: () =>
      fetch(getApiUrl(`/api/providers/${id}/stats`)).then((res) => res.json()),
    enabled: !!id,
  });

  const { data: providerCategories } = useQuery({
    queryKey: ["/api/providers", id, "categories"],
    queryFn: () =>
      fetch(getApiUrl(`/api/providers/${id}/categories`)).then((res) => res.json()),
    enabled: !!id,
  });

  // Geocodificación por ciudad para el mapa
  const provinceCoords: Record<string, [number, number]> = {
    'Buenos Aires': [-36.6769, -60.5581], 'CABA': [-34.6037, -58.3816],
    'Córdoba': [-31.4135, -64.1811], 'Santa Fe': [-31.6333, -60.7000],
    'Mendoza': [-32.8908, -68.8272], 'Tucumán': [-26.8083, -65.2176],
    'Salta': [-24.7859, -65.4117], 'Misiones': [-27.3671, -55.8967],
    'Chaco': [-27.4515, -59.0243], 'Corrientes': [-27.4806, -58.8341],
    'Entre Ríos': [-31.7333, -60.5333], 'Santiago del Estero': [-27.7951, -64.2615],
    'San Juan': [-31.5375, -68.5364], 'San Luis': [-33.2960, -66.3356],
    'La Rioja': [-29.4131, -66.8558], 'Catamarca': [-28.4696, -65.7852],
    'Jujuy': [-24.1858, -65.2995], 'Formosa': [-26.1775, -58.1781],
    'Neuquén': [-38.9516, -68.0591], 'Río Negro': [-40.8135, -63.0000],
    'Chubut': [-43.3002, -65.1023], 'Santa Cruz': [-51.6230, -69.2168],
    'Tierra del Fuego': [-54.8019, -68.3030], 'La Pampa': [-36.6148, -64.2839],
  };
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!provider) return;
    if ((provider as any).latitude && (provider as any).longitude) {
      setMapCoords([(provider as any).latitude, (provider as any).longitude]);
      return;
    }
    if (!provider.city && !provider.province) return;
    const city = encodeURIComponent(`${provider.city}, ${provider.province || 'Argentina'}, Argentina`);
    fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) {
          setMapCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          const prov = provider.province as string;
          if (prov && provinceCoords[prov]) setMapCoords(provinceCoords[prov]);
        }
      })
      .catch(() => {
        const prov = provider.province as string;
        if (prov && provinceCoords[prov]) setMapCoords(provinceCoords[prov]);
      });
  }, [provider]);

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
    <>
      <SEOHead customSEO={{
        title: provider?.businessName
          ? provider.businessName + " - Perfil Profesional | ServiciosHogar.com.ar"
          : "Perfil Profesional | ServiciosHogar.com.ar",
        description: provider?.description
          ? provider.description.slice(0, 155)
          : "Perfil de proveedor de servicios para el hogar en Argentina.",
        canonicalUrl: `https://servicioshogar.com.ar/profesionales/${slug}`,
        ogTitle: provider?.businessName || "Perfil Profesional",
        ogDescription: provider?.description ? provider.description.slice(0, 155) : undefined,
      }} />
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
                      alt={provider.businessName || "Profesional"}
                    />
                    <AvatarFallback className="text-2xl">
                      {provider.businessName?.charAt(0) || "P"}
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
                      <span className="text-xl font-semibold">
                        {stats?.totalReviews > 0 ? Number(stats.averageRating).toFixed(1) : '—'}
                      </span>
                      <span className="text-slate-500">
                        ({stats?.totalReviews ?? 0} reseñas)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                      {provider.isVerified && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}

                      {provider.experienceYears && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {provider.experienceYears} años de experiencia
                        </Badge>
                      )}
                    </div>

                    {providerCategories && providerCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                        {providerCategories.map((cat: { id: number; name: string; icon?: string }) => (
                          <Badge key={cat.id} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">
                            {cat.icon && <span className="mr-1">{cat.icon}</span>}
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {provider.hourlyRate && !isNaN(Number(provider.hourlyRate)) && Number(provider.hourlyRate) > 0 && (
                      <div className="text-2xl font-bold text-primary mb-4">
                        ${Number(provider.hourlyRate).toLocaleString("es-AR")}{" "}
                        ARS/hora
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={"/nueva-solicitud" + (providerCategories?.[0]?.id ? "?categoriaId=" + providerCategories[0].id : "")}>
                        <Button className="flex-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Solicitar servicio
                        </Button>
                      </Link>
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
                  <p className="text-slate-700 leading-relaxed">
                    {provider.description}
                  </p>
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
                      <div
                        key={service.id}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {service.customServiceName}
                          </h3>
                          {service.basePrice && (
                            <div className="font-medium text-primary">
                              Desde $
                              {Number(service.basePrice).toLocaleString(
                                "es-AR",
                              )}{" "}
                              ARS
                            </div>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-slate-600">
                            {service.description}
                          </p>
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
                      <div
                        key={review.id}
                        className="border-b border-slate-100 pb-4 last:border-b-0"
                      >
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
                                        ? "text-yellow-400 fill-current"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "es-AR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
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
            {stats && stats.totalReviews > 0 && (
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
                      <Star className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Calificación promedio</span>
                    </div>
                    <span className="font-semibold">{Number(stats.averageRating).toFixed(1)}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Reseñas recibidas</span>
                    </div>
                    <span className="font-semibold">{stats.totalReviews}</span>
                  </div>
                  {stats.completedJobs > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Trabajos completados</span>
                      </div>
                      <span className="font-semibold">{stats.completedJobs}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">


                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <Link href={"/nueva-solicitud" + (providerCategories?.[0]?.id ? "?categoriaId=" + providerCategories[0].id : "")}>
                    <span className="text-slate-700 cursor-pointer hover:text-blue-600 underline">Solicitar servicio</span>
                  </Link>
                </div>

                {(provider.city || provider.province) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span className="text-slate-700">
                      {[provider.city, provider.province].filter(Boolean).join(", ")}
                    </span>
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

            {/* Zona de cobertura */}
            {mapCoords && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Zona de cobertura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden rounded-b-lg">
                  <LeafletMap
                    center={mapCoords}
                    zoom={12}
                    providers={[]}
                    userLocation={{ lat: mapCoords[0], lng: mapCoords[1] }}
                    searchRadius={10}
                    height="220px"
                  />
                  <div className="px-4 py-2 text-xs text-slate-500 text-center">
                    Zona aproximada · {provider.city}{provider.province ? `, ${provider.province}` : ''}
                  </div>
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}
