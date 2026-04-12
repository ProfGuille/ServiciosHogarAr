import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Search, Phone, CreditCard, Star } from "lucide-react";

export default function ComoFunciona() {
  useEffect(() => {
    document.title = "Como Funciona - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const stepsCliente = [
    {
      icon: ClipboardList,
      title: "1. Publica tu solicitud",
      description: "Describe el servicio que necesitas: categoria, zona y detalle del trabajo. Es completamente gratis y podes hacerlo sin registrarte.",
    },
    {
      icon: Phone,
      title: "2. Los profesionales te contactan",
      description: "Los profesionales interesados desbloquean tus datos y se ponen en contacto con vos directamente para coordinar.",
    },
    {
      icon: Star,
      title: "3. Elegí y califica",
      description: "Contrata al profesional que mas te convenza y, una vez realizado el trabajo, deja tu calificacion para ayudar a otros usuarios.",
    },
  ];

  const stepsProfesional = [
    {
      icon: Search,
      title: "1. Revisa las solicitudes disponibles",
      description: "Desde tu dashboard profesional podes ver todas las solicitudes publicadas en tu zona y categoria.",
    },
    {
      icon: CreditCard,
      title: "2. Desbloquea los datos del cliente",
      description: "Usa un credito para ver el nombre, telefono y email del cliente. Al registrarte recibis 10 creditos de regalo.",
    },
    {
      icon: Phone,
      title: "3. Contacta al cliente directamente",
      description: "Coordina el trabajo y el precio directamente con el cliente. ServiciosHogar conecta — vos cerras el trato.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Como funciona ServiciosHogar?
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Conectamos clientes con profesionales del hogar de forma simple y directa.
          </p>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Para clientes</h2>
          <div className="grid gap-4">
            {stepsCliente.map((step, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button size="lg" asChild>
              <a href="/nueva-solicitud">Publicar una solicitud</a>
            </Button>
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Para profesionales</h2>
          <div className="grid gap-4">
            {stepsProfesional.map((step, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button size="lg" variant="outline" asChild>
              <a href="/register-provider">Registrarme como profesional</a>
            </Button>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 text-sm">
            <strong>ServiciosHogar no intermedia pagos.</strong> El precio y la forma de pago se acuerdan directamente entre el cliente y el profesional.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
