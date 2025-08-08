import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Eye,
  MessageCircle,
  Star,
  Clock,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import {
  RevenueChart,
  UserGrowthChart,
  CategoryPerformanceChart,
  ConversionFunnelChart,
  ProviderPerformanceChart
} from './charts';

interface DashboardMetrics {
  overview: {
    totalProviders: number;
    verifiedProviders: number;
    totalRequests: number;
    verificationRate: string;
  };
  revenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  userActivity: Array<{
    event: string;
    count: number;
  }>;
  topProviders: Array<{
    id: number;
    businessName: string;
    averageRating: string;
    totalReviews: number;
    credits: number;
  }>;
}

interface PerformanceMetrics {
  activeProviders: number;
  systemStatus: 'operational' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastUpdated: string;
}

export function BusinessIntelligenceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const queryClient = useQueryClient();
  const { trackPageView } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView('business_intelligence_dashboard');
  }, [trackPageView]);

  // Real-time updates via WebSocket
  const { isConnected } = useWebSocket({
    onNewMessage: () => {
      // Refresh analytics when new activity happens
      if (realTimeEnabled) {
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
      }
    }
  });

  // Main dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useQuery<{
    success: boolean;
    data: DashboardMetrics;
  }>({
    queryKey: ['analytics', 'dashboard', selectedPeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPeriod !== 'all') {
        const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.append('startDate', startDate.toISOString());
        params.append('endDate', new Date().toISOString());
      }
      
      const response = await fetch(`/api/analytics/dashboard?${params}`);
      return response.json();
    },
    refetchInterval: realTimeEnabled ? 30000 : false, // Refresh every 30 seconds if real-time enabled
  });

  // Performance metrics
  const { data: performanceData, isLoading: isPerformanceLoading } = useQuery<{
    success: boolean;
    data: PerformanceMetrics;
  }>({
    queryKey: ['analytics', 'performance'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/performance');
      return response.json();
    },
    refetchInterval: realTimeEnabled ? 5000 : false, // Refresh every 5 seconds for real-time
  });

  // User growth data
  const { data: userGrowthData } = useQuery({
    queryKey: ['analytics', 'user-growth', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/user-growth?period=${selectedPeriod}`);
      return response.json();
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };

  const handleExportData = () => {
    // Export dashboard data as CSV/JSON
    const data = {
      dashboard: dashboardData?.data,
      performance: performanceData?.data,
      userGrowth: userGrowthData?.data,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servicioshogar-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando métricas...</span>
      </div>
    );
  }

  const metrics = dashboardData?.data;
  const performance = performanceData?.data;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Análisis avanzado y métricas de rendimiento en tiempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Tiempo real:</span>
            <Button
              variant={realTimeEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            >
              <Zap className="h-4 w-4 mr-1" />
              {realTimeEnabled ? 'Activado' : 'Desactivado'}
            </Button>
            {isConnected && realTimeEnabled && (
              <Badge variant="secondary">
                <Activity className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            )}
          </div>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* System Status */}
      {performance && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center space-x-2">
                {performance.systemStatus === 'operational' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Estado</p>
                  <p className="text-xs text-muted-foreground">
                    {performance.systemStatus === 'operational' ? 'Operativo' : 'Degradado'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">{performance.activeProviders}</p>
                <p className="text-xs text-muted-foreground">Proveedores Activos</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">{performance.responseTime.toFixed(0)}ms</p>
                <p className="text-xs text-muted-foreground">Tiempo de Respuesta</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">{formatPercentage(performance.uptime)}</p>
                <p className="text-xs text-muted-foreground">Disponibilidad</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">
                  {new Date(performance.lastUpdated).toLocaleTimeString()}
                </p>
                <p className="text-xs text-muted-foreground">Última Actualización</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overview.totalProviders}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.overview.verifiedProviders} verificados ({metrics.overview.verificationRate})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Totales</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overview.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                Servicios solicitados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Período</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  metrics.revenue.reduce((sum, item) => sum + item.revenue, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.revenue.reduce((sum, item) => sum + item.transactions, 0)} transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Verificación</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overview.verificationRate}</div>
              <p className="text-xs text-muted-foreground">
                Proveedores verificados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="growth">Crecimiento</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.revenue && (
                <RevenueChart data={metrics.revenue} height={300} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crecimiento de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              {userGrowthData?.data && (
                <UserGrowthChart data={userGrowthData.data} height={300} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.userActivity && (
                  <div className="space-y-2">
                    {metrics.userActivity.map((activity) => (
                      <div key={activity.event} className="flex justify-between items-center">
                        <span className="text-sm">{activity.event.replace('_', ' ')}</span>
                        <Badge variant="secondary">{activity.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conexiones Activas</span>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Actualización Automática</span>
                    <Badge variant={realTimeEnabled ? "default" : "outline"}>
                      {realTimeEnabled ? 'Activado' : 'Desactivado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.topProviders && (
                <div className="space-y-4">
                  {metrics.topProviders.map((provider, index) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{provider.businessName}</p>
                          <p className="text-sm text-muted-foreground">
                            {provider.totalReviews} reseñas • {provider.credits} créditos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{provider.averageRating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}