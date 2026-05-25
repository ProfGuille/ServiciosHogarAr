import { useState, useEffect } from "react";
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
  province: string;
  estimatedBudget: string;
  isUrgent: boolean;
  preferredDate: Date | undefined;
}

export default function CreateRequest() {
  const { user, isAuthenticated } = useAuth();
  const { data: userProfile } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState<CreateRequestForm>({
    title: "",
    description: "",
    categoryId: "",
    city: (user as any)?.city || "",
    province: (user as any)?.province || "",
    estimatedBudget: "",
    isUrgent: false,
    preferredDate: undefined,
  });

  // Precargar ubicación desde perfil cuando userProfile esté disponible
  useEffect(() => {
    const source = userProfile || user;
    if (source) {
      setForm(prev => ({
        ...prev,
        city: prev.city || (source as any).city || "",
        province: prev.province || (source as any).province || "",
      }));
    }
  }, [userProfile, user]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Proveedores no pueden crear solicitudes
  if (user?.userType === "provider") {
    setLocation("/dashboard");
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
      // Guardar ubicación en perfil del usuario para futuros formularios
      if (form.city || form.province) {
        const token = localStorage.getItem('token');
        fetch(`${import.meta.env.VITE_API_URL || 'https://api.servicioshogar.com.ar'}/api/auth/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ city: form.city, province: form.province }),
        }).then(() => {
          // Actualizar localStorage con nueva ubicación
          const cached = localStorage.getItem('user');
          if (cached) {
            const u = JSON.parse(cached);
            localStorage.setItem('user', JSON.stringify({ ...u, city: form.city, province: form.province }));
          }
        }).catch(() => {});
      }
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
      province: form.province,
      estimatedBudget: form.estimatedBudget ? parseFloat(form.estimatedBudget) : null,
      isUrgent: form.isUrgent,
      preferredDate: form.preferredDate?.toISOString(),
    };

    createRequestMutation.mutate(requestData);
  };

  const updateForm = (field: keyof CreateRequestForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const argProvinces = [
    "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
    "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
    "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
    "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
    "Tierra del Fuego", "Tucumán"
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

              {/* City + Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    placeholder="Ej: Buenos Aires"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    placeholder="Ej: Buenos Aires"
                    value={form.province}
                    onChange={(e) => updateForm("province", e.target.value)}
                    list="province-list"
                    maxLength={80}
                  />
                  <datalist id="province-list">
                    {argProvinces.map((p) => <option key={p} value={p} />)}
                  </datalist>
                </div>
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