import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Hammer, Clock, Shield, Star, Wrench, Calendar, Settings } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosPequenosArreglos() {
  useEffect(() => {
    document.title = "Pequeños Arreglos - Manitas para el Hogar - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Colgar cuadros y estantes", icon: Hammer },
    { name: "Cambio de canillas", icon: Wrench },
    { name: "Arreglo de puertas", icon: Settings },
    { name: "Instalación de cortinas", icon: Hammer },
    { name: "Reparación de muebles", icon: Wrench },
    { name: "Pequeñas instalaciones", icon: Settings },
  ];

  const benefits = [
    "Profesionales multiusos",
    "Precio fijo por hora",
    "Herramientas incluidas",
    "Sin mínimo de trabajo",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200">
            <Hammer className="h-4 w-4 mr-1" />
            Manitas del Hogar
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Pequeños Arreglos y Mantenimiento
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Para todas esas tareas pendientes del hogar. Profesionales multiusos 
            que resuelven múltiples arreglos en una sola visita.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=pequeños arreglos">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Hammer className="mr-2 h-5 w-5" />
              Buscar Profesional
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Visita
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Arreglos Comunes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-teal-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-teal-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas del servicio</CardTitle>
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

        {/* List Section */}
        <Card className="mb-16 border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-700">
              <Wrench className="h-6 w-6" />
              Hacé tu lista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Prepará una lista con todos los arreglos pendientes. Nuestros profesionales 
              pueden resolver múltiples tareas en una sola visita, ahorrándote tiempo y dinero.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Tarifa por hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Cobramos por hora trabajada, no por tarea. Ideal para resolver 
                varios pendientes en una sola visita.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Todo incluido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                El profesional trae todas las herramientas básicas. Solo 
                deberás proveer los materiales específicos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Qué tareas NO realizan?</h3>
                <p className="text-slate-600">
                  Trabajos que requieran matrícula (gas, electricidad de alto voltaje) o especialización.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Cuál es el tiempo mínimo?</h3>
                <p className="text-slate-600">
                  Generalmente 1 hora, pero varía según el profesional.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Puedo agregar tareas durante la visita?</h3>
                <p className="text-slate-600">
                  Sí, mientras haya tiempo disponible y sean tareas dentro de sus capacidades.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Tareas pendientes en casa?</h2>
          <p className="text-slate-600 mb-6">
            Un profesional puede resolver todo en una visita
          </p>
          <Link href="/servicios?categoria=pequeños arreglos">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
              Agendar Manitas Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}