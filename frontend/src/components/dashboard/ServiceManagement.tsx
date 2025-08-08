import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Eye,
  EyeOff,
  Loader2,
  Briefcase
} from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceFormData {
  title: string;
  description: string;
  price: number;
  duration: number;
  categoryId: number;
  isActive: boolean;
}

const categoryOptions = [
  { value: 1, label: "Plomería" },
  { value: 2, label: "Electricidad" },
  { value: 3, label: "Carpintería" },
  { value: 4, label: "Pintura" },
  { value: 5, label: "Limpieza" },
  { value: 6, label: "Jardinería" },
  { value: 7, label: "Techado" },
  { value: 8, label: "Aire Acondicionado" },
  { value: 9, label: "Cerrajería" },
  { value: 10, label: "Albañilería" }
];

export default function ServiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    price: 0,
    duration: 60,
    categoryId: 1,
    isActive: true
  });

  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['provider-services'],
    queryFn: async () => {
      const response = await fetch('/api/provider/services', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar servicios');
      return response.json();
    }
  });

  // Create/Update service mutation
  const saveServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const url = editingService 
        ? `/api/provider/services/${editingService.id}`
        : '/api/provider/services';
      
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Error al guardar servicio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
      toast({
        title: "Éxito",
        description: `Servicio ${editingService ? 'actualizado' : 'creado'} correctamente`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch(`/api/provider/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al eliminar servicio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast({
        title: "Éxito",
        description: "Servicio eliminado correctamente"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle service status
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: number; isActive: boolean }) => {
      const response = await fetch(`/api/provider/services/${serviceId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Error al cambiar estado del servicio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
    }
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ action, serviceIds }: { action: 'activate' | 'deactivate' | 'delete'; serviceIds: number[] }) => {
      const response = await fetch('/api/provider/services/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, serviceIds })
      });
      if (!response.ok) throw new Error('Error en operación masiva');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setSelectedServices([]);
      toast({
        title: "Éxito",
        description: "Operación completada correctamente"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      duration: 60,
      categoryId: 1,
      isActive: true
    });
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price,
      duration: service.duration,
      categoryId: service.categoryId,
      isActive: service.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDuplicate = (service: Service) => {
    setEditingService(null);
    setFormData({
      title: `${service.title} (Copia)`,
      description: service.description,
      price: service.price,
      duration: service.duration,
      categoryId: service.categoryId,
      isActive: false
    });
    setIsDialogOpen(true);
  };

  const handleServiceSelection = (serviceId: number, selected: boolean) => {
    if (selected) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Servicios</CardTitle>
            <CardDescription>
              Administra tus servicios, precios y disponibilidad
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedServices.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkOperationMutation.mutate({ action: 'activate', serviceIds: selectedServices })}
                  disabled={bulkOperationMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Activar ({selectedServices.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkOperationMutation.mutate({ action: 'deactivate', serviceIds: selectedServices })}
                  disabled={bulkOperationMutation.isPending}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Desactivar ({selectedServices.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => bulkOperationMutation.mutate({ action: 'delete', serviceIds: selectedServices })}
                  disabled={bulkOperationMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar ({selectedServices.length})
                </Button>
              </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingService(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                  </DialogTitle>
                  <DialogDescription>
                    Complete la información del servicio que desea {editingService ? 'actualizar' : 'ofrecer'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título del Servicio</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ej: Reparación de grifos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={formData.categoryId.toString()} onValueChange={(value) => setFormData({...formData, categoryId: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.value} value={category.value.toString()}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describa el servicio en detalle..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Precio (ARS)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duración (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                        placeholder="60"
                        min="15"
                        step="15"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Servicio activo</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => saveServiceMutation.mutate(formData)}
                    disabled={saveServiceMutation.isPending}
                  >
                    {saveServiceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingService ? 'Actualizar' : 'Crear'} Servicio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No tienes servicios creados
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primer servicio para empezar a recibir solicitudes de clientes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service: Service) => (
              <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={(e) => handleServiceSelection(service.id, e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        <Badge variant="outline">
                          {categoryOptions.find(c => c.value === service.categoryId)?.label}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${service.price.toLocaleString()} ARS
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={(checked) => toggleServiceMutation.mutate({ 
                        serviceId: service.id, 
                        isActive: checked 
                      })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(service)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteServiceMutation.mutate(service.id)}
                      disabled={deleteServiceMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}