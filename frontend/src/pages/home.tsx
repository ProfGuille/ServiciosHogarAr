import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceSearch } from "@/components/services/service-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  User,
  Star,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Si no hay usuario, mostrar mensaje simple (NO redirigir)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Bienvenido a ServiciosHogar</h1>
          <p className="text-lg text-gray-600 mb-8">Inicia sesión para ver tu dashboard</p>
          <Button asChild>
            <a href="/login">Iniciar Sesión</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ¡Bienvenido, {user.firstName || user.name || 'Usuario'}!
          </h1>
          <p className="text-lg text-slate-600">
            {user.userType === 'provider' 
              ? 'Gestiona tus servicios y conecta con nuevos clientes'
              : 'Encuentra los mejores profesionales para tu hogar'
            }
          </p>
        </div>

        <div className="mb-12">
          <ServiceSearch />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Contenido del dashboard para {user.userType === 'provider' ? 'proveedores' : 'clientes'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.userType === 'customer' ? (
                  <>
                    <Button className="w-full" size="sm" onClick={() => window.location.href = "/crear-solicitud"}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Nueva solicitud
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" onClick={() => window.location.href = "/buscar"}>
                      <User className="h-4 w-4 mr-2" />
                      Buscar profesionales
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="sm" onClick={() => window.location.href = "/perfil"}>
                      <User className="h-4 w-4 mr-2" />
                      Mi perfil
                    </Button>
                    {user.userType === 'provider' && (
                      <Button variant="outline" className="w-full" size="sm" onClick={() => window.location.href = "/dashboard-profesional"}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver dashboard profesional
                      </Button>
                    )}
                    {user.userType === 'admin' && (
                      <Button variant="outline" className="w-full" size="sm" onClick={() => window.location.href = "/admin"}>
                        Panel de administración
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>En números</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10,000+</div>
                  <p className="text-sm text-slate-600">Servicios completados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2,500+</div>
                  <p className="text-sm text-slate-600">Profesionales activos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.8/5</div>
                  <p className="text-sm text-slate-600">Calificación promedio</p>
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
