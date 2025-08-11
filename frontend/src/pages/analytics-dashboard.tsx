import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessIntelligenceDashboard } from '@/components/analytics/BusinessIntelligenceDashboard';
import {
  UserGrowthChart,
  RevenueChart,
  CategoryPerformanceChart,
  PaymentMethodsPieChart,
  MonthlyRevenueChart,
  CreditTrendChart,
  ConversionFunnelChart,
  ProviderPerformanceChart,
} from '@/components/analytics/charts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Activity,
  Eye,
  MessageCircle,
  Star,
  Clock,
  Target,
  BarChart3,
  Brain,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AnalyticsDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('bi');

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== 'admin')) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading, user]);

  // Platform Overview Statistics
  const { data: platformStats } = useQuery({
    queryKey: ['analytics', 'platform-stats', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/platform-stats?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // Revenue Analytics
  const { data: revenueData } = useQuery({
    queryKey: ['analytics', 'revenue', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/revenue?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // User Growth Analytics
  const { data: userGrowthData } = useQuery({
    queryKey: ['analytics', 'user-growth', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/user-growth?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // Provider Performance
  const { data: providerPerformance } = useQuery({
    queryKey: ['analytics', 'provider-performance', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/provider-performance?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // Service Category Analytics
  const { data: categoryAnalytics } = useQuery({
    queryKey: ['analytics', 'categories', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/categories?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // Conversion Funnel
  const { data: conversionData } = useQuery({
    queryKey: ['analytics', 'conversion-funnel', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/conversion-funnel?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // Credit System Analytics
  const { data: creditAnalytics } = useQuery({
    queryKey: ['analytics', 'credits', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/credits?period=${timeRange}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
  });

  // Real-time Metrics
  const { data: realtimeMetrics } = useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/realtime');
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'admin') {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive business intelligence and platform insights
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Usuarios Totales
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {platformStats.totalUsers?.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{platformStats.newUsersPercent}% este período
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Profesionales
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {platformStats.totalProviders?.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{platformStats.newProvidersPercent}% este período
                    </p>
                  </div>
                  <Activity className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ingresos Totales
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${platformStats.totalRevenue?.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{platformStats.revenueGrowthPercent}% este período
                    </p>
                  </div>
                  <DollarSign className="h-12 w-12 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Solicitudes
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {platformStats.totalRequests?.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {platformStats.conversionRate}% conversión
                    </p>
                  </div>
                  <Target className="h-12 w-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Real-time Metrics */}
        {realtimeMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{realtimeMetrics.activeUsers}</p>
                  <p className="text-xs text-gray-600">Usuarios Activos (24h)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{realtimeMetrics.newRequests24h}</p>
                  <p className="text-xs text-gray-600">Nuevas Solicitudes (24h)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{realtimeMetrics.newMessages24h}</p>
                  <p className="text-xs text-gray-600">Mensajes (24h)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{realtimeMetrics.newResponses24h}</p>
                  <p className="text-xs text-gray-600">Respuestas (24h)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {realtimeMetrics.avgResponseTimeHours ? `${realtimeMetrics.avgResponseTimeHours}h` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">Tiempo Respuesta Promedio</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tabs */}
        <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="bi" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Business Intelligence
            </TabsTrigger>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="credits">Créditos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="providers">Profesionales</TabsTrigger>
            <TabsTrigger value="conversion">Conversión</TabsTrigger>
          </TabsList>

          {/* Business Intelligence Tab */}
          <TabsContent value="bi" className="space-y-6">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserGrowthChart data={userGrowthData || []} />
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData?.daily || []} />
                </CardContent>
              </Card>
            </div>

            {/* Service Categories Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPerformanceChart data={categoryAnalytics || []} height={400} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentMethodsPieChart data={revenueData?.paymentMethods || []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyRevenueChart data={revenueData?.monthly || []} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            {creditAnalytics && (
              <>
                {/* Credit System KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Créditos Vendidos</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {creditAnalytics.summary?.totalPurchased?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ${creditAnalytics.summary?.totalRevenue?.toLocaleString()} en ingresos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Créditos Utilizados</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {creditAnalytics.summary?.totalUsed?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {creditAnalytics.summary?.responseCount} respuestas de profesionales
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Utilización</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {creditAnalytics.summary?.utilizationRate}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Créditos usados vs comprados
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Credit Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Compras de Créditos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CreditTrendChart data={creditAnalytics.dailyTrend || []} height={300} />
                  </CardContent>
                </Card>

                {/* Top Credit Packages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Paquetes de Créditos Más Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {creditAnalytics.topPackages?.map((pkg: any, index: number) => (
                        <div key={pkg.credits} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Paquete de {pkg.credits} créditos
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {pkg.count} ventas
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${Number(pkg.revenue).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">total ingresos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <UserGrowthChart data={userGrowthData || []} height={400} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Profesionales</CardTitle>
              </CardHeader>
              <CardContent>
                <ProviderPerformanceChart data={providerPerformance || []} height={400} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversionFunnelChart data={conversionData || []} height={400} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Embudo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionData?.map((step: any, index: number) => (
                    <div key={step.step} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{step.step}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{step.count} usuarios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{step.conversionRate}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">conversión</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}