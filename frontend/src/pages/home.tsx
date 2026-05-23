import { useEffect } from "react";
import { SEOHead } from "@/components/layout/seo-head";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  Plus,
  Search,
  ArrowRight,
  FileText
} from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  completed: "Completado",
  cancelled: "Cancelado",
  quoted: "Con presupuesto",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  quoted: "bg-purple-100 text-purple-800",
};

function CustomerDashboard({ user }: { user: any }) {
  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["/api/service-requests/my"],
  });
  const { data: userProfile } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    enabled: !!user,
  });
  const hasLocation = userProfile?.city || user?.city;

  const active = requests?.filter(r => r.status !== 'completed' && r.status !== 'cancelled') || [];
  const recent = requests?.slice(0, 3) || [];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {user?.userType === 'customer' && !hasLocation && (
        <div className="lg:col-span-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">Completá tu ciudad y provincia para que los profesionales te encuentren más fácil.</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100" onClick={() => window.location.href = "/nueva-solicitud"}>
            Completar ahora
          </Button>
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mis solicitudes activas
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/mis-solicitudes"}>
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : active.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="mb-4">No tenés solicitudes activas</p>
                <Button onClick={() => window.location.href = "/nueva-solicitud"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera solicitud
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {active.slice(0, 4).map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => window.location.href = "/mis-solicitudes"}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{req.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />{req.city}
                      </p>
                    </div>
                    <Badge className={`ml-3 shrink-0 ${(statusColors)[req.status] || "bg-slate-100 text-slate-700"}`}>
                      {(statusLabels)[req.status] || req.status}
                    </Badge>
                  </div>
                ))}
                {active.length > 4 && (
                  <Button variant="ghost" className="w-full text-slate-500" onClick={() => window.location.href = "/mis-solicitudes"}>
                    Ver {active.length - 4} más
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => window.location.href = "/nueva-solicitud"}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva solicitud
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/buscar"}>
              <Search className="h-4 w-4 mr-2" />
              Buscar profesionales
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/mis-solicitudes"}>
              <FileText className="h-4 w-4 mr-2" />
              Mis solicitudes
            </Button>
          </CardContent>
        </Card>

        {requests && requests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total solicitudes</span>
                <span className="font-semibold">{requests.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Activas</span>
                <span className="font-semibold text-blue-600">{active.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completadas</span>
                <span className="font-semibold text-green-600">{requests.filter((r:any) => r.status === 'completed').length}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user?.userType === 'admin') {
      window.location.replace('/admin');
    }
  }, [isLoading, user]);

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
    <>
      <SEOHead customSEO={{
        title: "ServiciosHogar.com.ar - Tus Servicios para el Hogar",
        description: "Gestioná tus solicitudes de servicios del hogar en Argentina. Encontrá profesionales verificados cerca tuyo.",
        canonicalUrl: "https://servicioshogar.com.ar/home",
      }} />
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

        <CustomerDashboard user={user} />
      </div>

      <Footer />
    </div>
    </>
  );
}
