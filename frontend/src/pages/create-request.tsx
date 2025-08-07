import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CreateRequestForm {
  title: string;
  description: string;
  categoryId: string;
  city: string;
  estimatedBudget: string;
  isUrgent: boolean;
  preferredDate: Date | undefined;
}

export default function CreateRequest() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState<CreateRequestForm>({
    title: "",
    description: "",
    categoryId: "",
    city: "",
    estimatedBudget: "",
    isUrgent: false,
    preferredDate: undefined,
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear la solicitud");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Solicitud creada!",
        description: "Tu solicitud ha sido publicada. Los profesionales podrán contactarte pronto.",
      });
      setLocation("/mis-solicitudes");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.categoryId || !form.city) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      title: form.title,
      description: form.description,
      categoryId: parseInt(form.categoryId),
      city: form.city,
      estimatedBudget: form.estimatedBudget ? parseFloat(form.estimatedBudget) : null,
      isUrgent: form.isUrgent,
      preferredDate: form.preferredDate?.toISOString(),
    };

    createRequestMutation.mutate(requestData);
  };

  const updateForm = (field: keyof CreateRequestForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const argentineCities = [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán",
    "Mar del Plata", "Salta", "Santa Fe", "San Juan", "Resistencia", "Neuquén"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nueva Solicitud</CardTitle>
            <p className="text-slate-600">
              Describe el servicio que necesitas y conecta con profesionales verificados.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Título de la solicitud *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Reparación de canilla que gotea"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  maxLength={128}
                />
              </div>

              {/* Category */}
              <div>
                <Label>Categoría *</Label>
                <Select value={form.categoryId} onValueChange={(value) => updateForm("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : (
                      categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descripción detallada *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el problema o servicio que necesitas. Incluye detalles importantes como el tamaño del trabajo, ubicación específica, etc."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={4}
                  maxLength={1024}
                />
                <p className="text-sm text-slate-500 mt-1">
                  {form.description.length}/1024 caracteres
                </p>
              </div>

              {/* City */}
              <div>
                <Label>Ciudad *</Label>
                <Select value={form.city} onValueChange={(value) => updateForm("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {argentineCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div>
                <Label htmlFor="budget">Presupuesto estimado (ARS)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Ej: 15000"
                  value={form.estimatedBudget}
                  onChange={(e) => updateForm("estimatedBudget", e.target.value)}
                  min="0"
                  step="100"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Opcional - Ayuda a los profesionales a entender el alcance del trabajo
                </p>
              </div>

              {/* Preferred Date */}
              <div>
                <Label>Fecha preferida (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.preferredDate ? (
                        format(form.preferredDate, "PPP", { locale: es })
                      ) : (
                        "Selecciona una fecha"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.preferredDate}
                      onSelect={(date) => updateForm("preferredDate", date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Urgent checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={form.isUrgent}
                  onCheckedChange={(checked) => updateForm("isUrgent", checked)}
                />
                <Label htmlFor="urgent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Es urgente (necesito el servicio dentro de 24-48 horas)
                </Label>
              </div>

              {/* Submit button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                  className="flex-1"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando solicitud...
                    </>
                  ) : (
                    "Crear solicitud"
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/mis-solicitudes")}
                  disabled={createRequestMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>1.</strong> Publica tu solicitud con todos los detalles</p>
            <p><strong>2.</strong> Los profesionales verificados recibirán tu solicitud</p>
            <p><strong>3.</strong> Te contactarán directamente para coordinar el servicio</p>
            <p><strong>4.</strong> Elige el profesional que mejor se adapte a tus necesidades</p>
            <p className="text-slate-500 italic mt-4">
              ServiciosHogar.com.ar es una plataforma de intermediación. No participamos en la ejecución de los trabajos ni garantizamos los resultados.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}