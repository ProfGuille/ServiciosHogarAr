import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";

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
];

export default function RegisterProvider() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    city: '',
    phone: '',
    serviceCategories: [] as string[],
    termsAccepted: false,
    privacyAccepted: true,
    legalDisclaimerAccepted: true,
    dataProcessingConsent: true,
    marketingConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.serviceCategories.length === 0) {
      setError('Selecciona al menos un servicio');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/register-provider'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al registrar');
      }

      setSuccess(true);
      setTimeout(() => setLocation('/login'), 5000);

    } catch (err: any) {
      setError(err.message || 'Error al procesar el registro');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(categoryId)
        ? prev.serviceCategories.filter(id => id !== categoryId)
        : [...prev.serviceCategories, categoryId]
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center p-4 min-h-[80vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
              <p className="text-gray-600 mb-4">
                Recibirás 10 créditos de bienvenida. Redirigiendo...
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Registrate como Proveedor
            </h1>
            <p className="text-lg text-gray-600">
              Conectá con clientes que necesitan tus servicios
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Datos del Proveedor</CardTitle>
              <CardDescription>
                Completá tus datos para empezar a recibir solicitudes
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Ej: Plomería Buenos Aires"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Servicios que Ofreces *</Label>
                <p className="text-sm text-gray-600">
                  Selecciona al menos un servicio
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceCategories.map((category) => {
                    const isSelected = formData.serviceCategories.includes(category.id);
                    
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="text-white text-xs">✓</div>}
                          </div>
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: !!checked }))}
                />
                <span className="text-sm">
                  Acepto los términos y condiciones y la política de privacidad
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3"
              >
                {loading ? (
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

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => setLocation('/login')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-semibold mb-1">10 Créditos Gratis</h3>
              <p className="text-sm text-gray-600">Al registrarte</p>
            </Card>

            <Card className="text-center p-4">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">Sin Comisiones</h3>
              <p className="text-sm text-gray-600">Cobrás el 100% del trabajo</p>
            </Card>

            <Card className="text-center p-4">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">Contacto Directo</h3>
              <p className="text-sm text-gray-600">Hablás directo con el cliente</p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
