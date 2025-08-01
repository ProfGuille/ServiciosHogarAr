import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { ServiceCategory } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  Settings,
  FileText,
  BarChart3,
  Globe
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== 'admin')) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden acceder a esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: platformStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.userType === 'admin',
  });

  const { data: recentProviders } = useQuery({
    queryKey: ["/api/providers", { limit: 10, isVerified: false }],
    enabled: !!user && user.userType === 'admin',
  });

  const { data: recentRequests } = useQuery({
    queryKey: ["/api/requests", { limit: 10 }],
    enabled: !!user && user.userType === 'admin',
  });

  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user && user.userType === 'admin',
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; icon?: string }) => {
      return await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado exitosamente.",
      });
      setShowCategoryForm(false);
      refetchCategories();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente.",
      });
      refetchCategories();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
    return null; // Will redirect
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const },
      quoted: { label: "Cotizado", variant: "default" as const },
      accepted: { label: "Aceptado", variant: "default" as const },
      in_progress: { label: "En progreso", variant: "default" as const },
      completed: { label: "Completado", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Panel de Administración
              </h1>
              <p className="text-lg text-slate-600">
                Gestión y supervisión de la plataforma ServiciosHogar
              </p>
            </div>
            
            <div className="flex gap-3">
              <a href="/analytics">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </a>
              <a href="/admin/wordpress">
                <Button variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  WordPress
                </Button>
              </a>
              <a href="/admin/integrations">
                <Button variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Integrations
                </Button>
              </a>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Reportes
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Usuarios totales</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-green-600">+12% este mes</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Profesionales activos</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalProviders || 0}
                  </p>
                  <p className="text-xs text-green-600">+8% este mes</p>
                </div>
                <Briefcase className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Solicitudes totales</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalRequests || 0}
                  </p>
                  <p className="text-xs text-green-600">+25% este mes</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Trabajos completados</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalCompletedJobs || 0}
                  </p>
                  <p className="text-xs text-green-600">+18% este mes</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="providers">Profesionales</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nuevo profesional registrado</p>
                        <p className="text-xs text-slate-500">Hace 5 minutos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Solicitud de servicio completada</p>
                        <p className="text-xs text-slate-500">Hace 12 minutos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profesional pendiente de verificación</p>
                        <p className="text-xs text-slate-500">Hace 1 hora</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nueva reseña publicada</p>
                        <p className="text-xs text-slate-500">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas clave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Tasa de finalización</span>
                        <span className="text-sm font-bold">87%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Satisfacción del cliente</span>
                        <span className="text-sm font-bold">4.8/5</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Profesionales verificados</span>
                        <span className="text-sm font-bold">92%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Tiempo promedio de respuesta</span>
                        <span className="text-sm font-bold">2.3 hrs</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Profesionales pendientes de verificación
                </CardTitle>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                {recentProviders && recentProviders.length > 0 ? (
                  <div className="space-y-4">
                    {recentProviders.map((provider) => (
                      <div key={provider.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                              {provider.businessName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {provider.businessName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-3 w-3" />
                                {provider.city}, {provider.province}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {provider.experienceYears} años experiencia
                                </Badge>
                                {!provider.isVerified && (
                                  <Badge variant="secondary" className="text-xs text-orange-600">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Pendiente verificación
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Ver perfil
                            </Button>
                            <Button size="sm">
                              <Shield className="h-4 w-4 mr-1" />
                              Verificar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay verificaciones pendientes
                    </h3>
                    <p className="text-slate-600">
                      Todos los profesionales están verificados.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Solicitudes recientes
                </CardTitle>
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent>
                {recentRequests && recentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recentRequests.slice(0, 10).map((request) => {
                      const statusConfig = getStatusBadge(request.status);
                      
                      return (
                        <div key={request.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">
                                {request.title}
                              </h3>
                              <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {request.city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(request.createdAt).toLocaleDateString('es-AR')}
                                </div>
                                {request.estimatedBudget && (
                                  <div className="font-medium">
                                    ${Number(request.estimatedBudget).toLocaleString('es-AR')} ARS
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                              {request.isUrgent && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Urgente
                                </Badge>
                              )}
                              <Button size="sm" variant="outline">
                                Ver detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay solicitudes
                    </h3>
                    <p className="text-slate-600">
                      No se han recibido solicitudes recientemente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Categorías de servicios
                </CardTitle>
                <Button onClick={() => setShowCategoryForm(true)}>
                  Agregar categoría
                </Button>
              </CardHeader>
              <CardContent>
                {categories && categories.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {category.name}
                          </h3>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-slate-600 mb-3">
                            {category.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category);
                              setShowCategoryForm(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCategoryMutation.mutate({ 
                              id: category.id, 
                              isActive: !category.isActive 
                            })}
                          >
                            {category.isActive ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay categorías
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Comienza creando las primeras categorías de servicios.
                    </p>
                    <Button>
                      Crear primera categoría
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crecimiento de la plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">+127%</div>
                      <p className="text-slate-600">Crecimiento en usuarios este año</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 mb-1">2,840</div>
                        <p className="text-xs text-slate-600">Nuevos usuarios este mes</p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600 mb-1">456</div>
                        <p className="text-xs text-slate-600">Nuevos profesionales</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Rendimiento financiero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${(485000).toLocaleString('es-AR')}
                      </div>
                      <p className="text-slate-600">Volumen transaccional este mes</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600 mb-1">
                          ${(24250).toLocaleString('es-AR')}
                        </div>
                        <p className="text-xs text-slate-600">Comisiones generadas</p>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600 mb-1">5.0%</div>
                        <p className="text-xs text-slate-600">Comisión promedio</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Modifica los detalles de la categoría."
                : "Crea una nueva categoría de servicio para la plataforma."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                icon: formData.get("icon") as string,
              };
              
              if (editingCategory) {
                // TODO: Implement edit functionality
                toast({
                  title: "En desarrollo",
                  description: "La edición de categorías estará disponible pronto.",
                });
              } else {
                createCategoryMutation.mutate(data);
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCategory?.name || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCategory?.description || ""}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Icono
                </Label>
                <Input
                  id="icon"
                  name="icon"
                  defaultValue={editingCategory?.icon || ""}
                  className="col-span-3"
                  placeholder="ej: wrench, hammer, paint-roller"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {editingCategory ? "Guardar cambios" : "Crear categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
