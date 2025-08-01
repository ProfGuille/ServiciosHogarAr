import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sun, Clock, Shield, Star, Zap, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosInstaladorSolar() {
  useEffect(() => {
    document.title = "Instaladores de Paneles Solares - Energía Renovable - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Instalación residencial", icon: Sun },
    { name: "Sistemas off-grid", icon: Zap },
    { name: "Conexión a red", icon: Zap },
    { name: "Termotanques solares", icon: Sun },
    { name: "Mantenimiento preventivo", icon: Shield },
    { name: "Asesoramiento y diseño", icon: Star },
  ];

  const benefits = [
    "Instaladores certificados",
    "Equipos de primera marca",
    "Análisis de consumo gratuito",
    "Financiación disponible",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
            <Sun className="h-4 w-4 mr-1" />
            Energía Solar
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Instaladores de Paneles Solares
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Ahorrá hasta un 90% en tu factura de luz. Instalación profesional 
            de sistemas solares con los mejores equipos y garantía extendida.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=instalador solar">
            <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Sun className="mr-2 h-5 w-5" />
              Buscar Instaladores
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Análisis Gratuito
            </Button>
          </Link>
        </div>

        {/* Savings Alert */}
        <Card className="mb-16 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-6 w-6" />
              Recuperá tu inversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Con los aumentos de tarifa, un sistema solar se paga solo en 3-5 años. 
              Después es energía gratis por más de 25 años. ¡Pedí tu análisis de ahorro!
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Energía Solar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-yellow-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas de la energía solar</CardTitle>
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
                Instalación rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Un sistema residencial típico se instala en 1-2 días. 
                Nos encargamos de todos los trámites y permisos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Garantía total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                25 años de garantía en paneles, 10 años en inversores. 
                Servicio técnico post-venta incluido.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre energía solar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Funciona en días nublados?</h3>
                <p className="text-slate-600">
                  Sí, los paneles generan energía incluso con nubes, aunque con menor eficiencia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Necesito cambiar mi instalación eléctrica?</h3>
                <p className="text-slate-600">
                  En la mayoría de casos no. Solo agregamos el sistema solar a tu instalación existente.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Puedo vender energía a la red?</h3>
                <p className="text-slate-600">
                  Sí, con la ley de generación distribuida podés inyectar excedentes y recibir créditos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para ahorrar con energía solar?</h2>
          <p className="text-slate-600 mb-6">
            Calculamos tu ahorro y diseñamos el sistema ideal para tu hogar
          </p>
          <Link href="/servicios?categoria=instalador solar">
            <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
              Empezar Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}