import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, Clock, Shield, Star, Droplets, Calendar, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosTechista() {
  useEffect(() => {
    document.title = "Techistas - Reparación e Impermeabilización - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Reparación de goteras", icon: Droplets },
    { name: "Impermeabilización", icon: Shield },
    { name: "Cambio de tejas", icon: Home },
    { name: "Membranas asfálticas", icon: Shield },
    { name: "Canaletas y desagües", icon: Droplets },
    { name: "Techos de chapa", icon: Home },
  ];

  const benefits = [
    "Detección precisa de filtraciones",
    "Garantía escrita por 5 años",
    "Trabajos en altura seguros",
    "Materiales premium incluidos",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-sky-100 text-sky-700 hover:bg-sky-200">
            <Home className="h-4 w-4 mr-1" />
            Techos e Impermeabilización
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Techistas Especializados
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Solucionamos problemas de humedad, goteras y filtraciones. 
            Expertos en impermeabilización con garantía escrita de hasta 5 años.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=techista">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white">
              <Home className="mr-2 h-5 w-5" />
              Buscar Techistas
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Diagnóstico
            </Button>
          </Link>
        </div>

        {/* Urgency Alert */}
        <Card className="mb-16 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-6 w-6" />
              ¡No esperes más!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Las goteras y filtraciones empeoran con el tiempo. Una reparación a tiempo 
              puede ahorrarte miles de pesos en daños estructurales.
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Techado</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-sky-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-sky-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas de nuestros techistas</CardTitle>
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
                Diagnóstico sin cargo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Realizamos inspección completa para detectar el origen exacto 
                del problema antes de presupuestar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Garantía real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Garantía escrita de hasta 5 años en impermeabilizaciones. 
                Respaldamos nuestro trabajo.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre techos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cuánto dura una impermeabilización?</h3>
                <p className="text-slate-600">
                  Con materiales de calidad y buena aplicación, entre 5 y 10 años.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Trabajan con lluvia?</h3>
                <p className="text-slate-600">
                  Podemos hacer reparaciones de emergencia. Para impermeabilizar necesitamos tiempo seco.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Dan presupuesto sin cargo?</h3>
                <p className="text-slate-600">
                  Sí, la visita y el presupuesto son gratuitos y sin compromiso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Goteras o humedad en tu techo?</h2>
          <p className="text-slate-600 mb-6">
            No dejes que el problema empeore. Contactá techistas expertos hoy
          </p>
          <Link href="/servicios?categoria=techista">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
              Resolver Problema Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}