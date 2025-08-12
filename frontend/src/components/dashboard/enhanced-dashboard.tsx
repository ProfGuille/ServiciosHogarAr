import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  MessageSquare,
  Star,
  Clock,
  Award,
  Target,
  Activity
} from 'lucide-react';

interface DashboardStatsProps {
  userType: 'provider' | 'client';
}

export function EnhancedDashboard({ userType }: DashboardStatsProps) {
  const providerStats = [
    {
      title: "Solicitudes Activas",
      value: "12",
      change: { value: 15, period: "vs mes anterior" },
      icon: Calendar,
      description: "Solicitudes pendientes de respuesta"
    },
    {
      title: "Ingresos del Mes",
      value: "$45,600",
      change: { value: 8, period: "vs mes anterior" },
      icon: DollarSign,
      variant: "success" as const,
      description: "Ingresos brutos confirmados"
    },
    {
      title: "Calificación Promedio",
      value: "4.8",
      change: { value: 2, period: "vs mes anterior" },
      icon: Star,
      description: "Basado en 47 reseñas"
    },
    {
      title: "Tiempo Respuesta",
      value: "2.3h",
      change: { value: -12, period: "vs mes anterior" },
      icon: Clock,
      variant: "success" as const,
      description: "Promedio de respuesta a solicitudes"
    }
  ];

  const clientStats = [
    {
      title: "Solicitudes Enviadas",
      value: "8",
      change: { value: 25, period: "este mes" },
      icon: Calendar,
      description: "Solicitudes de servicios realizadas"
    },
    {
      title: "Servicios Completados",
      value: "6",
      change: { value: 20, period: "este mes" },
      icon: Users,
      variant: "success" as const,
      description: "Trabajos finalizados satisfactoriamente"
    },
    {
      title: "Ahorro Promedio",
      value: "23%",
      change: { value: 5, period: "vs presupuesto inicial" },
      icon: TrendingUp,
      description: "Comparado con cotizaciones externas"
    },
    {
      title: "Satisfacción",
      value: "4.9",
      change: { value: 0, period: "promedio" },
      icon: Star,
      variant: "success" as const,
      description: "Tu calificación a profesionales"
    }
  ];

  const stats = userType === 'provider' ? providerStats : clientStats;

  const recentActivities = [
    {
      action: userType === 'provider' ? "Nueva solicitud de plomería" : "Solicitud de plomería enviada",
      time: "Hace 2 horas",
      status: "pending",
      description: "Reparación de cañería en cocina - Palermo"
    },
    {
      action: userType === 'provider' ? "Servicio completado" : "Servicio recibido",
      time: "Hace 1 día",
      status: "completed",
      description: "Instalación eléctrica - Villa Crespo"
    },
    {
      action: userType === 'provider' ? "Nueva reseña recibida" : "Reseña enviada",
      time: "Hace 2 días",
      status: "review",
      description: "⭐⭐⭐⭐⭐ Excelente trabajo"
    },
    {
      action: userType === 'provider' ? "Respuesta enviada" : "Presupuesto recibido",
      time: "Hace 3 días",
      status: "responded",
      description: "Pintura de living - Belgrano"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'review': return 'Reseña';
      case 'responded': return 'Respondido';
      default: return 'Activo';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userType === 'provider' ? 'Dashboard Profesional' : 'Mi Panel de Control'}
          </h1>
          <p className="text-gray-600">
            {userType === 'provider' 
              ? 'Gestiona tus servicios y solicitudes' 
              : 'Controla tus solicitudes y servicios'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            En línea
          </Badge>
          {userType === 'provider' && (
            <Badge variant="default" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Verificado
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {userType === 'provider' ? 'Objetivos del Mes' : 'Progreso del Mes'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userType === 'provider' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Ingresos meta: $60,000</span>
                      <span className="text-sm text-green-600">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Servicios meta: 20</span>
                      <span className="text-sm text-blue-600">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Proyectos planificados: 8</span>
                      <span className="text-sm text-green-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Presupuesto usado: $25,000</span>
                      <span className="text-sm text-blue-600">62%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensajes Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {userType === 'provider' 
                            ? `Cliente Carlos R.` 
                            : `Plomero Juan M.`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {userType === 'provider'
                            ? "¿Podrías venir mañana por la tarde?"
                            : "Confirmo para mañana a las 14hs"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">10m</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver todos los mensajes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{activity.action}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {getStatusText(activity.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userType === 'provider' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Tasa de conversión</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tiempo promedio de respuesta</span>
                      <span className="font-medium">2.3 horas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Proyectos completados</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recontrataciones</span>
                      <span className="font-medium">34%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Proyectos completados</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ahorro promedio</span>
                      <span className="font-medium">23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Calificación promedio dada</span>
                      <span className="font-medium">4.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tiempo promedio de proyecto</span>
                      <span className="font-medium">2.1 días</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userType === 'provider' ? (
                    <>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          💡 Mejora tu tiempo de respuesta
                        </p>
                        <p className="text-xs text-blue-700">
                          Responder en menos de 1 hora aumenta conversión en 40%
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          📸 Agrega más fotos a tu perfil
                        </p>
                        <p className="text-xs text-green-700">
                          Perfiles con 5+ fotos reciben 60% más solicitudes
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          💡 Planifica tus proyectos
                        </p>
                        <p className="text-xs text-blue-700">
                          Agenda servicios de mantenimiento preventivo
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          ⭐ Deja más reseñas
                        </p>
                        <p className="text-xs text-green-700">
                          Ayuda a otros usuarios y mejora la comunidad
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}