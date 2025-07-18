import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wind, Clock, Shield, Star, Thermometer, Calendar, Wrench } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosTecnicoAire() {
  useEffect(() => {
    document.title = "Técnicos de Aire Acondicionado - Instalación y Service - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Instalación de aire split", icon: Wind },
    { name: "Service y mantenimiento", icon: Wrench },
    { name: "Carga de gas refrigerante", icon: Thermometer },
    { name: "Reparación de equipos", icon: Wrench },
    { name: "Instalación de aire central", icon: Wind },
    { name: "Limpieza de filtros", icon: Wind },
  ];

  const benefits = [
    "Técnicos certificados por marcas",
    "Service express en 24hs",
    "Garantía en reparaciones",
    "Repuestos originales disponibles",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Wind className="h-4 w-4 mr-1" />
            Climatización
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Técnicos de Aire Acondicionado
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Instalación, mantenimiento y reparación de aires acondicionados. 
            Mantené tu hogar fresco en verano y cálido en invierno con nuestros expertos.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=técnico de aire">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Wind className="mr-2 h-5 w-5" />
              Buscar Técnicos
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Service
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Aire Acondicionado</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-blue-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas de nuestros técnicos</CardTitle>
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

        {/* Temperature Tips */}
        <Card className="mb-16 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Thermometer className="h-6 w-6" />
              Temperatura ideal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              La temperatura recomendada es entre 24°C y 26°C en verano. Cada grado menos 
              aumenta el consumo en un 8%. Un buen mantenimiento puede ahorrar hasta un 30% de energía.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Service preventivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Recomendamos un service cada 6 meses para mantener el equipo en óptimas 
                condiciones y prolongar su vida útil.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Garantía extendida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Ofrecemos planes de mantenimiento anual con garantía extendida y 
                descuentos en repuestos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre aire acondicionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cada cuánto se debe cargar gas?</h3>
                <p className="text-slate-600">
                  Un equipo en buen estado no debería perder gas. Si necesita recarga frecuente, hay una fuga.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Qué incluye el service?</h3>
                <p className="text-slate-600">
                  Limpieza de filtros, verificación de gas, control de funcionamiento y limpieza de unidad exterior.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Cuánto dura la instalación?</h3>
                <p className="text-slate-600">
                  Una instalación estándar de split demora entre 3 y 4 horas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Tu aire necesita service?</h2>
          <p className="text-slate-600 mb-6">
            Conectate con técnicos especializados en tu zona
          </p>
          <Link href="/servicios?categoria=técnico de aire">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Solicitar Técnico Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}