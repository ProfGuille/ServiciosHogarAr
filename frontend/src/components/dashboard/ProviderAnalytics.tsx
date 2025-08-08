import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Star,
  Eye,
  Clock,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    responseRate: number;
    conversionRate: number;
    revenueChange: number;
    bookingsChange: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  servicePerformance: Array<{
    serviceId: number;
    serviceName: string;
    bookings: number;
    revenue: number;
    averageRating: number;
    responseTime: number;
  }>;
  clientMetrics: {
    newClients: number;
    returningClients: number;
    clientSatisfaction: number;
    averageProjectValue: number;
  };
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    bookings: number;
    newClients: number;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, format = 'number' }) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `$${Number(val).toLocaleString()} ARS`;
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return val.toString();
  };

  const getChangeColor = (changeValue: number) => {
    if (changeValue > 0) return 'text-green-600';
    if (changeValue < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (changeValue: number) => {
    if (changeValue > 0) return <ArrowUpRight className="h-3 w-3" />;
    if (changeValue < 0) return <ArrowDownRight className="h-3 w-3" />;
    return null;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(change)}`}>
                {getChangeIcon(change)}
                <span>{Math.abs(change)}% vs. período anterior</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Chart Components (using pure CSS/HTML to avoid external dependencies)
const SimpleLineChart: React.FC<{ data: Array<{ date: string; revenue: number; bookings: number }> }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxBookings = Math.max(...data.map(d => d.bookings));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Reservas</span>
        </div>
      </div>
      
      <div className="h-64 border rounded-lg p-4 bg-gray-50">
        <div className="h-full flex items-end justify-between gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex flex-col items-center gap-1 flex-1 justify-end">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: '2px' }}
                  title={`Ingresos: $${item.revenue.toLocaleString()}`}
                ></div>
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(item.bookings / maxBookings) * 80}%`, minHeight: '2px' }}
                  title={`Reservas: ${item.bookings}`}
                ></div>
              </div>
              <span className="text-xs text-gray-600 transform -rotate-45 origin-left">
                {format(new Date(item.date), 'dd/MM', { locale: es })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimpleBarChart: React.FC<{ data: Array<{ serviceName: string; bookings: number; revenue: number }> }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.serviceName}</span>
            <span className="text-gray-600">${item.revenue.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(item.revenue / maxValue) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{item.bookings} reservas</span>
            <span>{((item.revenue / maxValue) * 100).toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ProviderAnalytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['provider-analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/provider/analytics?timeRange=${timeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar analíticas');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Sin datos disponibles</h3>
          <p className="text-gray-500">Las estadísticas aparecerán cuando tengas reservas y transacciones.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analíticas y Estadísticas</CardTitle>
              <CardDescription>
                Monitorea el rendimiento de tu negocio y obtén insights valiosos
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período de tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Ingresos Totales"
              value={analytics.overview.totalRevenue}
              change={analytics.overview.revenueChange}
              icon={<DollarSign className="h-6 w-6" />}
              format="currency"
            />
            <StatCard
              title="Total Reservas"
              value={analytics.overview.totalBookings}
              change={analytics.overview.bookingsChange}
              icon={<Calendar className="h-6 w-6" />}
            />
            <StatCard
              title="Calificación Promedio"
              value={analytics.overview.averageRating.toFixed(1)}
              icon={<Star className="h-6 w-6" />}
            />
            <StatCard
              title="Tasa de Conversión"
              value={analytics.overview.conversionRate}
              icon={<Target className="h-6 w-6" />}
              format="percentage"
            />
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos y Reservas</CardTitle>
              <CardDescription>
                Evolución de tus ingresos y número de reservas en el tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleLineChart data={analytics.revenueChart} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tiempo de Respuesta</p>
                    <p className="text-xl font-bold">{analytics.overview.responseRate}%</p>
                    <p className="text-xs text-gray-500">Promedio bajo 2 horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Clientes Nuevos</p>
                    <p className="text-xl font-bold">{analytics.clientMetrics.newClients}</p>
                    <p className="text-xs text-gray-500">Este período</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Valor Promedio</p>
                    <p className="text-xl font-bold">${analytics.clientMetrics.averageProjectValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Por proyecto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ingresos Detallado</CardTitle>
              <CardDescription>
                Desglose completo de tus fuentes de ingresos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleLineChart data={analytics.revenueChart} />
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    ${analytics.revenueChart.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ${Math.round(analytics.revenueChart.reduce((sum, item) => sum + item.revenue, 0) / analytics.revenueChart.length).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Promedio Diario</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    ${Math.max(...analytics.revenueChart.map(item => item.revenue)).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Mejor Día</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mes</th>
                      <th className="text-right p-2">Ingresos</th>
                      <th className="text-right p-2">Reservas</th>
                      <th className="text-right p-2">Clientes Nuevos</th>
                      <th className="text-right p-2">Promedio/Reserva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.monthlyTrends.map((month, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{month.month}</td>
                        <td className="p-2 text-right">${month.revenue.toLocaleString()}</td>
                        <td className="p-2 text-right">{month.bookings}</td>
                        <td className="p-2 text-right">{month.newClients}</td>
                        <td className="p-2 text-right">
                          ${month.bookings > 0 ? Math.round(month.revenue / month.bookings).toLocaleString() : '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Servicio</CardTitle>
              <CardDescription>
                Analiza qué servicios generan más ingresos y demanda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={analytics.servicePerformance} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Servicio</th>
                      <th className="text-right p-2">Reservas</th>
                      <th className="text-right p-2">Ingresos</th>
                      <th className="text-right p-2">Calificación</th>
                      <th className="text-right p-2">Tiempo Respuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.servicePerformance.map((service) => (
                      <tr key={service.serviceId} className="border-b">
                        <td className="p-2 font-medium">{service.serviceName}</td>
                        <td className="p-2 text-right">{service.bookings}</td>
                        <td className="p-2 text-right">${service.revenue.toLocaleString()}</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {service.averageRating.toFixed(1)}
                          </div>
                        </td>
                        <td className="p-2 text-right">{service.responseTime}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Clientes Nuevos"
              value={analytics.clientMetrics.newClients}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Clientes Recurrentes"
              value={analytics.clientMetrics.returningClients}
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <StatCard
              title="Satisfacción"
              value={analytics.clientMetrics.clientSatisfaction}
              icon={<Star className="h-6 w-6" />}
              format="percentage"
            />
            <StatCard
              title="Valor Promedio"
              value={analytics.clientMetrics.averageProjectValue}
              icon={<DollarSign className="h-6 w-6" />}
              format="currency"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Clientes</CardTitle>
              <CardDescription>
                Insights sobre tu base de clientes y su comportamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Distribución de Clientes</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Nuevos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${(analytics.clientMetrics.newClients / (analytics.clientMetrics.newClients + analytics.clientMetrics.returningClients)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.clientMetrics.newClients}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recurrentes</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ 
                              width: `${(analytics.clientMetrics.returningClients / (analytics.clientMetrics.newClients + analytics.clientMetrics.returningClients)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.clientMetrics.returningClients}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Métricas de Retención</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tasa de Retención</p>
                      <p className="text-xl font-bold text-green-600">
                        {((analytics.clientMetrics.returningClients / (analytics.clientMetrics.newClients + analytics.clientMetrics.returningClients)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Valor de Vida del Cliente</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${(analytics.clientMetrics.averageProjectValue * 1.5).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}