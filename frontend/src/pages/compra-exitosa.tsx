import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function CompraExitosa() {
  const [, setLocation] = useLocation();
  const [paymentId, setPaymentId] = useState<string>('');
  const [credits, setCredits] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment_id') || params.get('collection_id');
    const creditsParam = params.get('credits');
    
    if (payment) setPaymentId(payment);
    if (creditsParam) setCredits(creditsParam);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            ¡Compra Exitosa!
          </CardTitle>
          <CardDescription>
            Tu pago fue procesado correctamente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Créditos agregados</div>
              {credits ? (
                <div className="text-3xl font-bold text-green-600">
                  +{credits} créditos
                </div>
              ) : (
                <div className="text-lg text-gray-600">
                  Se agregarán a tu cuenta en breve
                </div>
              )}
            </div>
          </div>

          {paymentId && (
            <div className="text-xs text-center text-gray-500">
              ID de pago: {paymentId}
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            Los créditos ya están disponibles en tu cuenta y podés empezar a usarlos inmediatamente.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full"
            onClick={() => setLocation('/comprar-creditos')}
          >
            Ver mis créditos
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Ir al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
