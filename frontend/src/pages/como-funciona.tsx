import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, Calendar, CreditCard, Star, ArrowRight } from "lucide-react";

export default function ComoFunciona() {
  useEffect(() => {
    document.title = "Cómo Funciona - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      icon: Search,
      title: "1. Busca el servicio",
      description: "Busca el profesional que necesitas por categoría o ubicación. Filtra por calificaciones y precios."
    },
    {
      icon: UserCheck,
      title: "2. Elige tu profesional",
      description: "Revisa perfiles, calificaciones y reseñas. Todos nuestros profesionales están verificados."
    },
    {
      icon: Calendar,
      title: "3. Agenda tu servicio",
      description: "Selecciona fecha y hora que mejor te convenga. Describe tu necesidad específica."
    },
    {
      icon: CreditCard,
      title: "4. Paga de forma segura",
      description: "Múltiples opciones: Mercado Pago, transferencia bancaria o efectivo al profesional."
    },
    {
      icon: Star,
      title: "5. Califica la experiencia",
      description: "Ayuda a otros usuarios calificando el servicio recibido y dejando tu reseña."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            ¿Cómo funciona ServiciosHogar?
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            En 5 simples pasos conectamos tu hogar con profesionales de confianza
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-lg">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-slate-600 mb-8">
            Encuentra el profesional perfecto para tu hogar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/servicios">Buscar servicios</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/api/login">Registrarse como profesional</a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}