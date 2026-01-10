import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/api';
import { isAuthenticated, getAuthHeaders, logout } from '@/lib/auth';

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  description?: string;
}

interface BalanceData {
  currentCredits: number;
  totalPurchased: number;
  totalUsed: number;
}

export default function ComprarCreditos() {
  const [, setLocation] = useLocation();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      setLocation('/login');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar paquetes y balance en paralelo
      const [packagesRes, balanceRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/credits/packages`),
        fetch(`${getApiUrl()}/api/credits/balance`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!packagesRes.ok) throw new Error('Error al cargar paquetes');
      if (!balanceRes.ok) {
        if (balanceRes.status === 401) {
          logout();
          setLocation('/login');
          return;
        }
        throw new Error('Error al cargar balance');
      }

      const packagesData = await packagesRes.json();
      const balanceData = await balanceRes.json();

      setPackages(packagesData);
      setBalance(balanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyPackage = async (packageId: number) => {
    try {
      setLoadingPackageId(packageId);
      setError('');

      const response = await fetch(`${getApiUrl()}/api/payments/mp/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          setLocation('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear orden de pago');
      }

      const data = await response.json();

      if (data.init_point) {
        // Redirigir a MercadoPago
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar compra');
    } finally {
      setLoadingPackageId(null);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header con balance y logout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Comprar Créditos
            </h1>
            {balance && (
              <p className="text-lg text-gray-600">
                Créditos disponibles: <span className="font-bold text-blue-600">{balance.currentCredits}</span>
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Grid de paquetes */}
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {pkg.credits}
                  </div>
                  <div className="text-sm text-gray-500">créditos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    ${pkg.price.toLocaleString('es-AR')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    ${(pkg.price / pkg.credits).toFixed(2)} por crédito
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleBuyPackage(pkg.id)}
                  disabled={loadingPackageId !== null}
                >
                  {loadingPackageId === pkg.id ? 'Procesando...' : 'Comprar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info adicional */}
        {balance && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Resumen de Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Créditos Actuales</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {balance.currentCredits}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Comprados</div>
                  <div className="text-2xl font-bold text-green-600">
                    {balance.totalPurchased}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Usados</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {balance.totalUsed}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
