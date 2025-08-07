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
      // Here would be the actual registration API call
      // For now, we'll simulate the process and show what would happen
      
      console.log("Registration data with legal acceptance:", {
        ...data,
        acceptedAt: new Date().toISOString(),
        ipAddress: "user-ip", // In real implementation, get from backend
        userAgent: navigator.userAgent,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "¡Cuenta creada exitosamente!",
        description: "Se ha enviado un email de verificación a tu dirección de correo.",
        duration: 5000,
      });

      // In real implementation, redirect to email verification or login
      // window.location.href = "/api/login"; 
      
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error al crear la cuenta",
        description: "Por favor, inténtalo de nuevo más tarde.",
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