import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wrench, Clock, Shield, Star, Home, Calendar, Settings } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosHerrero() {
  useEffect(() => {
    document.title = "Herreros - Trabajos en Metal y Aluminio - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Rejas y portones", icon: Home },
    { name: "Carpintería de aluminio", icon: Wrench },
    { name: "Estructuras metálicas", icon: Settings },
    { name: "Cerramientos", icon: Home },
    { name: "Escaleras de metal", icon: Settings },
    { name: "Automatización de portones", icon: Settings },
  ];

  const benefits = [
    "Diseños a medida",
    "Materiales de primera calidad",
    "Soldadura certificada",
    "Instalación incluida",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gray-100 text-gray-700 hover:bg-gray-200">
            <Wrench className="h-4 w-4 mr-1" />
            Trabajos en Metal
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Herreros Profesionales
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Fabricación e instalación de estructuras metálicas, rejas, portones y 
            carpintería de aluminio. Trabajos a medida con garantía de calidad.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=herrero">
            <Button size="lg" className="bg-gray-700 hover:bg-gray-800 text-white">
              <Wrench className="mr-2 h-5 w-5" />
              Buscar Herreros
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Presupuesto
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Herrería</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-gray-700" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-gray-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas de nuestros herreros</CardTitle>
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
                Plazos de entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Trabajamos con plazos claros. Una reja estándar se fabrica e 
                instala en 7-10 días hábiles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Garantía y durabilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Tratamiento antióxido y pintura de alta calidad. Garantía 
                de 2 años en todos los trabajos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre herrería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Trabajan con planos o diseños propios?</h3>
                <p className="text-slate-600">
                  Ambos. Podemos trabajar con tus planos o crear diseños personalizados.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Qué tipos de metal utilizan?</h3>
                <p className="text-slate-600">
                  Hierro, acero inoxidable, aluminio y otros según el proyecto.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Incluyen la pintura?</h3>
                <p className="text-slate-600">
                  Sí, todos los trabajos incluyen tratamiento antióxido y pintura final.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas trabajos en metal?</h2>
          <p className="text-slate-600 mb-6">
            Conectate con herreros expertos para tu proyecto
          </p>
          <Link href="/servicios?categoria=herrero">
            <Button size="lg" className="bg-gray-700 hover:bg-gray-800">
              Contactar Herreros
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}