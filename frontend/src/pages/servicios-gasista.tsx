import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Flame, Clock, Shield, Star, AlertCircle, Wrench, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosGasista() {
  useEffect(() => {
    document.title = "Gasistas - Instalación y Reparación de Gas - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Instalación de cocina", icon: Flame },
    { name: "Instalación de calefón", icon: Flame },
    { name: "Instalación de termotanque", icon: Flame },
    { name: "Reparación de pérdidas", icon: AlertCircle },
    { name: "Prueba de hermeticidad", icon: Shield },
    { name: "Habilitaciones", icon: CheckCircle },
  ];

  const benefits = [
    "Gasistas matriculados",
    "Trabajos certificados",
    "Presupuesto sin cargo",
    "Atención de emergencias",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-200">
            <Flame className="h-4 w-4 mr-1" />
            Servicio Esencial
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Gasistas Matriculados en Argentina
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Conectamos tu hogar con gasistas certificados para instalaciones y reparaciones seguras. 
            Todos nuestros profesionales están matriculados y garantizan trabajos según normativa.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=gasista">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              <Flame className="mr-2 h-5 w-5" />
              Buscar Gasistas
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
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Gasista</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-red-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl">¿Por qué elegir nuestros gasistas?</CardTitle>
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

        {/* Safety Alert */}
        <Card className="mb-16 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-6 w-6" />
              Seguridad ante todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Ante cualquier olor a gas, cierre inmediatamente la llave de paso, ventile el ambiente y 
              no utilice artefactos eléctricos. Contacte a un gasista matriculado de inmediato.
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Contamos con gasistas disponibles para urgencias las 24 horas. 
                Para trabajos programados, coordinamos visitas en el horario que más te convenga.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Garantía de trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Todos los trabajos incluyen certificado de gasista matriculado y garantía. 
                Cumplimos con las normativas vigentes de Enargas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre servicios de gas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cada cuánto debo revisar la instalación de gas?</h3>
                <p className="text-slate-600">
                  Se recomienda una revisión anual de toda la instalación, especialmente antes del invierno.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Qué incluye la prueba de hermeticidad?</h3>
                <p className="text-slate-600">
                  La prueba verifica que no existan pérdidas en toda la instalación mediante equipos especializados.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Necesito un gasista matriculado para cualquier trabajo?</h3>
                <p className="text-slate-600">
                  Sí, por ley todos los trabajos en instalaciones de gas deben ser realizados por gasistas matriculados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas un gasista matriculado?</h2>
          <p className="text-slate-600 mb-6">
            Obtén presupuestos gratis de gasistas verificados en tu zona
          </p>
          <Link href="/servicios?categoria=gasista">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Solicitar Gasista Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}