import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, MapPin, Heart } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "Acerca de - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Acerca de ServiciosHogar.com.ar
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Conectamos hogares argentinos con profesionales de confianza para servicios del hogar.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Nuestra mision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              ServiciosHogar.com.ar nacio para simplificar la busqueda de profesionales del hogar en Argentina.
              Los clientes publican sus solicitudes de forma gratuita y los profesionales las reciben en tiempo real,
              contactando directamente a quien necesita el servicio. Sin intermediarios, sin complicaciones.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Profesionales verificados</h3>
              <p className="text-sm text-slate-600">
                Los profesionales pueden verificar su identidad. Los perfiles verificados muestran un distintivo visible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Por zona</h3>
              <p className="text-sm text-slate-600">
                Cada solicitud se publica con ubicacion para que los profesionales de la zona la reciban primero.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Contacto directo</h3>
              <p className="text-sm text-slate-600">
                El profesional contacta al cliente directamente. El precio y la forma de pago se acuerdan entre las partes.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Servicios disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Plomeria", "Electricidad", "Limpieza", "Carpinteria",
                "Pintura", "Jardineria", "Cerrajeria", "Refrigeracion",
                "Instalaciones", "Reparaciones", "Mantenimiento", "Mudanzas"
              ].map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 text-sm">
            Tenes preguntas? Escribinos desde el{" "}
            <a href="/contacto" className="underline font-medium">formulario de contacto</a>.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
