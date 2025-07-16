import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Calendar, 
  MapPin, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Star
} from "lucide-react";
import { insertServiceRequestSchema, type ServiceProvider } from "@shared/schema";
import { z } from "zod";

const bookingFormSchema = insertServiceRequestSchema.extend({
  categoryId: z.number().min(1, "Selecciona una categoría"),
  preferredDate: z.string().min(1, "Selecciona una fecha"),
  estimatedBudget: z.string().optional(),
}).omit({ customerId: true, providerId: true });

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  provider: ServiceProvider;
  onClose: () => void;
}

export function BookingForm({ provider, onClose }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: provider.city || "",
      province: provider.province || "",
      categoryId: undefined,
      preferredDate: "",
      estimatedBudget: "",
      isUrgent: false,
      customerNotes: "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const requestData = {
        ...data,
        providerId: provider.id,
        estimatedBudget: data.estimatedBudget ? parseFloat(data.estimatedBudget) : null,
        preferredDate: new Date(data.preferredDate).toISOString(),
      };
      
      const response = await apiRequest("POST", "/api/requests", requestData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada al profesional. Te contactaremos pronto.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Iniciando sesión...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "No pudimos enviar tu solicitud. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (step === 1) {
      setStep(2);
    } else {
      createRequestMutation.mutate(data);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const formattedMinDate = minDate.toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {step === 1 ? "Detalles del servicio" : "Confirmar solicitud"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Provider Info */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={provider.profileImageUrl || undefined} 
                alt={provider.businessName || 'Profesional'} 
              />
              <AvatarFallback>
                {provider.businessName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-900">{provider.businessName}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{provider.rating}</span>
                </div>
                {provider.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <>
              {/* Step 1: Service Details */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="categoryId">Categoría del servicio *</Label>
                  <Select
                    value={form.watch("categoryId")?.toString()}
                    onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Título de la solicitud *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Reparación de tubería en el baño"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descripción detallada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el problema o servicio que necesitas en detalle..."
                    rows={4}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Fecha preferida *</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      min={formattedMinDate}
                      {...form.register("preferredDate")}
                    />
                    {form.formState.errors.preferredDate && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.preferredDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="estimatedBudget">Presupuesto estimado (ARS)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="estimatedBudget"
                        type="number"
                        placeholder="5000"
                        className="pl-10"
                        {...form.register("estimatedBudget")}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="address"
                      placeholder="Dirección completa donde se realizará el servicio"
                      className="pl-10"
                      {...form.register("address")}
                    />
                  </div>
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="province">Provincia *</Label>
                    <Input
                      id="province"
                      {...form.register("province")}
                    />
                    {form.formState.errors.province && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.province.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerNotes">Notas adicionales</Label>
                  <Textarea
                    id="customerNotes"
                    placeholder="Información adicional que el profesional debe saber..."
                    rows={3}
                    {...form.register("customerNotes")}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isUrgent"
                    checked={form.watch("isUrgent")}
                    onCheckedChange={(checked) => form.setValue("isUrgent", !!checked)}
                  />
                  <Label htmlFor="isUrgent" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Es urgente (el profesional será notificado inmediatamente)
                  </Label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Confirmation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Resumen de tu solicitud</h3>
                
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Servicio:</span>
                    <p className="text-slate-900">{form.watch("title")}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-slate-700">Descripción:</span>
                    <p className="text-slate-900">{form.watch("description")}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-700">Fecha preferida:</span>
                      <p className="text-slate-900">
                        {form.watch("preferredDate") && new Date(form.watch("preferredDate")).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    
                    {form.watch("estimatedBudget") && (
                      <div>
                        <span className="text-sm font-medium text-slate-700">Presupuesto:</span>
                        <p className="text-slate-900">
                          ${Number(form.watch("estimatedBudget")).toLocaleString('es-AR')} ARS
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-slate-700">Ubicación:</span>
                    <p className="text-slate-900">
                      {form.watch("address")}, {form.watch("city")}, {form.watch("province")}
                    </p>
                  </div>
                  
                  {form.watch("isUrgent") && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Marcado como urgente</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">¿Qué sucede después?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• El profesional recibirá tu solicitud inmediatamente</li>
                    <li>• Te enviará un presupuesto personalizado</li>
                    <li>• Podrás revisar y aceptar la propuesta</li>
                    <li>• El pago se procesa de forma segura</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Volver
              </Button>
            )}
            
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Enviando...
                </div>
              ) : (
                step === 1 ? "Continuar" : "Enviar solicitud"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
