import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/payment-success/:requestId");
  const requestId = params?.requestId ? parseInt(params.requestId) : null;

  // Fetch the updated service request
  const { data: serviceRequest, isLoading } = useQuery({
    queryKey: ["/api/requests", requestId],
    enabled: !!requestId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900">
              ¡Pago realizado con éxito!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-slate-600">
              <p className="mb-4">
                Tu pago ha sido procesado correctamente. El profesional ha sido notificado
                y se pondrá en contacto contigo para coordinar el servicio.
              </p>
              
              {serviceRequest && (
                <div className="bg-slate-50 p-4 rounded-lg text-left">
                  <h3 className="font-semibold mb-2">Detalles del servicio:</h3>
                  <p className="text-sm"><strong>Servicio:</strong> {serviceRequest.title}</p>
                  <p className="text-sm"><strong>Monto:</strong> ${parseFloat(serviceRequest.quotedPrice || "0").toLocaleString('es-AR')} ARS</p>
                  <p className="text-sm"><strong>Estado:</strong> Pagado</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/mis-solicitudes")}
                variant="default"
              >
                Ver mis solicitudes
              </Button>
              
              <Button 
                onClick={() => setLocation("/")}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}