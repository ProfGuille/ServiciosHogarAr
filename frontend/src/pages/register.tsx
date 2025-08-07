import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RegistrationForm } from "@/components/auth/registration-form";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  legalDisclaimerAccepted: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Registro - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const handleRegister = async (data: RegistrationData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          termsAccepted: data.termsAccepted,
          privacyAccepted: data.privacyAccepted,
          legalDisclaimerAccepted: data.legalDisclaimerAccepted,
          dataProcessingConsent: data.dataProcessingConsent,
          marketingConsent: data.marketingConsent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la cuenta');
      }

      // Log for legal audit trail (client-side)
      console.log("Registration successful with legal compliance:", {
        userId: result.user.id,
        email: result.user.email,
        acceptedAt: result.user.termsAcceptedAt,
        legalAcceptances: {
          terms: data.termsAccepted,
          privacy: data.privacyAccepted,
          legalDisclaimer: data.legalDisclaimerAccepted,
          dataProcessing: data.dataProcessingConsent,
          marketing: data.marketingConsent,
        }
      });

      toast({
        title: "¡Cuenta creada exitosamente!",
        description: "Su cuenta ha sido creada y todos los términos legales han sido registrados correctamente.",
        duration: 5000,
      });

      // In real implementation, redirect to login or email verification
      setTimeout(() => {
        window.location.href = "/api/login"; 
      }, 2000);
      
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error al crear la cuenta",
        description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Crear Cuenta
          </h1>
          <p className="text-slate-600">
            Únete a la plataforma líder en servicios domésticos de Argentina
          </p>
        </div>

        <RegistrationForm 
          onRegister={handleRegister}
          isLoading={isLoading}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <button 
              onClick={() => window.location.href = "/api/login"}
              className="text-primary hover:underline font-medium"
            >
              Iniciar sesión
            </button>
          </p>
        </div>

        {/* Legal Compliance Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            Cumplimiento Legal - Ley 25.326
          </h3>
          <p className="text-sm text-blue-700">
            Sus datos personales serán tratados conforme a la Ley 25.326 de Protección de Datos Personales. 
            Puede ejercer sus derechos de acceso, rectificación y supresión contactando a{" "}
            <a href="mailto:privacidad@servicioshogar.com.ar" className="underline">
              privacidad@servicioshogar.com.ar
            </a>
          </p>
        </div>
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}