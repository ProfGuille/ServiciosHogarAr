import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, XCircle, AlertCircle, MapPin, Calendar, DollarSign, Plus, Star, User } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const statusIcons: Record<string, any> = {
  pending: Clock, quoted: DollarSign, accepted: CheckCircle,
  in_progress: Clock, completed: CheckCircle, cancelled: XCircle,
};
const statusLabels: Record<string, string> = {
  pending: "Pendiente", quoted: "Cotizado", accepted: "Aceptado",
  in_progress: "En progreso", completed: "Completado", cancelled: "Cancelado",
};

interface Provider {
  providerId: number;
  userId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  unlockedAt: string;
}
interface Review {
  revieweeId: string;
  rating: number;
  comment: string | null;
}
interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  city: string;
  status: string;
  created_at: string;
  is_urgent: boolean;
  preferred_date: string | null;
  providers: Provider[];
  reviews: Review[];
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none">
          <Star className={"h-6 w-6 transition-colors " + ((hover || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
        </button>
      ))}
    </div>
  );
}

function ProviderRatingSection({ requestId, providers, reviews }: {
  requestId: number; providers: Provider[]; reviews: Review[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  if (!providers || providers.length === 0) return null;

  const getExisting = (userId: string) => reviews?.find((r) => r.revieweeId === userId) ?? null;

  const handleSubmit = async (provider: Provider) => {
    const rating = ratings[provider.userId];
    if (!rating) { toast({ title: "Seleccioná una calificación", variant: "destructive" }); return; }
    setSubmitting(provider.userId);
    try {
      const res = await fetch(
        getApiUrl() + "/api/service-requests/" + requestId + "/review",
        { method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() as Record<string, string> },
          body: JSON.stringify({ revieweeUserId: provider.userId, rating }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al calificar");
      toast({ title: "Calificación enviada", description: "Gracias por tu opinión." });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests/my"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-sm font-semibold text-slate-700 mb-3">
        {providers.length === 1 ? "1 profesional contactó esta solicitud" : providers.length + " profesionales contactaron esta solicitud"}
      </p>
      <div className="space-y-3">
        {providers.map((provider) => {
          const existing = getExisting(provider.userId);
          return (
            <div key={provider.userId} className="flex items-center justify-between gap-4 bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  {provider.profileImage
                    ? <img src={provider.profileImage} alt="" className="h-8 w-8 object-cover" />
                    : <User className="h-4 w-4 text-slate-500" />}
                </div>
                <span className="text-sm font-medium text-slate-800">{provider.firstName} {provider.lastName}</span>
              </div>
              {existing ? (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={"h-4 w-4 " + (existing.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
                  ))}
                  <span className="text-xs text-slate-500 ml-1">Calificado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <StarRating value={ratings[provider.userId] || 0}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [provider.userId]: v }))} />
                  <Button size="sm" variant="outline"
                    disabled={submitting === provider.userId || !ratings[provider.userId]}
                    onClick={() => handleSubmit(provider)}>
                    {submitting === provider.userId ? "..." : "Calificar"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyRequests() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Sesión requerida", description: "Debés iniciar sesión para ver tus solicitudes.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/login"; }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: requests, isLoading: requestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests/my"],
    enabled: isAuthenticated,
  });

  if (authLoading || requestsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mis Solicitudes</h1>
          <Button onClick={() => window.location.href = "/nueva-solicitud"}>
            <Plus className="h-4 w-4 mr-2" />Nueva solicitud
          </Button>
        </div>

        {!requests || requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No tenés solicitudes aún</h3>
              <p className="text-slate-600 mb-6">Creá tu primera solicitud para conectar con profesionales verificados.</p>
              <Button onClick={() => window.location.href = "/nueva-solicitud"}>
                <Plus className="h-4 w-4 mr-2" />Crear primera solicitud
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => {
              const StatusIcon = statusIcons[request.status] || Clock;
              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                        <p className="text-slate-600 line-clamp-2">{request.description}</p>
                      </div>
                      <Badge className={statusColors[request.status] || "bg-slate-100 text-slate-800"}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusLabels[request.status] || request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-2" />{request.city}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(request.created_at).toLocaleDateString("es-AR")}
                      </div>
                    </div>
                    {request.preferred_date && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Fecha preferida: {new Date(request.preferred_date).toLocaleDateString("es-AR")}</span>
                        </div>
                      </div>
                    )}
                    {request.is_urgent && (
                      <div className="mt-2">
                        <Badge variant="destructive" className="text-xs">Urgente</Badge>
                      </div>
                    )}
                    <ProviderRatingSection requestId={request.id} providers={request.providers} reviews={request.reviews} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader><CardTitle className="text-lg">¿Cómo funciona?</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>1.</strong> Creá una solicitud detallada del servicio que necesitás</p>
            <p><strong>2.</strong> Los profesionales verificados verán tu solicitud</p>
            <p><strong>3.</strong> Te contactarán directamente para coordinar el trabajo</p>
            <p><strong>4.</strong> Calificá al profesional para ayudar a otros usuarios</p>
            <p className="text-slate-500 italic mt-4">ServiciosHogar.com.ar actúa como intermediario. La plataforma no garantiza ni participa en la ejecución de los trabajos.</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
