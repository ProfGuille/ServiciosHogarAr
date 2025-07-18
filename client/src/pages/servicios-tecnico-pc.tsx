import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Monitor, Clock, Shield, Star, Laptop, Calendar, Cpu } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosTecnicoPc() {
  useEffect(() => {
    document.title = "Técnicos de PC - Reparación y Soporte - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Reparación de PC", icon: Monitor },
    { name: "Instalación de software", icon: Cpu },
    { name: "Eliminación de virus", icon: Shield },
    { name: "Recuperación de datos", icon: Cpu },
    { name: "Armado de PC gamer", icon: Monitor },
    { name: "Soporte remoto", icon: Laptop },
  ];

  const benefits = [
    "Técnicos certificados",
    "Diagnóstico sin cargo",
    "Garantía en reparaciones",
    "Servicio a domicilio",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
            <Monitor className="h-4 w-4 mr-1" />
            Soporte Técnico
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Técnicos de Computadoras
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Reparación, mantenimiento y armado de computadoras. Solucionamos 
            problemas de hardware y software con servicio a domicilio.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=técnico PC">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Monitor className="mr-2 h-5 w-5" />
              Buscar Técnicos
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Servicio
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios Informáticos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-indigo-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl">¿Por qué elegirnos?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{benefit}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Remote Support */}
        <Card className="mb-16 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Laptop className="h-6 w-6" />
              Soporte remoto disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Para problemas de software, ofrecemos soporte remoto inmediato. 
              Solucionamos muchos problemas sin necesidad de visita.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Respuesta rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Servicio a domicilio en el día. Para empresas, ofrecemos 
                abonos de mantenimiento mensual.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Backup de datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Siempre realizamos backup preventivo antes de cualquier 
                reparación para proteger tu información.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre servicio técnico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cuánto tarda una reparación?</h3>
                <p className="text-slate-600">
                  La mayoría se resuelve en el día. Casos complejos pueden demorar 24-48hs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Tienen repuestos?</h3>
                <p className="text-slate-600">
                  Trabajamos con proveedores de confianza. Conseguimos repuestos originales y alternativos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Arman PC a medida?</h3>
                <p className="text-slate-600">
                  Sí, armamos PC gaming, oficina o diseño según tu presupuesto y necesidades.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Problemas con tu computadora?</h2>
          <p className="text-slate-600 mb-6">
            Técnicos expertos listos para ayudarte
          </p>
          <Link href="/servicios?categoria=técnico PC">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Solicitar Técnico Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}