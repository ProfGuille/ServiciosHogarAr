import { useEffect } from "react";
import Canonical from '@/components/Canonical';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Users, Unlock } from "lucide-react";

export default function Precios() {
  useEffect(() => {
    document.title = "Precios - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Canonical path="/precios" />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Precios</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Modelo simple y transparente. Los clientes usan la plataforma gratis.
            Los profesionales pagan solo por los contactos que les interesan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Para clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600 text-sm mb-4">
                Publica solicitudes y recibe contactos de profesionales sin pagar nada.
              </p>
              <ul className="space-y-2">
                {[
                  "Publicar solicitudes de servicio",
                  "Recibir contactos de profesionales",
                  "Ver perfiles y calificaciones",
                  "Sin registro obligatorio",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <div className="text-3xl font-bold text-slate-900">Gratis</div>
                <div className="text-sm text-slate-500">siempre</div>
              </div>
              <Button className="w-full mt-2" asChild>
                <a href="/nueva-solicitud">Publicar una solicitud</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Para profesionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600 text-sm mb-4">
                Sistema de creditos: cada credito te permite ver los datos de contacto de un cliente interesado en tu categoria.
              </p>
              <ul className="space-y-2">
                {[
                  "10 creditos de regalo al registrarte",
                  "Acceso a todas las solicitudes de tu zona",
                  "Desbloqueas solo las que te interesan",
                  "Sin suscripcion mensual obligatoria",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <div className="text-3xl font-bold text-slate-900">Por credito</div>
                <div className="text-sm text-slate-500">packs disponibles en tu dashboard</div>
              </div>
              <Button className="w-full mt-2" asChild>
                <a href="/register-provider">Registrarme como profesional</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-primary" />
              Como funciona el sistema de creditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-600 text-sm">
            <p>Cada vez que encontras una solicitud que te interesa, usas 1 credito para ver el nombre, telefono y email del cliente.</p>
            <p>Solo pagas por los contactos que eliges. No hay costo por ver el listado de solicitudes disponibles.</p>
            <p>Los creditos no vencen. Podes comprarlos en packs desde tu dashboard profesional a traves de Mercado Pago.</p>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 text-sm">
            Tenes preguntas sobre el modelo de precios?{" "}
            <a href="/contacto" className="underline font-medium">Escribinos</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
