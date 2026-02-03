import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Check, 
  Zap, 
  TrendingUp, 
  Users, 
  Shield,
  Star,
  ArrowRight,
  DollarSign
} from "lucide-react";

// Credit packages configuration - must match backend configuration
const creditPackages = [
  {
    id: "pack_100",
    credits: 100,
    price: 2000,
    popular: false,
    description: "Ideal para comenzar",
    perCredit: 20,
  },
  {
    id: "pack_250",
    credits: 250,
    price: 4500,
    popular: true,
    description: "Ahorra 10%",
    perCredit: 18,
    savings: "10% ahorro",
  },
  {
    id: "pack_500",
    credits: 500,
    price: 8000,
    popular: false,
    description: "Ahorra 20%",
    perCredit: 16,
    savings: "20% ahorro",
  },
  {
    id: "pack_1000",
    credits: 1000,
    price: 15000,
    popular: false,
    description: "Mejor valor - Ahorra 25%",
    perCredit: 15,
    savings: "25% ahorro",
  },
];

// Monthly subscription plans
const subscriptionPlans = [
  {
    id: "plan-basic",
    name: "Plan Básico",
    monthlyPrice: 4999,
    credits: 50,
    features: [
      "50 créditos mensuales",
      "Perfil básico",
      "Soporte por email",
      "Sin créditos acumulables"
    ],
    popular: false,
  },
  {
    id: "plan-professional",
    name: "Plan Profesional",
    monthlyPrice: 9999,
    credits: 120,
    features: [
      "120 créditos mensuales",
      "Perfil destacado",
      "Soporte prioritario",
      "Créditos acumulables",
      "Estadísticas avanzadas"
    ],
    popular: true,
  },
  {
    id: "plan-enterprise",
    name: "Plan Empresa",
    monthlyPrice: 19999,
    credits: 300,
    features: [
      "300 créditos mensuales",
      "Perfil premium con logo",
      "Soporte dedicado 24/7",
      "Créditos acumulables",
      "Estadísticas completas",
      "Múltiples usuarios"
    ],
    popular: false,
  },
];

export default function BuyCredits() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<'credits' | 'subscription'>('credits');

  useEffect(() => {
    document.title = "Comprar Créditos - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'provider')) {
      toast({
        title: "Acceso restringido",
        description: "Solo los profesionales pueden comprar créditos.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, user, toast]);

  // Get current credits
  const { data: providerData } = useQuery({
    queryKey: ["/api/providers/me"],
    enabled: isAuthenticated && user?.userType === 'provider',
  });

  const { data: creditBalance } = useQuery({
    queryKey: ["/api/payments/credits"],
    enabled: isAuthenticated && user?.userType === 'provider',
  });

  // Purchase credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const selectedPack = creditPackages.find(p => p.id === packageId);
      if (!selectedPack) throw new Error("Paquete no válido");
      
      return await apiRequest("POST", "/api/payments/create-credit-preference", {
        packageId: selectedPack.id,
        returnUrl: window.location.href,
      });
    },
    onSuccess: (data) => {
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "No se pudo procesar la compra. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Comprar Créditos
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Invierte en tu negocio y accede a nuevos clientes. Cada crédito te permite responder a una solicitud de servicio.
            </p>
            
            {creditBalance && (
              <div className="mt-6 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Balance actual: {creditBalance.currentCredits} créditos
                </span>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="mb-12 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              ¿Por qué nuestro modelo es mejor?
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 text-green-600">
                  ✓ Modelo ServiciosHogar (Créditos)
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>0% comisión</strong> sobre trabajos realizados</li>
                  <li>• Pagas solo por acceso a leads verificados</li>
                  <li>• Predictibilidad en costos operativos</li>
                  <li>• Sin sorpresas en facturación</li>
                  <li>• Créditos sin vencimiento</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 text-red-600">
                  ✗ Competencia Tradicional
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>10-15% comisión</strong> sobre cada trabajo</li>
                  <li>• Menos ganancia neta por servicio</li>
                  <li>• Costos variables impredecibles</li>
                  <li>• Dependencia de sus sistemas de pago</li>
                  <li>• Pérdida de control sobre facturación</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ejemplo de Ahorro Real
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-800"><strong>Trabajo de $10,000:</strong></p>
                  <p className="text-green-700">• Con ServiciosHogar: Costo fijo ~$20 (1 crédito)</p>
                  <p className="text-green-700">• <strong>Ganancia neta: $9,980</strong></p>
                </div>
                <div>
                  <p className="text-red-800"><strong>Mismo trabajo en competencia:</strong></p>
                  <p className="text-red-700">• Con comisión 12%: $1,200</p>
                  <p className="text-red-700">• <strong>Ganancia neta: $8,800</strong></p>
                </div>
              </div>
              <p className="text-green-900 font-semibold mt-3">
                💰 <strong>Ahorro: $1,180 por trabajo</strong> - ¡Más del 13% adicional en tu bolsillo!
              </p>
            </div>
          </div>

          <div className="mb-12 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Cómo funciona el sistema de créditos
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Acceso a clientes verificados
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Conecta con clientes reales que buscan tus servicios en tu zona.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Haz crecer tu negocio
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Aumenta tu cartera de clientes y genera más ingresos.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Sin comisiones sobre trabajos
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Solo pagas por el acceso al lead. El 100% de tus ingresos son tuyos, sin comisiones sobre trabajos realizados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Credits vs Subscriptions */}
          <Tabs value={purchaseType} onValueChange={(value) => setPurchaseType(value as 'credits' | 'subscription')} className="mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="credits">Comprar Créditos</TabsTrigger>
              <TabsTrigger value="subscription">Suscripción Mensual</TabsTrigger>
            </TabsList>
            
            {/* Credit Packages Tab */}
            <TabsContent value="credits">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creditPackages.map((pack) => (
              <Card 
                key={pack.id}
                className={`relative cursor-pointer transition-all ${
                  selectedPackage === pack.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                } ${pack.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPackage(pack.id)}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">
                      Más popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-bold">
                    {pack.credits}
                  </CardTitle>
                  <p className="text-slate-600">créditos</p>
                  <CardDescription className="mt-2">
                    {pack.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900">
                      ${pack.price.toLocaleString('es-AR')}
                    </div>
                    <p className="text-sm text-slate-500">
                      ${pack.perCredit} por crédito
                    </p>
                    {pack.savings && (
                      <Badge variant="secondary" className="mt-2">
                        {pack.savings}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={selectedPackage === pack.id ? "default" : "outline"}
                  >
                    {selectedPackage === pack.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Seleccionado
                      </>
                    ) : (
                      "Seleccionar"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
              </div>
            </TabsContent>

            {/* Subscription Plans Tab */}
            <TabsContent value="subscription">
              <div className="grid md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`relative cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:shadow-md'
                    } ${plan.popular ? 'border-primary' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-white">
                          Más popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold">
                        {plan.name}
                      </CardTitle>
                      <div className="mt-4">
                        <div className="text-4xl font-bold text-slate-900">
                          ${plan.monthlyPrice.toLocaleString('es-AR')}
                        </div>
                        <p className="text-sm text-slate-500">por mes</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full mt-6"
                        variant={selectedPlan === plan.id ? "default" : "outline"}
                      >
                        {selectedPlan === plan.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Seleccionado
                          </>
                        ) : (
                          "Seleccionar"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Purchase Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="px-8"
              onClick={() => {
                if (purchaseType === 'credits' && selectedPackage) {
                  purchaseCreditsMutation.mutate(selectedPackage);
                } else if (purchaseType === 'subscription' && selectedPlan) {
                  // TODO: Implement subscription purchase
                  toast({
                    title: "Próximamente",
                    description: "Las suscripciones estarán disponibles pronto.",
                  });
                } else {
                  toast({
                    title: "Selecciona una opción",
                    description: purchaseType === 'credits' 
                      ? "Debes elegir un paquete de créditos antes de continuar."
                      : "Debes elegir un plan de suscripción antes de continuar.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={
                (purchaseType === 'credits' && (!selectedPackage || purchaseCreditsMutation.isPending)) ||
                (purchaseType === 'subscription' && !selectedPlan)
              }
            >
              {purchaseCreditsMutation.isPending ? (
                "Procesando..."
              ) : (
                <>
                  Continuar con el pago
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Pago seguro
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Procesado por Mercado Pago
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  ¿Cómo funcionan los créditos?
                </h3>
                <p className="text-slate-600">
                  Cada vez que un cliente solicita un servicio en tu zona y categoría, recibirás una notificación. 
                  Si decides responder, se descontará 1 crédito de tu balance y podrás acceder a los datos de contacto del cliente.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  ¿Los créditos tienen vencimiento?
                </h3>
                <p className="text-slate-600">
                  No, los créditos no vencen. Una vez comprados, permanecen en tu cuenta hasta que los uses.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  ¿Qué pasa si el cliente no contrata mis servicios?
                </h3>
                <p className="text-slate-600">
                  El crédito se consume al responder la solicitud, independientemente del resultado. 
                  Por eso es importante responder solo a solicitudes que se ajusten a tu perfil y zona de trabajo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}