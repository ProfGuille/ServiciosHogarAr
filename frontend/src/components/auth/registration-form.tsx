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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  termsAccepted: boolean;
  privacyAccepted: boolean;
  legalDisclaimerAccepted: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

export function RegistrationForm({ onRegister, isLoading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    termsAccepted: false,
    privacyAccepted: false,
    legalDisclaimerAccepted: false,
    dataProcessingConsent: false,
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

    // Required legal acceptances
    if (!formData.termsAccepted) {
      newErrors.terms = "Debe aceptar los Términos y Condiciones";
    }

    if (!formData.privacyAccepted) {
      newErrors.privacy = "Debe aceptar la Política de Privacidad";
    }

    if (!formData.legalDisclaimerAccepted) {
      newErrors.legal = "Debe aceptar el Aviso Legal";
    }

    if (!formData.dataProcessingConsent) {
      newErrors.dataProcessing = "Debe dar consentimiento para el procesamiento de datos";
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

  const allRequiredAccepted = formData.termsAccepted && 
                               formData.privacyAccepted && 
                               formData.legalDisclaimerAccepted && 
                               formData.dataProcessingConsent;

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

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => updateField("termsAccepted", !!checked)}
                />
                <div className="text-sm">
                  <label htmlFor="terms" className="cursor-pointer">
                    He leído y acepto los{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-primary underline">
                          Términos y Condiciones
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Términos y Condiciones</DialogTitle>
                          <DialogDescription>
                            Por favor, lea atentamente antes de aceptar
                          </DialogDescription>
                        </DialogHeader>
                        <div className="prose max-w-none text-sm">
                          <p><strong>IMPORTANTE:</strong> Al aceptar estos términos, usted reconoce que:</p>
                          <ul>
                            <li>ServiciosHogar.com.ar es una plataforma de intermediación</li>
                            <li>No prestamos servicios domésticos directamente</li>
                            <li>Los contratos se establecen entre cliente y prestador</li>
                            <li>Limitamos nuestra responsabilidad según la ley argentina</li>
                          </ul>
                          <p>Para ver los términos completos: <Link href="/terminos" className="text-primary underline">Términos y Condiciones</Link></p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </label>
                  {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) => updateField("privacyAccepted", !!checked)}
                />
                <div className="text-sm">
                  <label htmlFor="privacy" className="cursor-pointer">
                    Acepto la{" "}
                    <Link href="/privacidad" className="text-primary underline">
                      Política de Privacidad
                    </Link>{" "}
                    (Ley 25.326)
                  </label>
                  {errors.privacy && <p className="text-red-500 text-xs mt-1">{errors.privacy}</p>}
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="legal"
                  checked={formData.legalDisclaimerAccepted}
                  onCheckedChange={(checked) => updateField("legalDisclaimerAccepted", !!checked)}
                />
                <div className="text-sm">
                  <label htmlFor="legal" className="cursor-pointer">
                    He leído y entiendo el{" "}
                    <Link href="/aviso-legal" className="text-primary underline">
                      Aviso Legal y Descargo de Responsabilidad
                    </Link>
                  </label>
                  {errors.legal && <p className="text-red-500 text-xs mt-1">{errors.legal}</p>}
                </div>
              </div>

              {/* Data Processing Consent */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataProcessing"
                  checked={formData.dataProcessingConsent}
                  onCheckedChange={(checked) => updateField("dataProcessingConsent", !!checked)}
                />
                <div className="text-sm">
                  <label htmlFor="dataProcessing" className="cursor-pointer">
                    <strong>Acepto el procesamiento de mis datos personales</strong> para los fines 
                    descritos en la Política de Privacidad
                  </label>
                  {errors.dataProcessing && <p className="text-red-500 text-xs mt-1">{errors.dataProcessing}</p>}
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