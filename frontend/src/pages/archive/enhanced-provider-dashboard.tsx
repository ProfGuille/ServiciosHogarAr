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
  Loader2,
  Settings,
  BarChart3,
  Users,
  CalendarClock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Import new dashboard components
import ServiceManagement from "@/components/dashboard/ServiceManagement";
import AvailabilityCalendar from "@/components/dashboard/AvailabilityCalendar";
import ProviderAnalytics from "@/components/dashboard/ProviderAnalytics";
import ClientManagement from "@/components/dashboard/ClientManagement";

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

export default function EnhancedProviderDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'provider')) {
      toast({
        title: "Acceso denegado",
        description: "Esta página es solo para proveedores de servicios.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user, authLoading, toast]);

  // Fetch available service requests
  const { data: availableRequests = [], isLoading: availableLoading } = useQuery({
    queryKey: ['available-requests'],
    queryFn: async () => {
      const response = await fetch('/api/provider/available-requests', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar solicitudes');
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'provider'
  });

  // Fetch purchased leads
  const { data: purchasedLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['purchased-leads'],
    queryFn: async () => {
      const response = await fetch('/api/provider/purchased-leads', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar contactos');
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'provider'
  });

  // Fetch credit history
  const { data: creditHistory, isLoading: creditLoading } = useQuery({
    queryKey: ['credit-history'],
    queryFn: async () => {
      const response = await fetch('/api/provider/credit-history', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar historial');
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'provider'
  });

  // Purchase contact mutation
  const purchaseContactMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch('/api/provider/purchase-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al comprar contacto');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchased-leads'] });
      queryClient.invalidateQueries({ queryKey: ['credit-history'] });
      toast({
        title: "¡Contacto comprado!",
        description: "Ya puedes ver la información de contacto del cliente.",
      });
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
            Dashboard Profesional
          </h1>
          <p className="text-gray-600">
            Bienvenido de vuelta, {user?.name}. Gestiona tu negocio de manera integral.
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
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.href = "/buy-credits"}
                >
                  Comprar Créditos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            <TabsTrigger value="leads">Contactos</TabsTrigger>
            <TabsTrigger value="credits">Créditos</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Enhanced with quick stats */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {availableRequests.length}
                        </p>
                        <p className="text-sm text-gray-600">Solicitudes Disponibles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {purchasedLeads.length}
                        </p>
                        <p className="text-sm text-gray-600">Contactos Comprados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {creditHistory?.currentCredits || 0}
                        </p>
                        <p className="text-sm text-gray-600">Créditos Disponibles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">4.8</p>
                        <p className="text-sm text-gray-600">Rating Promedio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Últimas solicitudes y transacciones en tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {availableRequests.slice(0, 3).map((request: ServiceRequest) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{request.title}</h4>
                          <p className="text-sm text-gray-600">{request.city} • ${request.estimatedBudget.toLocaleString()}</p>
                        </div>
                        <Badge variant={request.isUrgent ? "destructive" : "secondary"}>
                          {request.isUrgent ? "Urgente" : "Normal"}
                        </Badge>
                      </div>
                    ))}
                    {availableRequests.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No hay solicitudes disponibles en este momento.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Management Tab */}
          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <AvailabilityCalendar />
          </TabsContent>

          {/* Client Management Tab */}
          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <ProviderAnalytics />
          </TabsContent>

          {/* Available Requests Tab (Enhanced) */}
          <TabsContent value="leads">
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
                      Nuevas solicitudes aparecerán aquí cuando los clientes las publiquen.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableRequests.map((request: ServiceRequest) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{request.title}</h3>
                                {request.isUrgent && (
                                  <Badge variant="destructive">Urgente</Badge>
                                )}
                                <Badge variant="outline">
                                  {categoryNames[request.categoryId as keyof typeof categoryNames]}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-4">{request.description}</p>
                              
                              <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {request.city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${request.estimatedBudget?.toLocaleString()} ARS
                                </div>
                                {request.preferredDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(request.preferredDate), "dd/MM/yyyy", { locale: es })}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-2">
                                Publicado el {format(new Date(request.createdAt), "dd/MM/yyyy", { locale: es })}
                              </div>
                              <Button
                                onClick={() => purchaseContactMutation.mutate(request.id)}
                                disabled={purchaseContactMutation.isPending}
                                className="min-w-32"
                              >
                                {purchaseContactMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <CreditCard className="h-4 w-4 mr-2" />
                                )}
                                Comprar Contacto ({request.creditCost} créditos)
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

          {/* Credit History Tab (Enhanced) */}
          <TabsContent value="credits">
            <div className="space-y-6">
              {/* Credit Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{creditHistory?.currentCredits || 0}</p>
                    <p className="text-sm text-gray-600">Créditos Actuales</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {creditHistory?.transactions?.filter((t: CreditTransaction) => t.credits > 0).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Compras Realizadas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {creditHistory?.transactions?.filter((t: CreditTransaction) => t.credits < 0).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Contactos Comprados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Historial de Créditos</CardTitle>
                      <CardDescription>
                        Registro de todas las transacciones de créditos
                      </CardDescription>
                    </div>
                    <Button onClick={() => window.location.href = "/buy-credits"}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Comprar Más Créditos
                    </Button>
                  </div>
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}