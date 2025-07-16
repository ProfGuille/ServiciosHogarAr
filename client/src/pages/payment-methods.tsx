import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Building2, Banknote, Upload, MapPin, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { ServiceRequest } from "@shared/schema";

export default function PaymentMethods() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/payment-methods/:requestId");
  const requestId = params?.requestId ? parseInt(params.requestId) : null;
  const queryClient = useQueryClient();
  
  const [selectedMethod, setSelectedMethod] = useState<"bank_transfer" | "cash" | "stripe" | "mercadopago">("mercadopago");
  const [transferReference, setTransferReference] = useState("");
  const [cashLocation, setCashLocation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch service request details
  const { data: serviceRequest, isLoading: requestLoading } = useQuery({
    queryKey: ["/api/requests", requestId],
    enabled: !!requestId && !!user,
    retry: false,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payments/create", paymentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago registrado",
        description: "Tu pago ha sido registrado exitosamente. El profesional será notificado.",
      });
      setLocation("/mis-solicitudes");
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
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    },
  });

  const handlePayment = async () => {
    if (!serviceRequest) return;
    
    setIsProcessing(true);
    
    const basePaymentData = {
      serviceRequestId: requestId,
      amount: serviceRequest.quotedPrice,
      paymentMethod: selectedMethod,
    };

    let paymentData;
    
    if (selectedMethod === "mercadopago") {
      // Create Mercado Pago preference and redirect
      try {
        const response = await apiRequest("POST", "/api/create-mercadopago-preference", {
          serviceRequestId: requestId,
          amount: serviceRequest.quotedPrice,
          title: serviceRequest.title,
          description: serviceRequest.description,
        });
        
        const preferenceData = await response.json();
        
        // Create payment record first
        const paymentData = {
          ...basePaymentData,
          mercadopagoPreferenceId: preferenceData.preferenceId,
        };
        
        createPaymentMutation.mutate(paymentData);
        
        // Redirect to Mercado Pago
        window.location.href = preferenceData.initPoint;
        return;
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo crear la preferencia de Mercado Pago",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    } else if (selectedMethod === "bank_transfer") {
      if (!transferReference.trim()) {
        toast({
          title: "Error",
          description: "Por favor ingresa la referencia de transferencia",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      paymentData = {
        ...basePaymentData,
        transferReference: transferReference.trim(),
        bankAccountNumber: "0110599520000001234567", // Platform account
        bankName: "Banco Galicia",
        accountHolderName: "ServiciosHogar.com.ar",
      };
    } else if (selectedMethod === "cash") {
      if (!cashLocation.trim()) {
        toast({
          title: "Error", 
          description: "Por favor especifica dónde planeas realizar el pago",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      paymentData = {
        ...basePaymentData,
        cashLocation: cashLocation.trim(),
        cashInstructions: "Coordinar con el profesional para el pago en efectivo al finalizar el servicio.",
      };
    }

    if (selectedMethod !== "mercadopago") {
      createPaymentMutation.mutate(paymentData);
    }
    setIsProcessing(false);
  };

  if (isLoading || requestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!match || !requestId || !serviceRequest) {
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

  const platformFee = parseFloat(serviceRequest.quotedPrice || "0") * 0.10;
  const total = parseFloat(serviceRequest.quotedPrice || "0");

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
            Método de pago
          </h1>
          <p className="text-slate-600">
            Elige cómo prefieres pagar por el servicio
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
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <Badge variant="secondary">Aceptado</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Servicio:</span>
                    <span className="font-medium">
                      ${(total - platformFee).toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Comisión plataforma (10%):</span>
                    <span className="font-medium">
                      ${platformFee.toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${total.toLocaleString('es-AR')} ARS</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecciona tu método de pago</CardTitle>
                <CardDescription>
                  Todos los métodos son seguros y gratuitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
                  <div className="space-y-4">
                    {/* Mercado Pago */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <RadioGroupItem value="mercadopago" id="mercadopago" />
                      <Label htmlFor="mercadopago" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Mercado Pago</div>
                            <div className="text-sm text-slate-500">
                              Tarjetas, efectivo, transferencia - Método más popular en Argentina
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Transferencia bancaria</div>
                            <div className="text-sm text-slate-500">
                              Transfiere desde tu banco online o app móvil
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Cash Payment */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <Banknote className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Pago en efectivo</div>
                            <div className="text-sm text-slate-500">
                              Paga directamente al profesional al finalizar
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Payment method specific forms */}
                <div className="mt-6">
                  {selectedMethod === "mercadopago" && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Mercado Pago</h4>
                      <p className="text-sm text-blue-800">
                        Serás redirigido a Mercado Pago para completar tu pago de forma segura. 
                        Podrás pagar con tarjeta de crédito/débito, transferencia bancaria, 
                        o en efectivo en puntos de pago.
                      </p>
                    </div>
                  )}

                  {selectedMethod === "bank_transfer" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Datos para transferencia</h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          <p><strong>Banco:</strong> Banco Galicia</p>
                          <p><strong>CBU:</strong> 0110599520000001234567</p>
                          <p><strong>Titular:</strong> ServiciosHogar.com.ar</p>
                          <p><strong>CUIT:</strong> 30-12345678-9</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="transfer_reference">Referencia de transferencia *</Label>
                        <Input
                          id="transfer_reference"
                          placeholder="Ej: TRF123456 o número de comprobante"
                          value={transferReference}
                          onChange={(e) => setTransferReference(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Ingresa el número de referencia que aparece en tu comprobante de transferencia
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedMethod === "cash" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-2">Pago en efectivo</h4>
                        <p className="text-sm text-green-800">
                          Coordinarás el pago directamente con el profesional al finalizar el servicio.
                          No es necesario pagar por adelantado.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="cash_location">¿Dónde realizarás el pago? *</Label>
                        <Textarea
                          id="cash_location"
                          placeholder="Ej: En mi domicilio al finalizar el trabajo, en efectivo"
                          value={cashLocation}
                          onChange={(e) => setCashLocation(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing || createPaymentMutation.isPending}
                  className="w-full mt-6"
                  size="lg"
                >
                  {isProcessing || createPaymentMutation.isPending ? (
                    "Procesando..."
                  ) : (
                    `Confirmar pago - $${total.toLocaleString('es-AR')} ARS`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}