import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sofa, Clock, Shield, Star, Scissors, Calendar, Palette } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosTapicero() {
  useEffect(() => {
    document.title = "Tapiceros - Retapizado y Restauración - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Retapizado de sillones", icon: Sofa },
    { name: "Restauración de muebles", icon: Sofa },
    { name: "Tapizado de sillas", icon: Sofa },
    { name: "Cambio de espuma", icon: Scissors },
    { name: "Fundas a medida", icon: Scissors },
    { name: "Tapizado automotor", icon: Sofa },
  ];

  const benefits = [
    "Amplio catálogo de telas",
    "Trabajo artesanal de calidad",
    "Retiro y entrega a domicilio",
    "Presupuesto sin cargo",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-rose-100 text-rose-700 hover:bg-rose-200">
            <Sofa className="h-4 w-4 mr-1" />
            Tapicería Profesional
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Tapiceros Artesanales
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Dale nueva vida a tus muebles favoritos. Retapizado, restauración 
            y confección de fundas con las mejores telas y acabados.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=tapicero">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white">
              <Sofa className="mr-2 h-5 w-5" />
              Buscar Tapiceros
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
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Tapicería</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-rose-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-rose-50 to-pink-50">
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

        {/* Design Tips */}
        <Card className="mb-16 border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <Palette className="h-6 w-6" />
              Tendencias en tapizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Las telas antimanchas y pet-friendly son las más solicitadas. 
              Los colores neutros y texturas naturales siguen siendo tendencia 
              para combinar con cualquier decoración.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Tiempos de entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Un sillón de 3 cuerpos se retapiza en 7-10 días. Incluimos 
                retiro y entrega sin cargo adicional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Calidad garantizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Trabajamos con telas de primera calidad y espumas de alta 
                densidad para máxima durabilidad.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre tapicería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Puedo elegir la tela?</h3>
                <p className="text-slate-600">
                  Sí, tenemos un amplio muestrario o podés proveer tu propia tela.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Reparan la estructura?</h3>
                <p className="text-slate-600">
                  Sí, además del tapizado podemos reparar la estructura de madera si es necesario.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Vale la pena retapizar?</h3>
                <p className="text-slate-600">
                  Si el mueble es de calidad, retapizar cuesta 50-70% menos que comprar nuevo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Muebles que necesitan renovación?</h2>
          <p className="text-slate-600 mb-6">
            Encontrá tapiceros expertos para darles nueva vida
          </p>
          <Link href="/servicios?categoria=tapicero">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
              Contactar Tapicero
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}