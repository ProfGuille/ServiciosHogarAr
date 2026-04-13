import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";

interface RegistrationFormProps {
  onRegister: (data: RegistrationData) => void;
  isLoading?: boolean;
}

interface RegistrationData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  legalAccepted: boolean;
  marketingConsent: boolean;
}

export function RegistrationForm({ onRegister, isLoading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    legalAccepted: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
    }

    // Required legal acceptance
    if (!formData.legalAccepted) {
      newErrors.legal = "Debe aceptar los términos legales para continuar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister(formData);
    }
  };

  const updateField = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing/checking
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const allRequiredAccepted = formData.legalAccepted;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Únete a ServiciosHogar.com.ar para conectar con los mejores profesionales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+54 11 1234-5678"
            />
            <p className="text-xs text-slate-500">
              Formato sugerido: +54 11 1234-5678
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            <p className="text-xs text-slate-500">
              Mínimo 8 caracteres, incluye mayúscula, minúscula y número
            </p>
          </div>

          {/* Legal Compliance Section */}
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Aceptación Legal Obligatoria
              </h3>
            </div>

            {/* Legal acceptance (unified) */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="legalAccepted"
                  checked={formData.legalAccepted}
                  onCheckedChange={(checked) => updateField("legalAccepted", !!checked)}
                />
                <div className="text-sm">
                  <label htmlFor="legalAccepted" className="cursor-pointer">
                    He leído y acepto los{" "}
                    <Link href="/terminos" className="text-primary underline">Términos y Condiciones</Link>
                    {", "}la{" "}
                    <Link href="/privacidad" className="text-primary underline">Política de Privacidad</Link>
                    {" "}(Ley 25.326) y el{" "}
                    <Link href="/aviso-legal" className="text-primary underline">Aviso Legal</Link>
                    {", "}incluyendo el procesamiento de mis datos personales para los fines descritos.
                  </label>
                  {errors.legal && <p className="text-red-500 text-xs mt-1">{errors.legal}</p>}
                </div>
              </div>

              {/* Marketing Consent (Optional) */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => updateField("marketingConsent", !!checked)}
                />
                <div className="text-sm">
                  <label htmlFor="marketing" className="cursor-pointer text-slate-600">
                    (Opcional) Acepto recibir comunicaciones comerciales y promociones
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Warning if not all accepted */}
          {!allRequiredAccepted && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Debe aceptar todos los términos legales obligatorios para continuar.
                </p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !allRequiredAccepted}
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Al crear una cuenta, confirma que ha leído y entiende todos los términos legales
            y acepta las limitaciones de responsabilidad de ServiciosHogar.com.ar
          </p>
        </form>
      </CardContent>
    </Card>
  );
}