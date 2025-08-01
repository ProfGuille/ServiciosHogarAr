import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, HardHat, Clock, Shield, Star, Home, Wrench, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosAlbanil() {
  useEffect(() => {
    document.title = "Albañiles - Construcción y Reparación - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Colocación de cerámicos", icon: Home },
    { name: "Revoques y enlucidos", icon: HardHat },
    { name: "Construcción de paredes", icon: Home },
    { name: "Reparación de pisos", icon: Wrench },
    { name: "Instalación de durlock", icon: HardHat },
    { name: "Trabajos de hormigón", icon: HardHat },
  ];

  const benefits = [
    "Profesionales con experiencia comprobada",
    "Materiales de primera calidad",
    "Presupuestos detallados sin sorpresas",
    "Garantía en todos los trabajos",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-200">
            <HardHat className="h-4 w-4 mr-1" />
            Construcción y Albañilería
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Albañiles Profesionales en Argentina
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Expertos en construcción, reparación y remodelación. Transforma tu hogar con 
            albañiles calificados que garantizan calidad y durabilidad en cada proyecto.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=albañil">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
              <HardHat className="mr-2 h-5 w-5" />
              Buscar Albañiles
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
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Albañilería</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-orange-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="text-2xl">¿Por qué elegir nuestros albañiles?</CardTitle>
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
                Tiempos de trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Trabajamos con plazos claros y cumplimos con los tiempos acordados. 
                Coordinamos horarios que se adapten a tu rutina para minimizar molestias.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Garantía de calidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Todos nuestros trabajos incluyen garantía escrita. Utilizamos materiales 
                de primera calidad y técnicas probadas para asegurar resultados duraderos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre albañilería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Incluyen los materiales en el presupuesto?</h3>
                <p className="text-slate-600">
                  Podemos trabajar con materiales incluidos o solo mano de obra, según tu preferencia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Realizan trabajos pequeños?</h3>
                <p className="text-slate-600">
                  Sí, desde reparaciones menores hasta construcciones completas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Limpian al terminar el trabajo?</h3>
                <p className="text-slate-600">
                  Siempre dejamos el área de trabajo limpia y ordenada al finalizar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas un albañil profesional?</h2>
          <p className="text-slate-600 mb-6">
            Recibe múltiples presupuestos de albañiles calificados en tu zona
          </p>
          <Link href="/servicios?categoria=albañil">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Buscar Albañiles Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}