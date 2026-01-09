import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function CompraFallida() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Compra Fallida
          </CardTitle>
          <CardDescription>
            No se pudo procesar tu pago
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Tu pago no pudo ser procesado. Esto puede deberse a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Fondos insuficientes</li>
                <li>Datos incorrectos</li>
                <li>Cancelación del pago</li>
                <li>Error temporal del servicio</li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-gray-600 text-center">
            No se realizó ningún cargo a tu cuenta.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full"
            onClick={() => setLocation('/comprar-creditos')}
          >
            Intentar nuevamente
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
