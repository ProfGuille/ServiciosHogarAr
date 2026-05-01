import { useEffect } from "react";
import Canonical from '@/components/Canonical';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, UserCheck, CreditCard, AlertTriangle } from "lucide-react";

export default function Seguridad() {
  useEffect(() => {
    document.title = "Seguridad - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Canonical path="/seguridad" />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Seguridad y Confianza</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Estas son las medidas reales que implementamos para proteger tu información y la de los profesionales.
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                Protección de datos personales
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-2">
              <p>Toda la comunicacion entre tu navegador y nuestros servidores viaja cifrada con SSL/TLS.</p>
              <p>Las contraseñas se almacenan con hash bcrypt — nunca en texto plano.</p>
              <p>Cumplimos con la Ley 25.326 de Protección de Datos Personales de Argentina.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-primary" />
                Verificación de profesionales
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-2">
              <p>Los profesionales pueden solicitar verificación de identidad enviando su documentacion al equipo de ServiciosHogar.</p>
              <p>Los perfiles verificados muestran un distintivo visible en su perfil publico.</p>
              <p>La verificación es voluntaria — te recomendamos preferir profesionales verificados.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagos seguros vía Mercado Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 space-y-2">
              <p>Los profesionales compran créditos a través de Mercado Pago. ServiciosHogar no almacena datos de tarjetas.</p>
              <p>El pago por el servicio contratado se acuerda directamente entre el cliente y el profesional — la plataforma no intermedia esa transaccion.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Consejos de seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Para clientes</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Revisa el perfil y calificaciones del profesional antes de contratarlo.</li>
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Preferí profesionales con el distintivo de verificado.</li>
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Acordá precio y condiciones antes de que el profesional comience el trabajo.</li>
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Reporta cualquier comportamiento sospechoso desde el formulario de contacto.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Para profesionales</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Mantene tu perfil actualizado con informacion veridica.</li>
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Solicita la verificacion de identidad para generar mas confianza en los clientes.</li>
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Acorda precio y alcance del trabajo antes de comenzar.</li>
                  <li className="flex gap-2"><Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />Reporta solicitudes fraudulentas o datos de contacto invalidos.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 text-sm">
            <strong>Detectaste algo sospechoso?</strong> Escribinos desde el{" "}
            <a href="/contacto" className="underline font-medium">formulario de contacto</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
