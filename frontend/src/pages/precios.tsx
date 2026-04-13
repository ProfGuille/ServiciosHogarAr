import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Canonical from "@/components/Canonical";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Users, Unlock } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface CreditPackage {
  id: number;
  nombre: string;
  creditos: number;
  precio: number;
  destacado: boolean;
  activo: boolean;
}

export default function Precios() {
  useEffect(() => {
    document.title = "Precios - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const { data: paquetes, isLoading } = useQuery<CreditPackage[]>({
    queryKey: ["credit-packages-public"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/credits/packages`);
      if (!res.ok) throw new Error("Error al cargar paquetes");
      return res.json();
    },
  });

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

        {/* Clientes vs Profesionales */}
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
                Publicá solicitudes y recibí contactos de profesionales sin pagar nada.
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
                Sistema de créditos: cada crédito te permite ver los datos de contacto de un cliente interesado en tu categoría.
              </p>
              <ul className="space-y-2">
                {[
                  "10 créditos de regalo al registrarte",
                  "Acceso a todas las solicitudes de tu zona",
                  "Desbloqueás solo las que te interesan",
                  "Sin suscripción mensual obligatoria",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <div className="text-3xl font-bold text-slate-900">
                  $5.000 <span className="text-base font-normal text-slate-500">/ crédito</span>
                </div>
                <div className="text-sm text-slate-500">o menos con packs</div>
              </div>
              <Button className="w-full mt-2" asChild>
                <a href="/register-provider">Registrarme como profesional</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Paquetes */}
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Packs de créditos</h2>
        {isLoading ? (
          <div className="text-center text-slate-400 py-8">Cargando paquetes...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {(paquetes || []).map((p) => (
              <Card key={p.id} className={`relative border-2 ${p.destacado ? "border-primary" : "border-slate-200"}`}>
                {p.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-3 py-1">Más elegido</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{p.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-4xl font-bold text-slate-900">{p.creditos}</div>
                  <div className="text-slate-500 text-sm">créditos</div>
                  <div className="text-2xl font-bold text-primary">
                    ${p.precio.toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-slate-400">
                    ${Math.round(p.precio / p.creditos).toLocaleString("es-AR")} por crédito
                  </div>
                  <Button className="w-full" asChild>
                    <a href="/register-provider">Empezar</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cómo funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-primary" />
              Cómo funciona el sistema de créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-600 text-sm">
            <p>Cada vez que encontrás una solicitud que te interesa, usás 1 crédito para ver el nombre, teléfono y email del cliente.</p>
            <p>Solo pagás por los contactos que elegís. No hay costo por ver el listado de solicitudes disponibles.</p>
            <p>Los créditos no vencen. Podés comprarlos en packs desde tu dashboard profesional a través de Mercado Pago.</p>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 text-sm">
            ¿Tenés preguntas sobre el modelo de precios?{" "}
            <a href="/contacto" className="underline font-medium">Escribinos</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
