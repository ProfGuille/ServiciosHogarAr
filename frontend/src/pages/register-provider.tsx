import { useState, useEffect } from "react";
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
import { LocationPicker } from "@/components/maps/LocationPicker";

interface Category {
  id: number;
  name: string;
}

export default function RegisterProvider() {
  const [, setLocation] = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    city: '',
    province: '',
    phone: '',
    serviceCategories: [] as string[],
    termsAccepted: false,
    privacyAccepted: true,
    legalDisclaimerAccepted: true,
    dataProcessingConsent: true,
    marketingConsent: false,
  });

  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cargar categorías desde la API
  useEffect(() => {
    fetch(getApiUrl('/api/categories'))
      .then(res => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {
        // Fallback con las 25 categorías conocidas si la API no responde
        setCategories([
          { id: 1,  name: "Plomería" },
          { id: 2,  name: "Electricidad" },
          { id: 3,  name: "Pintura" },
          { id: 4,  name: "Limpieza" },
          { id: 5,  name: "Carpintería" },
          { id: 6,  name: "Gasista" },
          { id: 7,  name: "Albañilería" },
          { id: 8,  name: "Aire Acondicionado" },
          { id: 9,  name: "Jardinería" },
          { id: 10, name: "Cerrajería" },
          { id: 11, name: "Mudanzas" },
          { id: 12, name: "Herrería" },
          { id: 13, name: "Techos" },
          { id: 14, name: "Fumigación" },
          { id: 15, name: "Electrodomésticos" },
          { id: 16, name: "Tapicería" },
          { id: 17, name: "Vidriería" },
          { id: 18, name: "Pisos y Revestimientos" },
          { id: 19, name: "Alarmas y Seguridad" },
          { id: 20, name: "Piscinas" },
          { id: 21, name: "Decoración" },
          { id: 22, name: "Durlock" },
          { id: 23, name: "Automatización" },
          { id: 24, name: "Energía Solar" },
          { id: 25, name: "Calefacción" },
        ]);
      });
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completá todos los campos obligatorios');
      return;
    }
    if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      return;
    }
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[\s\-().+]/g, '');
      if (!/^\d{6,15}$/.test(cleanPhone)) {
        setError('El teléfono debe tener entre 6 y 15 dígitos');
        return;
      }
    }
    if (formData.serviceCategories.length === 0) {
      setError('Seleccioná al menos un servicio');
      return;
    }
    if (!formData.termsAccepted) {
      setError('Debés aceptar los términos y condiciones');
      return;
    }
    if (!providerLocation) {
      setError('Seleccioná tu ubicación en el mapa');
      return;
    }
    if (!formData.city) {
      setError('No pudimos detectar tu ciudad. Buscá tu dirección completa en el mapa (incluí calle y número).');
      return;
    }
    if (!formData.province) {
      setError('No pudimos detectar tu provincia. Buscá tu dirección completa en el mapa (incluí calle y número).');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/register-provider'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, referralCode: localStorage.getItem("referralCode") || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al registrar');
      }

      const regData = await response.json();
      // Guardar ubicación si tenemos providerId
      if (regData.providerId && providerLocation) {
        const token = regData.token;
        await fetch(getApiUrl(`/api/providers/${regData.providerId}/location`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ latitude: providerLocation.lat, longitude: providerLocation.lng }),
        }).catch(() => {});
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
        : [...prev.serviceCategories, categoryId],
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
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido a ServiciosHogar!</h2>
              <p className="text-gray-600 mb-2">
                Tu cuenta fue creada exitosamente.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-blue-800 mb-2">🎁 Tus 10 créditos de bienvenida ya están acreditados.</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Con cada crédito podés desbloquear los datos de un cliente interesado.</li>
                  <li>✅ Los clientes te contactarán directamente.</li>
                  <li>✅ Sin comisiones — cobrás el 100% del trabajo.</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">Redirigiendo al login en unos segundos...</p>
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
              Registrate como Profesional
            </h1>
            <p className="text-lg text-gray-600">
              Conectá con clientes que necesitan tus servicios
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tus datos</CardTitle>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {[
                        { ok: formData.password.length >= 8, label: 'Mínimo 8 caracteres' },
                        { ok: /[A-Z]/.test(formData.password), label: 'Una mayúscula' },
                        { ok: /[a-z]/.test(formData.password), label: 'Una minúscula' },
                        { ok: /[0-9]/.test(formData.password), label: 'Un número' },
                      ].map(({ ok, label }) => (
                        <p key={label} className={`text-xs flex items-center gap-1 ${ok ? 'text-green-600' : 'text-slate-400'}`}>
                          <span>{ok ? '✓' : '○'}</span> {label}
                        </p>
                      ))}
                    </div>
                  )}
                  {formData.password.length === 0 && (
                    <p className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres, una mayúscula, una minúscula y un número.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nombre del Negocio *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Ej: Plomería Buenos Aires"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Tu ubicación *</Label>
                  <p className="text-xs text-gray-500 mb-2">Buscá tu dirección o hacé clic en el mapa</p>
                  <LocationPicker
                    onLocationSelect={(loc) => {
                      setProviderLocation(loc);
                      const parts = loc.address.split(',').map((p: string) => p.trim());
                      const city = parts.length > 2 ? parts[parts.length - 3] || parts[0] : parts[0];
                      const province = parts.length > 2 ? parts[parts.length - 2] || '' : '';
                      setFormData(prev => ({ ...prev, city, province }));
                    }}
                    height="220px"
                    showAddressSearch={true}
                    placeholder="Buscá tu dirección..."
                  />
                  {providerLocation && (
                    <p className="text-xs text-green-600 mt-1">✓ Ubicación seleccionada</p>
                  )}
                </div>
              </div>

              {/* Categorías desde API */}
              <div className="space-y-3">
                <Label>Servicios que Ofrecés *</Label>
                <p className="text-sm text-gray-600">Seleccioná al menos un servicio</p>

                {categories.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando servicios...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(category => {
                      const isSelected = formData.serviceCategories.includes(String(category.id));
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(String(category.id))}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="text-white text-xs">✓</div>}
                            </div>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600">¿Tu especialidad no está en la lista? <a href="/contacto" className="text-blue-600 hover:underline font-medium">Solicitá que la agreguemos</a></p>
                </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={formData.termsAccepted}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, termsAccepted: !!checked }))}
                />
                <span className="text-sm">
                  Acepto los{' '}
                  <a href="/terminos" className="text-blue-600 hover:underline">términos y condiciones</a>
                  {' '}y la{' '}
                  <a href="/privacidad" className="text-blue-600 hover:underline">política de privacidad</a>
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Registrando...</>
                ) : (
                  <><CheckCircle className="mr-2 h-5 w-5" />Crear Cuenta de Profesional</>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tenés cuenta?{' '}
                  <button
                    onClick={() => setLocation('/login')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Iniciá sesión aquí
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
