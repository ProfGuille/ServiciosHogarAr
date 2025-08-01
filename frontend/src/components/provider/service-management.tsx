import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Edit, Trash2, DollarSign, Clock, Tag } from "lucide-react";

const serviceFormSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  customServiceName: z.string().min(5, "El nombre debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  basePrice: z.string().min(1, "Ingresa un precio base"),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

interface ServiceManagementProps {
  providerId: number;
}

export function ServiceManagement({ providerId }: ServiceManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Load provider services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: [`/api/providers/${providerId}/services`],
  });

  // Load categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      categoryId: "",
      customServiceName: "",
      description: "",
      basePrice: "",
    },
  });

  const serviceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const payload = {
        ...data,
        providerId,
        categoryId: parseInt(data.categoryId),
        basePrice: parseFloat(data.basePrice),
      };

      if (editingService) {
        return await apiRequest("PUT", `/api/provider-services/${editingService.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/provider-services", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: editingService ? "Servicio actualizado" : "Servicio creado",
        description: editingService 
          ? "El servicio ha sido actualizado exitosamente." 
          : "El nuevo servicio ha sido agregado a tu perfil.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/services`] });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Autorización requerida",
          description: "Tu sesión ha expirado. Iniciando sesión...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 2000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el servicio",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      return await apiRequest("DELETE", `/api/provider-services/${serviceId}`);
    },
    onSuccess: () => {
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado de tu perfil.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/services`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (service: any) => {
    setEditingService(service);
    form.setValue("categoryId", service.categoryId.toString());
    form.setValue("customServiceName", service.customServiceName);
    form.setValue("description", service.description);
    form.setValue("basePrice", service.basePrice.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = (serviceId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      deleteMutation.mutate(serviceId);
    }
  };

  const onSubmit = (data: ServiceFormData) => {
    serviceMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Mis Servicios
            </CardTitle>
            <CardDescription>
              Gestiona los servicios que ofreces a tus clientes
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingService(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                </DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? "Modifica los detalles de tu servicio"
                    : "Agrega un nuevo servicio a tu perfil profesional"
                  }
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customServiceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Servicio</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ej: Reparación de filtraciones, Instalación eléctrica..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe detalladamente qué incluye este servicio..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Base (ARS)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="5000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={serviceMutation.isPending}
                    >
                      {serviceMutation.isPending ? "Guardando..." : 
                       editingService ? "Actualizar" : "Crear Servicio"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {servicesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes servicios registrados
            </h3>
            <p className="text-gray-500 mb-4">
              Agrega servicios para que los clientes puedan contratarte
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service: any) => (
              <div
                key={service.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{service.customServiceName}</h3>
                      <Badge variant="secondary">{service.categoryName}</Badge>
                      {service.isActive ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">ARS ${service.basePrice}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      disabled={deleteMutation.isPending}
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