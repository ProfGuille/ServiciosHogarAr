import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { argentineCities, popularCities } from "@/data/argentine-cities";
import { Loader2, CheckCircle, User, Building, MapPin, Phone, Briefcase } from "lucide-react";

interface ProviderRegistrationData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  city: string;
  customCity?: string;
  phone: string;
  cuilCuit?: string;
  serviceCategories: string[];
  termsAccepted: boolean;
  privacyAccepted: boolean;
  legalDisclaimerAccepted: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

const serviceCategories = [
  { id: "1", name: "Plomería" },
  { id: "2", name: "Electricidad" },
  { id: "3", name: "Carpintería" },
  { id: "4", name: "Pintura" },
  { id: "5", name: "Limpieza" },
  { id: "6", name: "Jardinería" },
  { id: "7", name: "Techado" },
  { id: "8", name: "Aire Acondicionado" },
  { id: "9", name: "Cerrajería" },
  { id: "10", name: "Albañilería" },
  { id: "11", name: "Gasista" },
  { id: "12", name: "Herrería" },
  { id: "13", name: "Fumigación" },
  { id: "14", name: "Mudanzas" },
  { id: "15", name: "Vidriero" },
  { id: "16", name: "Tapicería" },
  { id: "17", name: "Técnico en PC" },
  { id: "18", name: "Pequeños Arreglos" },
  { id: "19", name: "Instalador Solar" },
  { id: "20", name: "Lavado de Alfombras" },
  { id: "21", name: "Instalación de Pisos" },
  { id: "22", name: "Pintor de Casas" },
  { id: "23", name: "Cuidado de Mascotas" },
  { id: "24", name: "Niñera/Cuidado Infantil" },
  { id: "25", name: "Enfermería Domiciliaria" },
  { id: "26", name: "Masajes Terapéuticos" },
  { id: "27", name: "Clases Particulares" },
  { id: "28", name: "Traducción" },
  { id: "29", name: "Consultoría Contable" },
  { id: "30", name: "Asesoría Legal" }
];

const argentineCitiesOld = [
  "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "San Miguel de Tucumán",
  "La Plata", "Mar del Plata", "Salta", "Santa Fe", "San Juan",
  "Resistencia", "Neuquén", "Santiago del Estero", "Corrientes", "Avellaneda"
];

export default function RegisterProvider() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProviderRegistrationData>({
    name: "",
    email: "",
    password: "",
    businessName: "",
    city: "",
    customCity: "",
    phone: "",
    cuilCuit: "",
    serviceCategories: [],
    termsAccepted: false,
    privacyAccepted: false,
    legalDisclaimerAccepted: false,
    dataProcessingConsent: false,
    marketingConsent: false,
  });

  useEffect(() => {
    document.title = "Registro de Proveedor - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field: keyof ProviderRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(categoryId)
        ? prev.serviceCategories.filter(id => id !== categoryId)
        : [...prev.serviceCategories, categoryId]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({ title: "Error", description: "Email válido es obligatorio", variant: "destructive" });
      return false;
    }
    if (formData.password.length < 8) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 8 caracteres", variant: "destructive" });
      return false;
    }
    if (!formData.businessName.trim()) {
      toast({ title: "Error", description: "El nombre del negocio es obligatorio", variant: "destructive" });
      return false;
    }
    if (!formData.city.trim() && !formData.customCity?.trim()) {
      toast({ title: "Error", description: "La ciudad es obligatoria", variant: "destructive" });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Error", description: "El teléfono es obligatorio", variant: "destructive" });
      return false;
    }
    if (formData.serviceCategories.length === 0) {
      toast({ title: "Error", description: "Debe seleccionar al menos una categoría de servicio", variant: "destructive" });
      return false;
    }
    if (!formData.termsAccepted || !formData.privacyAccepted || !formData.legalDisclaimerAccepted || !formData.dataProcessingConsent) {
      toast({ title: "Error", description: "Debe aceptar todos los términos legales obligatorios", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const submissionData = {
        ...formData,
        city: formData.city || formData.customCity || "",
      };

      const response = await fetch('/api/auth/register-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        // Try to parse error response
        try {
          const result = await response.json();
          throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          // Handle non-JSON error responses with better messages
          if (response.status === 503 || response.status === 502) {
            throw new Error('El servicio de registro está temporalmente no disponible. El servidor se está actualizando. Por favor, inténtalo en unos minutos.');
          } else if (response.status === 404) {
            throw new Error('Servicio de registro no encontrado. El backend está en mantenimiento o experimentando problemas. Por favor, inténtalo más tarde o contacta soporte.');
          } else if (response.status === 409) {
            throw new Error('Ya existe una cuenta de proveedor con este email. Intenta iniciar sesión o recuperar tu contraseña.');
          } else if (response.status === 500) {
            throw new Error('Error interno del servidor. Nuestro equipo técnico ha sido notificado. Por favor, inténtalo más tarde.');
          } else {
            throw new Error(`Error de conexión (${response.status}). Verifica tu conexión a internet e inténtalo nuevamente.`);
          }
        }
      }

      const result = await response.json();

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta de proveedor ha sido creada. Recibirás 10 créditos de bienvenida.",
      });

      // Redirect to login
      setTimeout(() => {
        setLocation("/login");
      }, 2000);

    } catch (error) {
      console.error('Error al registrar proveedor:', error);
      
      let errorMessage = "Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo más tarde.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "No se puede conectar con el servidor. Verifica tu conexión a internet y que no tengas bloqueadores de contenido activos.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error en el registro",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Únete como Proveedor de Servicios
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conecta con clientes que necesitan tus servicios profesionales en toda Argentina
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building className="h-6 w-6" />
                Registro de Proveedor
              </CardTitle>
              <CardDescription className="text-blue-100">
                Completa tu perfil profesional para comenzar a recibir solicitudes de trabajo
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+54 11 1234-5678"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cuilCuit">CUIL/CUIT (Opcional)</Label>
                      <Input
                        id="cuilCuit"
                        value={formData.cuilCuit || ""}
                        onChange={(e) => handleInputChange('cuilCuit', e.target.value)}
                        placeholder="20-12345678-9"
                      />
                      <p className="text-xs text-slate-500">
                        Formato: 20-12345678-9
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Información del Negocio
                  </h3>
                  
                  <div>
                    <Label htmlFor="city">Ciudad Principal de Trabajo</Label>
                    <Select 
                      value={formData.city || ""} 
                      onValueChange={(value) => {
                        if (value === "custom") {
                          handleInputChange('city', "");
                        } else {
                          handleInputChange('city', value);
                          handleInputChange('customCity', "");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu ciudad" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        <div className="font-semibold text-xs text-gray-500 px-2 py-1">
                          CIUDADES POPULARES
                        </div>
                        {popularCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <div className="font-semibold text-xs text-gray-500 px-2 py-1 border-t mt-1 pt-2">
                          TODAS LAS CIUDADES
                        </div>
                        {argentineCities.filter(city => !popularCities.includes(city)).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <div className="border-t mt-1 pt-1">
                          <SelectItem value="custom">
                            <span className="font-medium text-blue-600">+ Escribir otra ciudad</span>
                          </SelectItem>
                        </div>
                      </SelectContent>
                    </Select>
                    
                    {formData.city === "" && (
                      <div className="mt-2">
                        <Input
                          placeholder="Escribe el nombre de tu ciudad"
                          value={formData.customCity || ""}
                          onChange={(e) => handleInputChange('customCity', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio/Empresa</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Ej: Plomería Buenos Aires"
                      required
                    />
                  </div>
                </div>

                {/* Service Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Categorías de Servicios que Ofreces
                  </h3>
                  <p className="text-sm text-gray-600">
                    Selecciona todos los servicios que ofreces (mínimo 1)
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviceCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.serviceCategories.includes(category.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryToggle(category.id);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.serviceCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked !== formData.serviceCategories.includes(category.id)) {
                                handleCategoryToggle(category.id);
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          />
                          <span 
                            className="text-sm font-medium select-none"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            {category.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {formData.serviceCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.serviceCategories.map((categoryId) => {
                        const category = serviceCategories.find(c => c.id === categoryId);
                        return (
                          <Badge key={categoryId} variant="secondary">
                            {category?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Legal Compliance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🛡️ Aceptación Legal Obligatoria
                  </h3>
                  <p className="text-sm text-gray-600">
                    Para cumplir con la Ley 25.326 de Protección de Datos Personales de Argentina
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                        required
                      />
                      <span className="text-sm">
                        He leído y acepto los{" "}
                        <a href="/terminos" className="text-blue-600 hover:underline">
                          Términos y Condiciones
                        </a>
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        checked={formData.privacyAccepted}
                        onCheckedChange={(checked) => handleInputChange('privacyAccepted', checked)}
                        required
                      />
                      <span className="text-sm">
                        Acepto la{" "}
                        <a href="/privacidad" className="text-blue-600 hover:underline">
                          Política de Privacidad
                        </a>{" "}
                        (Ley 25.326)
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        checked={formData.legalDisclaimerAccepted}
                        onCheckedChange={(checked) => handleInputChange('legalDisclaimerAccepted', checked)}
                        required
                      />
                      <span className="text-sm">
                        He leído y entiendo el{" "}
                        <a href="/aviso-legal" className="text-blue-600 hover:underline">
                          Aviso Legal y Descargo de Responsabilidad
                        </a>
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        checked={formData.dataProcessingConsent}
                        onCheckedChange={(checked) => handleInputChange('dataProcessingConsent', checked)}
                        required
                      />
                      <span className="text-sm">
                        Acepto el procesamiento de mis datos personales para los fines descritos en la Política de Privacidad
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                      />
                      <span className="text-sm text-gray-600">
                        (Opcional) Acepto recibir comunicaciones comerciales y promociones
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Crear Cuenta de Proveedor
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    onClick={() => setLocation("/login")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Créditos de Bienvenida</h3>
              <p className="text-sm text-gray-600">
                Recibe 10 créditos gratis para comenzar a acceder a solicitudes de trabajo
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Cobertura Nacional</h3>
              <p className="text-sm text-gray-600">
                Accede a solicitudes de trabajo en toda Argentina
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Contacto Directo</h3>
              <p className="text-sm text-gray-600">
                Obtén la información de contacto de clientes interesados en tus servicios
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}