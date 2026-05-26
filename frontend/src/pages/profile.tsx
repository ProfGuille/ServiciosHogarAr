import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Trophy, Gift } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getApiUrl } from "@/lib/api";
import { AchievementGallery } from "@/components/achievements/achievement-gallery";
import { ReferralShareCard } from "@/components/referral/referral-share-card";
import { ReferralHistory } from "@/components/referral/referral-history";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: userProfile } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
  });

  const providerId = (user as any)?.providerId ?? null;
  const { data: providerProfile } = useQuery<any>({
    queryKey: ["provider-profile-card", providerId],
    enabled: !!providerId && (user as any)?.userType === "provider",
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}`));
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceso requerido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Debes iniciar sesión para ver tu perfil.
              </p>
              <Button onClick={() => window.location.href = "/api/login"}>
                Iniciar sesión
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 block">Nombre</label>
                    <p className="text-lg font-semibold">{user.firstName || "No especificado"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 block">Apellido</label>
                    <p className="text-lg font-semibold">{user.lastName || "No especificado"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Email</label>
                  </div>
                  <p className="text-lg pl-6">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                  </div>
                  <p className="text-lg pl-6">
                    {user.createdAt 
                      ? format(new Date(user.createdAt), "MMMM yyyy", { locale: es })
                      : "Fecha no disponible"
                    }
                  </p>
                </div>
                {userProfile?.city && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium text-gray-500">Ubicación</label>
                    </div>
                    <p className="text-lg pl-6">
                      {[userProfile.neighborhood, userProfile.city, userProfile.province].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 block">Tipo de usuario</label>
                  <Badge variant={user.userType === 'provider' ? 'default' : 'secondary'}>
                    {user.userType === 'provider' ? 'Profesional' : 
                     user.userType === 'admin' ? 'Administrador' : 'Cliente'}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 block">Estado</label>
                  <Badge variant="default">Activo</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {user.userType !== 'admin' && <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.userType === 'customer' && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/mis-solicitudes">Ver mis solicitudes</a>
                  </Button>
                )}
                
                {user.userType === 'provider' && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/dashboard-profesional">Dashboard Profesional</a>
                  </Button>
                )}
                
                {user.userType === 'admin' && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/admin">Panel de Administración</a>
                  </Button>
                )}
                
                <Button variant="destructive" className="w-full" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }}>
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>}
          </div>
        </div>
        
        {/* Referral Section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Programa de Referidos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReferralShareCard />
            <ReferralHistory />
          </div>
        </div>

        {/* Achievement Section */}
        {user.userType === 'provider' && providerProfile && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Ubicación y cobertura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {(providerProfile.city || providerProfile.province) ? (
                <p><span className="font-medium">Ubicación:</span> {[providerProfile.city, providerProfile.province].filter(Boolean).join(', ')}</p>
              ) : (
                <p className="text-amber-600">Sin ubicación configurada</p>
              )}
              {providerProfile.coverageRadiusKm && (
                <p><span className="font-medium">Radio de cobertura:</span> {providerProfile.coverageRadiusKm} km</p>
              )}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.href = "/dashboard-profesional"}>
                Actualizar en Mi Panel
              </Button>
            </CardContent>
          </Card>
        )}
        {user.userType === 'provider' && <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Mis Logros
          </h2>
          <Card>
            <CardContent className="p-0 pt-6">
              <AchievementGallery userId={user.id} />
            </CardContent>
          </Card>
        </div>}
      </div>
      
      <Footer />
    </div>
  );
}