import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Frame, Clock, Shield, Star, Home, Calendar, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosVidriero() {
  useEffect(() => {
    document.title = "Vidrieros - Instalación y Reparación - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Cambio de vidrios", icon: Frame },
    { name: "Espejos a medida", icon: Frame },
    { name: "Mamparas de baño", icon: Home },
    { name: "Cerramientos de vidrio", icon: Home },
    { name: "Vidrios de seguridad", icon: Shield },
    { name: "Urgencias 24hs", icon: AlertTriangle },
  ];

  const benefits = [
    "Atención de urgencias 24/7",
    "Vidrios templados y laminados",
    "Medición sin cargo",
    "Instalación profesional",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
            <Frame className="h-4 w-4 mr-1" />
            Cristalería y Vidrios
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Vidrieros Profesionales
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Instalación, reparación y reemplazo de vidrios. Servicio de urgencias 
            24 horas para vidrios rotos. Trabajamos con las mejores calidades.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=vidriero">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Frame className="mr-2 h-5 w-5" />
              Buscar Vidrieros
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Presupuesto
            </Button>
          </Link>
        </div>

        {/* Emergency Alert */}
        <Card className="mb-16 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-6 w-6" />
              ¿Vidrio roto? Urgencias 24hs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 font-semibold">
              No dejes tu hogar desprotegido. Servicio de emergencia disponible 
              las 24 horas para asegurar tu propiedad.
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Vidriería</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-cyan-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas de nuestro servicio</CardTitle>
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

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Respuesta inmediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Para urgencias llegamos en menos de 2 horas. Para trabajos 
                programados, agendamos según tu conveniencia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Vidrios de seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Ofrecemos vidrios templados y laminados para mayor seguridad. 
                Ideales para puertas y ventanas al exterior.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre vidriería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cuánto tarda un cambio de vidrio?</h3>
                <p className="text-slate-600">
                  Si tenemos el vidrio en stock, lo instalamos en el momento. Cortes especiales 24-48hs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Qué vidrio es mejor?</h3>
                <p className="text-slate-600">
                  Depende del uso: templado para seguridad, DVH para aislación, laminado para pisos altos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Trabajan en altura?</h3>
                <p className="text-slate-600">
                  Sí, contamos con personal capacitado y equipos de seguridad para trabajos en altura.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas un vidriero?</h2>
          <p className="text-slate-600 mb-6">
            Profesionales disponibles para urgencias y trabajos programados
          </p>
          <Link href="/servicios?categoria=vidriero">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              Contactar Vidriero Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}