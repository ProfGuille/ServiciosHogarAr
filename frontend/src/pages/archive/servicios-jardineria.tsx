import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trees, Clock, Shield, Star, Flower, Calendar, Scissors } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosJardineria() {
  useEffect(() => {
    document.title = "Jardinería y Paisajismo - Diseño y Mantenimiento - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Diseño de jardines", icon: Trees },
    { name: "Mantenimiento mensual", icon: Scissors },
    { name: "Poda de árboles", icon: Trees },
    { name: "Instalación de césped", icon: Trees },
    { name: "Sistemas de riego", icon: Trees },
    { name: "Jardines verticales", icon: Flower },
  ];

  const benefits = [
    "Paisajistas profesionales",
    "Diseños personalizados",
    "Mantenimiento programado",
    "Plantas de vivero propio",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">
            <Trees className="h-4 w-4 mr-1" />
            Espacios Verdes
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Jardinería y Paisajismo Profesional
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transformá tus espacios exteriores en verdaderos oasis. Diseño, instalación 
            y mantenimiento de jardines con profesionales apasionados por la naturaleza.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=jardinería">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Trees className="mr-2 h-5 w-5" />
              Buscar Jardineros
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
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Jardinería</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-green-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-2xl">¿Por qué elegirnos para tu jardín?</CardTitle>
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

        {/* Seasonal Tips */}
        <Card className="mb-16 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Flower className="h-6 w-6" />
              Cuidados por temporada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Cada estación requiere cuidados específicos. Nuestros jardineros conocen 
              el calendario de poda, siembra y fertilización ideal para cada especie 
              y clima de Argentina.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Frecuencia de mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Recomendamos mantenimiento quincenal en verano y mensual en invierno 
                para mantener tu jardín siempre hermoso.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Jardines sustentables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Diseñamos con especies nativas y sistemas de riego eficientes 
                para crear jardines hermosos y ecológicos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre jardinería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Qué incluye el mantenimiento?</h3>
                <p className="text-slate-600">
                  Corte de césped, poda, control de plagas, fertilización y limpieza general.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Trabajan con balcones y terrazas?</h3>
                <p className="text-slate-600">
                  Sí, diseñamos jardines para todo tipo de espacios, incluyendo interiores.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Proveen las plantas?</h3>
                <p className="text-slate-600">
                  Sí, trabajamos con viveros de confianza y garantizamos la calidad de las plantas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Querés un jardín de revista?</h2>
          <p className="text-slate-600 mb-6">
            Encontrá jardineros y paisajistas expertos en tu zona
          </p>
          <Link href="/servicios?categoria=jardinería">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Contactar Jardineros
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}