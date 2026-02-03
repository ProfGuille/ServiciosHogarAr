import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, CreditCard, DollarSign, Building } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  paymentId?: number;
  details?: any;
  message?: string;
  initPoint?: string;
}

interface TestResults {
  scenario: string;
  timestamp: string;
  tests: TestResult[];
}

export default function TestPayments() {
  const [results, setResults] = useState<Record<string, TestResults>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const scenarios = [
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      description: 'Prueba pago por transferencia bancaria',
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      id: 'cash',
      name: 'Pago en Efectivo', 
      description: 'Prueba pago en efectivo',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Prueba integración con Mercado Pago',
      icon: CreditCard,
      color: 'bg-blue-400'
    }
  ];

  const runTest = async (scenario: string) => {
    setLoading(scenario);
    try {
      const response = await apiRequest('POST', '/api/test-e2e-payments', { scenario });
      
      if (response.success) {
        setResults(prev => ({ ...prev, [scenario]: response.results }));
        toast({
          title: "Prueba Exitosa",
          description: `${scenario} ejecutado correctamente`,
        });
      } else {
        toast({
          title: "Error en Prueba",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error de Conexión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const runAllTests = async () => {
    for (const scenario of scenarios) {
      await runTest(scenario.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SKIPPED': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'SKIPPED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Test de Pagos E2E</h1>
          <p className="text-gray-600 mt-2">
            Pruebas integrales del sistema de pagos ServiciosHogar.com.ar
          </p>
        </div>
        <Button 
          onClick={runAllTests}
          disabled={loading !== null}
          size="lg"
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Todas las Pruebas'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const result = results[scenario.id];
          
          return (
            <Card key={scenario.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${scenario.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Button
                  onClick={() => runTest(scenario.id)}
                  disabled={loading === scenario.id}
                  className="w-full mb-4"
                  variant={result ? "outline" : "default"}
                >
                  {loading === scenario.id ? 'Ejecutando...' : 'Probar'}
                </Button>

                {result && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      Ejecutado: {new Date(result.timestamp).toLocaleString('es-AR')}
                    </div>
                    
                    {result.tests.map((test, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {getStatusIcon(test.status)}
                        <span className="text-sm flex-1">{test.test}</span>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                    ))}

                    {result.tests.find(t => t.details) && (
                      <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                        {result.tests.map((test, index) => (
                          test.details && (
                            <div key={index} className="space-y-1">
                              <div>💰 Monto: ${test.details.amount} ARS</div>
                              <div>🏦 Comisión: ${test.details.platformFee} ARS</div>
                              <div>👷 Profesional: ${test.details.providerAmount} ARS</div>
                              {test.details.transferReference && (
                                <div>🔗 Ref: {test.details.transferReference}</div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {result.tests.find(t => t.initPoint) && (
                      <div className="mt-2">
                        <a 
                          href={result.tests.find(t => t.initPoint)?.initPoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          🔗 Abrir Mercado Pago
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(results).map(([scenarioId, result]) => {
                const scenario = scenarios.find(s => s.id === scenarioId);
                const passed = result.tests.filter(t => t.status === 'PASSED').length;
                const total = result.tests.length;
                
                return (
                  <div key={scenarioId} className="text-center p-4 border rounded">
                    <h3 className="font-semibold">{scenario?.name}</h3>
                    <div className="text-2xl font-bold mt-2">
                      {passed}/{total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {passed === total ? 'Todas las pruebas pasaron' : 'Algunas pruebas fallaron'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}