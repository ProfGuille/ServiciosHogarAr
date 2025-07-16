import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Calendar, CreditCard, Banknote, Coins } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EarningsOverviewProps {
  providerId: number;
}

export function EarningsOverview({ providerId }: EarningsOverviewProps) {
  // Load provider payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: [`/api/providers/${providerId}/payments`],
  });

  // Load provider stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/providers/${providerId}/stats`],
  });

  if (paymentsLoading || statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate earnings metrics
  const totalEarnings = payments.reduce((sum: number, payment: any) => {
    return payment.status === 'succeeded' ? sum + parseFloat(payment.providerAmount || 0) : sum;
  }, 0);

  const thisMonthEarnings = payments
    .filter((payment: any) => {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear() &&
             payment.status === 'succeeded';
    })
    .reduce((sum: number, payment: any) => sum + parseFloat(payment.providerAmount || 0), 0);

  const pendingPayments = payments.filter((payment: any) => 
    payment.status === 'pending' || payment.status === 'processing'
  ).length;

  const completedJobs = payments.filter((payment: any) => 
    payment.status === 'succeeded'
  ).length;

  // Payment method breakdown
  const paymentMethodStats = payments.reduce((acc: any, payment: any) => {
    if (payment.status === 'succeeded') {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
    }
    return acc;
  }, {});

  const earningsCards = [
    {
      title: "Ganancias Totales",
      value: `$${totalEarnings.toLocaleString('es-AR')}`,
      description: "Ingresos acumulados",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Este Mes",
      value: `$${thisMonthEarnings.toLocaleString('es-AR')}`,
      description: format(new Date(), "MMMM yyyy", { locale: es }),
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Trabajos Completados",
      value: completedJobs.toString(),
      description: "Servicios finalizados",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Pagos Pendientes",
      value: pendingPayments.toString(),
      description: "En proceso",
      icon: CreditCard,
      color: "text-orange-600",
    },
  ];

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mercadopago':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Banknote className="h-4 w-4" />;
      case 'cash':
        return <Coins className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mercadopago':
        return 'Mercado Pago';
      case 'bank_transfer':
        return 'Transferencia';
      case 'cash':
        return 'Efectivo';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {earningsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes</CardTitle>
          <CardDescription>
            Últimos pagos recibidos por tus servicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin pagos aún
              </h3>
              <p className="text-gray-500">
                Cuando completes servicios, verás tus pagos aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                    </div>
                    <div>
                      <p className="font-medium">
                        Servicio #{payment.serviceRequestId}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(payment.createdAt), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +${parseFloat(payment.providerAmount || 0).toLocaleString('es-AR')}
                    </p>
                    <Badge 
                      variant={payment.status === 'succeeded' ? 'default' : 
                               payment.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {payment.status === 'succeeded' ? 'Completado' :
                       payment.status === 'pending' ? 'Pendiente' :
                       payment.status === 'processing' ? 'Procesando' : 'Fallido'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {payments.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Y {payments.length - 5} pagos más...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Breakdown */}
      {Object.keys(paymentMethodStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago Más Usados</CardTitle>
            <CardDescription>
              Distribución de métodos de pago de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(paymentMethodStats).map(([method, count]: [string, any]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(method)}
                    <span className="font-medium">{getPaymentMethodLabel(method)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{count} pagos</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / payments.filter((p: any) => p.status === 'succeeded').length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}