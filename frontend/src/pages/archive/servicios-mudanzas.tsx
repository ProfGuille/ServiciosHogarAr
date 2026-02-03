import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, Clock, Shield, Star, Package, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosMudanzas() {
  useEffect(() => {
    document.title = "Mudanzas y Fletes - Transporte Seguro - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Mudanzas domiciliarias", icon: Truck },
    { name: "Mudanzas comerciales", icon: Package },
    { name: "Fletes express", icon: Truck },
    { name: "Mudanzas interprovinciales", icon: MapPin },
    { name: "Embalaje profesional", icon: Package },
    { name: "Guardamuebles", icon: Shield },
  ];

  const benefits = [
    "Personal capacitado y cuidadoso",
    "Seguro de carga incluido",
    "Embalaje con materiales de calidad",
    "Presupuesto sin cargo",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-200">
            <Truck className="h-4 w-4 mr-1" />
            Transporte Seguro
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Mudanzas y Fletes Profesionales
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Mudanzas locales e interprovinciales con el cuidado que tus pertenencias merecen. 
            Personal capacitado, vehículos modernos y seguro de carga incluido.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=mudanzas">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Truck className="mr-2 h-5 w-5" />
              Solicitar Mudanza
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Pedir Presupuesto
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Mudanzas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-amber-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl">¿Por qué elegirnos para tu mudanza?</CardTitle>
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

        {/* Tips Section */}
        <Card className="mb-16 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Package className="h-6 w-6" />
              Tips para tu mudanza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Comenzá a embalar con anticipación, etiquetá las cajas por habitación, 
              separá los objetos frágiles y prepará una caja con elementos esenciales 
              para el primer día en tu nuevo hogar.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Planificación eficiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Coordinamos día y horario según tu conveniencia. Realizamos 
                mudanzas en fin de semana sin cargo extra.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Seguro integral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Todas nuestras mudanzas incluyen seguro de carga. Tus 
                pertenencias están protegidas desde el origen hasta el destino.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre mudanzas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Qué incluye el servicio?</h3>
                <p className="text-slate-600">
                  Personal, vehículo, herramientas, frazadas protectoras y seguro. Embalaje opcional.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Desarman y arman muebles?</h3>
                <p className="text-slate-600">
                  Sí, nuestro personal está capacitado para desarmar y armar muebles correctamente.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Hacen mudanzas al interior?</h3>
                <p className="text-slate-600">
                  Sí, realizamos mudanzas a todo el país con tarifas competitivas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Planificando una mudanza?</h2>
          <p className="text-slate-600 mb-6">
            Obtené presupuestos de empresas de mudanzas confiables
          </p>
          <Link href="/servicios?categoria=mudanzas">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              Cotizar Mudanza Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}