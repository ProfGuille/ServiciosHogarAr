import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
}

interface Balance {
  currentCredits: number;
  totalPurchased: number;
  totalUsed: number;
  lastPurchase: string | null;
}

export default function ComprarCreditos() {
  const [, setLocation] = useLocation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLocation("/login");
        return;
      }

      // Cargar paquetes
      const packagesRes = await fetch(getApiUrl("/api/credits/packages"));
      const packagesData = await packagesRes.json();
      setPackages(packagesData);

      // Cargar balance
      const balanceRes = await fetch(getApiUrl("/api/credits/balance"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar información");
      setLoading(false);
    }
  };

  const handlePurchase = async (credits: number) => {
    try {
      setPurchasing(credits.toString());
      setError("");

      const token = localStorage.getItem("token");
      
      if (!token) {
        setLocation("/login");
        return;
      }

      const response = await fetch(getApiUrl("/api/payments/mp/create"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: credits })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear orden de pago");
      }

      // Redirigir a MercadoPago (usar sandbox en desarrollo)
      const checkoutUrl = process.env.NODE_ENV === 'production' 
        ? data.init_point 
        : data.sandbox_init_point;

      window.location.href = checkoutUrl;

    } catch (err: any) {
      console.error("Error comprando:", err);
      setError(err.message || "Error al procesar la compra");
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Comprar Créditos
            </h1>
            <p className="text-lg text-gray-600">
              Comprá créditos para ver los datos de contacto de tus clientes potenciales
            </p>
          </div>

          {/* Balance Actual */}
          {balance && (
            <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 mb-1">Tu Balance Actual</p>
                    <p className="text-4xl font-bold">{balance.currentCredits} créditos</p>
                    <p className="text-sm text-blue-100 mt-2">
                      Total comprados: {balance.totalPurchased} | Usados: {balance.totalUsed}
                    </p>
                  </div>
                  <CreditCard className="h-16 w-16 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Paquetes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`relative ${pkg.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Más Popular
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    ${pkg.price.toLocaleString('es-AR')} ARS
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold text-blue-600">{pkg.credits}</p>
                      <p className="text-gray-600">créditos</p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>${pkg.pricePerCredit} por crédito</span>
                      </div>
                      {pkg.savings && (
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                          <span className="font-semibold text-green-600">{pkg.savings}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Sin comisiones por trabajo</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Contacto directo con clientes</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchase(pkg.credits)}
                      disabled={purchasing !== null}
                      className={`w-full ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      {purchasing === pkg.credits.toString() ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Comprar Ahora
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info adicional */}
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-600">
              <p>• Comprás créditos según tus necesidades</p>
              <p>• Cada crédito te permite ver los datos de contacto de 1 cliente interesado</p>
              <p>• No hay comisiones por los trabajos que realices</p>
              <p>• Los créditos no vencen</p>
              <p>• Pago seguro con MercadoPago</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
