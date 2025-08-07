import { useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    document.title = "Iniciar Sesión - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-600">
            Inicia sesión para acceder a tu cuenta
          </p>
        </div>

        <LoginForm />

        {/* Legal Compliance Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            Política de Privacidad
          </h3>
          <p className="text-sm text-blue-700">
            Al iniciar sesión, aceptas nuestros{" "}
            <button 
              onClick={() => setLocation('/terminos')}
              className="underline hover:no-underline"
            >
              Términos y Condiciones
            </button>
            {" "}y{" "}
            <button 
              onClick={() => setLocation('/privacidad')}
              className="underline hover:no-underline"
            >
              Política de Privacidad
            </button>
            .
          </p>
        </div>
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}