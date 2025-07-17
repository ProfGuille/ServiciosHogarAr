import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Shield, MapPin, Calendar, User } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { ServiceRequest } from "@shared/schema";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ serviceRequest }: { serviceRequest: ServiceRequest }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Error en el pago",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Pago exitoso!",
          description: "Tu pago ha sido procesado correctamente.",
        });
        setLocation("/mis-solicitudes");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema procesando el pago.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const platformFee = parseFloat(serviceRequest.quotedPrice || "0") * 0.10;
  const total = parseFloat(serviceRequest.quotedPrice || "0");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información del pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Servicio:</span>
              <p className="font-medium">${(total - platformFee).toLocaleString('es-AR')}</p>
            </div>
            <div>
              <span className="text-slate-600">Comisión plataforma (10%):</span>
              <p className="font-medium">${platformFee.toLocaleString('es-AR')}</p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total a pagar:</span>
            <span>${total.toLocaleString('es-AR')} ARS</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de pago</CardTitle>
          <CardDescription>
            Tu información de pago está protegida y cifrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4" />
              <span>Pago seguro procesado por Stripe</span>
            </div>

            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Procesando..." : `Pagar $${total.toLocaleString('es-AR')}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Payment() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/payment/:requestId");
  const requestId = params?.requestId ? parseInt(params.requestId) : null;
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch service request details
  const { data: serviceRequest, isLoading: requestLoading } = useQuery({
    queryKey: ["/api/requests", requestId],
    queryFn: () => fetch(`/api/requests/${requestId}`).then(res => res.json()),
    enabled: !!requestId && !!user,
    retry: false,
  });

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      if (!serviceRequest) throw new Error("Service request not found");
      
      const response = await apiRequest("POST", "/api/payments/create-payment-intent", {
        serviceRequestId: requestId,
        amount: serviceRequest.quotedPrice,
      });
      return response.json();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo inicializar el pago",
        variant: "destructive",
      });
    },
  });

  // Payment intent state
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (serviceRequest && !clientSecret && !createPaymentIntentMutation.isPending) {
      createPaymentIntentMutation.mutate(undefined, {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
        },
      });
    }
  }, [serviceRequest]);

  if (isLoading || requestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!match || !requestId) {
    setLocation("/");
    return null;
  }

  if (!serviceRequest) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Solicitud no encontrada</h1>
            <p className="text-slate-600 mb-8">La solicitud de servicio no existe o no tienes permisos para verla.</p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (serviceRequest.customerId !== user?.id) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Acceso denegado</h1>
            <p className="text-slate-600 mb-8">No tienes permisos para realizar el pago de esta solicitud.</p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (serviceRequest.status !== 'accepted') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Pago no disponible</h1>
            <p className="text-slate-600 mb-8">
              El pago solo está disponible para servicios aceptados por el profesional.
            </p>
            <Button onClick={() => setLocation("/mis-solicitudes")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ver mis solicitudes
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/mis-solicitudes")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mis solicitudes
          </Button>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Pagar servicio
          </h1>
          <p className="text-slate-600">
            Completa el pago para que el profesional pueda comenzar el trabajo
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{serviceRequest.title}</h3>
                  <p className="text-slate-600 mt-1">{serviceRequest.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{serviceRequest.address}, {serviceRequest.city}</span>
                  </div>
                  
                  {serviceRequest.preferredDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>
                        {new Date(serviceRequest.preferredDate).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={serviceRequest.isUrgent ? "destructive" : "default"}>
                      {serviceRequest.isUrgent ? "Urgente" : "Normal"}
                    </Badge>
                    <Badge variant="secondary">
                      {serviceRequest.status === 'accepted' && 'Aceptado'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Cotización del profesional:</span>
                    <span className="font-medium">
                      ${parseFloat(serviceRequest.quotedPrice || "0").toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  {serviceRequest.providerNotes && (
                    <div>
                      <span className="text-sm text-slate-600">Notas del profesional:</span>
                      <p className="text-sm mt-1 p-2 bg-slate-50 rounded">
                        {serviceRequest.providerNotes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment form */}
          <div>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm serviceRequest={serviceRequest} />
              </Elements>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-600">Preparando el pago...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}