import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CreditCard, 
  MapPin, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  User,
  Briefcase,
  TrendingUp,
  Star,
  Eye,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  city: string;
  estimatedBudget: number;
  isUrgent: boolean;
  createdAt: string;
  preferredDate?: string;
  creditCost: number;
}

interface PurchasedLead {
  id: number;
  providerId: number;
  requestId: number;
  creditCost: number;
  purchasedAt: string;
  serviceRequest: {
    id: number;
    title: string;
    description: string;
    city: string;
    estimatedBudget: number;
    isUrgent: boolean;
    preferredDate?: string;
    status: string;
  };
  clientContact: {
    name: string;
    email: string;
    phone: string;
  };
}

interface CreditTransaction {
  id: number;
  providerId: number;
  type: string;
  credits: number;
  description: string;
  createdAt: string;
}

const categoryNames = {
  1: "Plomería",
  2: "Electricidad", 
  3: "Carpintería",
  4: "Pintura",
  5: "Limpieza",
  6: "Jardinería",
  7: "Techado",
  8: "Aire Acondicionado",
  9: "Cerrajería",
  10: "Albañilería"
};

export default function ProviderDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("available");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'provider')) {
      toast({
        title: "Acceso denegado",
        description: "Esta página es solo para proveedores de servicios.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, authLoading, user, toast]);

  // Fetch available service requests
  const { data: availableRequests, isLoading: availableLoading } = useQuery({
    queryKey: ["/api/provider/available-requests"],
    enabled: isAuthenticated && user?.userType === 'provider',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch purchased leads
  const { data: purchasedLeads, isLoading: purchasedLoading } = useQuery({
    queryKey: ["/api/provider/my-purchases"],
    enabled: isAuthenticated && user?.userType === 'provider',
  });

  // Fetch credit history
  const { data: creditHistory, isLoading: creditLoading } = useQuery({
    queryKey: ["/api/provider/credit-history"],
    enabled: isAuthenticated && user?.userType === 'provider',
  });

  // Purchase lead mutation
  const purchaseLeadMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch(`/api/provider/purchase-lead/${requestId}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al comprar contacto');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "¡Contacto comprado!",
        description: `Has obtenido el contacto del cliente. Créditos restantes: ${data.remainingCredits}`,
      });
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["/api/provider/available-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/credit-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al comprar contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || user?.userType !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
              <p className="text-gray-600 mb-4">
                Esta página es solo para proveedores de servicios registrados.
              </p>
              <Button onClick={() => window.location.href = "/register-provider"}>
                Registrarse como Proveedor
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard del Proveedor
          </h1>
          <p className="text-gray-600">
            Bienvenido de vuelta, {user?.name}
          </p>
        </div>

        {/* Credit Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Créditos Disponibles</h3>
                <p className="text-blue-100">
                  Usa tus créditos para acceder a información de contacto de clientes
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">
                  {creditLoading ? (
                    <Skeleton className="h-8 w-16 bg-blue-400" />
                  ) : (
                    creditHistory?.currentCredits || 0
                  )}
                </div>
                <p className="text-blue-100 text-sm">créditos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="available">Solicitudes Disponibles</TabsTrigger>
            <TabsTrigger value="purchased">Mis Contactos</TabsTrigger>
            <TabsTrigger value="credits">Historial de Créditos</TabsTrigger>
          </TabsList>

          {/* Available Requests Tab */}
          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Trabajo Disponibles</CardTitle>
                <CardDescription>
                  Solicitudes que coinciden con tus categorías de servicio. Cada contacto cuesta 5 créditos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !availableRequests?.length ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No hay solicitudes disponibles
                    </h3>
                    <p className="text-gray-500">
                      Vuelve pronto para ver nuevas oportunidades de trabajo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableRequests.map((request: ServiceRequest) => (
                      <Card key={request.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{request.title}</h3>
                                {request.isUrgent && (
                                  <Badge variant="destructive" className="text-xs">
                                    URGENTE
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {categoryNames[request.categoryId as keyof typeof categoryNames]}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {request.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {request.city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${request.estimatedBudget?.toLocaleString()} ARS
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {request.preferredDate ? 
                                    format(new Date(request.preferredDate), "dd/MM/yyyy", { locale: es }) :
                                    "Fecha flexible"
                                  }
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  {request.creditCost} créditos
                                </div>
                                <div className="text-xs text-gray-500">
                                  para ver contacto
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => purchaseLeadMutation.mutate(request.id)}
                                disabled={purchaseLeadMutation.isPending || (creditHistory?.currentCredits || 0) < request.creditCost}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {purchaseLeadMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Comprando...
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Contacto
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchased Leads Tab */}
          <TabsContent value="purchased">
            <Card>
              <CardHeader>
                <CardTitle>Mis Contactos Comprados</CardTitle>
                <CardDescription>
                  Clientes cuya información de contacto has adquirido
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchasedLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : !purchasedLeads?.length ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Aún no has comprado contactos
                    </h3>
                    <p className="text-gray-500">
                      Comienza comprando contactos de las solicitudes disponibles.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedLeads.map((lead: PurchasedLead) => (
                      <Card key={lead.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">
                                {lead.serviceRequest.title}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {lead.serviceRequest.description}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Información del Cliente:</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">{lead.clientContact.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-blue-600" />
                                      <a href={`mailto:${lead.clientContact.email}`} className="text-blue-600 hover:underline">
                                        {lead.clientContact.email}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-blue-600" />
                                      <a href={`tel:${lead.clientContact.phone}`} className="text-blue-600 hover:underline">
                                        {lead.clientContact.phone}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Detalles del Trabajo:</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {lead.serviceRequest.city}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      ${lead.serviceRequest.estimatedBudget?.toLocaleString()} ARS
                                    </div>
                                    {lead.serviceRequest.preferredDate && (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(lead.serviceRequest.preferredDate), "dd/MM/yyyy", { locale: es })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">
                                Comprado el {format(new Date(lead.purchasedAt), "dd/MM/yyyy", { locale: es })}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lead.creditCost} créditos gastados
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit History Tab */}
          <TabsContent value="credits">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Créditos</CardTitle>
                <CardDescription>
                  Registro de todas las transacciones de créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {creditLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !creditHistory?.transactions?.length ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Sin transacciones
                    </h3>
                    <p className="text-gray-500">
                      Tu historial de transacciones aparecerá aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {creditHistory.transactions.map((transaction: CreditTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.credits > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.credits > 0 ? '+' : ''}{transaction.credits} créditos
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}