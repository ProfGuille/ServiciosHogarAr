import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertServiceRequestSchema } from "@shared/schema";
import type { ServiceProvider } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, Phone, Mail, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const bookingFormSchema = z.object({
  providerId: z.number(),
  categoryId: z.number(),
  title: z.string().min(1, "Describe el servicio que necesitas"),
  description: z.string().min(10, "Proporciona más detalles sobre el servicio"),
  address: z.string().min(5, "Ingresa la dirección completa"),
  city: z.string().min(1, "Ingresa la ciudad"),
  province: z.string().min(1, "Ingresa la provincia"),
  estimatedBudget: z.number().min(1, "Ingresa un presupuesto estimado"),
  isUrgent: z.boolean().default(false),
  customerNotes: z.string().optional(),
  preferredDate: z.date({
    required_error: "Selecciona una fecha preferida",
  }),
  preferredTime: z.string().min(1, "Selecciona una hora preferida"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  provider: ServiceProvider;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingForm({ provider, isOpen, onClose }: BookingFormProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);

  // Load provider services
  const { data: providerServices, isLoading: servicesLoading } = useQuery({
    queryKey: [`/api/providers/${provider.id}/services`],
    enabled: isOpen,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      providerId: Number(provider.id),
      categoryId: 1, // Default to Plomería
      title: "",
      description: "",
      address: "",
      city: "Buenos Aires",
      province: "CABA",
      estimatedBudget: 0,
      isUrgent: false,
      customerNotes: "",
      preferredDate: new Date(),
      preferredTime: "09:00",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const { preferredDate, preferredTime, ...requestData } = data;
      
      // Combine date and time into a single datetime
      const [hours, minutes] = preferredTime.split(':');
      const preferredDateTime = new Date(preferredDate);
      preferredDateTime.setHours(parseInt(hours), parseInt(minutes));

      return await apiRequest("POST", "/api/requests", {
        ...requestData,
        preferredDate: preferredDateTime.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada al profesional. Te contactará pronto.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      onClose();
      form.reset();
      setStep(1);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Autorización requerida",
          description: "Debes iniciar sesión para solicitar servicios.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<BookingFormData> = (data) => {
    bookingMutation.mutate(data);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar servicio</DialogTitle>
          <DialogDescription>
            Completa los detalles para solicitar el servicio de {provider.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Detalles del servicio</span>
            <span>Fecha y hora</span>
            <span>Contacto</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de servicio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ej: Reparación de cañería, Instalación eléctrica..."
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
                      <FormLabel>Descripción detallada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el problema o servicio que necesitas..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isUrgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Es urgente
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Marca si necesitas el servicio con urgencia
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto estimado (ARS)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dirección del servicio
                  </h4>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección completa</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Corrientes 1234, Piso 5, Depto A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas adicionales</FormLabel>
                          <FormControl>
                            <Input placeholder="Información adicional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Fecha y hora preferida
                </h4>

                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha preferida</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora preferida</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={field.value === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => field.onChange(time)}
                              className="text-xs"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {time}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Información de contacto
                </h4>

                <FormField
                  control={form.control}
                  name="customerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Información de contacto y detalles</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Incluye tu teléfono, email y cualquier detalle adicional..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Resumen de la solicitud</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Profesional:</strong> {provider.businessName}</p>
                    <p><strong>Servicio:</strong> {form.watch("title")}</p>
                    <p><strong>Fecha:</strong> {form.watch("preferredDate") && format(form.watch("preferredDate"), "PPP", { locale: es })}</p>
                    <p><strong>Hora:</strong> {form.watch("preferredTime")}</p>
                    <p><strong>Presupuesto:</strong> ARS {form.watch("estimatedBudget")}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="ml-auto">
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="ml-auto"
                >
                  {bookingMutation.isPending ? "Enviando..." : "Enviar solicitud"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}