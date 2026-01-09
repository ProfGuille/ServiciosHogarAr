import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function CompraPendiente() {
  const [, setLocation] = useLocation();
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment_id') || params.get('collection_id');
    
    if (payment) setPaymentId(payment);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-700">
            Pago Pendiente
          </CardTitle>
          <CardDescription>
            Estamos procesando tu pago
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Tu pago está siendo procesado. Esto puede ocurrir cuando:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Pagás con transferencia bancaria</li>
                <li>Pagás en efectivo (Rapipago, Pago Fácil)</li>
                <li>El banco está validando la transacción</li>
              </ul>
            </div>
          </div>

          {paymentId && (
            <div className="text-xs text-center text-gray-500">
              ID de pago: {paymentId}
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            Te notificaremos por email cuando se acredite el pago. Esto puede tardar hasta 48hs.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full"
            onClick={() => setLocation('/comprar-creditos')}
          >
            Ver estado de mis créditos
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
