import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Key, Clock, Shield, Star, Lock, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosCerrajero() {
  useEffect(() => {
    document.title = "Cerrajeros 24hs - Urgencias y Seguridad - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Apertura de puertas", icon: Key },
    { name: "Cambio de cerraduras", icon: Lock },
    { name: "Duplicado de llaves", icon: Key },
    { name: "Cerraduras de seguridad", icon: Shield },
    { name: "Urgencias 24hs", icon: AlertCircle },
    { name: "Cerraduras inteligentes", icon: Lock },
  ];

  const benefits = [
    "Servicio 24/7 todos los días",
    "Llegamos en 30 minutos",
    "Presupuesto antes de trabajar",
    "Cerrajeros matriculados",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            <Key className="h-4 w-4 mr-1" />
            Seguridad 24hs
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Cerrajeros de Urgencia y Confianza
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Servicio de cerrajería las 24 horas. Aperturas, cambios de cerraduras 
            y soluciones de seguridad con respuesta inmediata en toda Argentina.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=cerrajero">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Key className="mr-2 h-5 w-5" />
              Llamar Cerrajero Ahora
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Presupuesto Sin Urgencia
            </Button>
          </Link>
        </div>

        {/* Emergency Alert */}
        <Card className="mb-16 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-6 w-6" />
              ¿Urgencia? Estamos en camino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 font-semibold">
              Tiempo promedio de llegada: 30 minutos • Servicio 24/7 • 
              Presupuesto antes de empezar • Sin sorpresas
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Cerrajería</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-5 w-5 text-purple-600" />
                    {service.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-2xl">Ventajas de nuestro servicio</CardTitle>
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
                Respuesta inmediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Contamos con cerrajeros distribuidos en todas las zonas para 
                garantizar llegada rápida a tu domicilio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Seguridad garantizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Trabajamos con las mejores marcas de cerraduras y sistemas 
                de seguridad del mercado.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre cerrajería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cuánto cuesta una apertura de urgencia?</h3>
                <p className="text-slate-600">
                  El precio varía según el tipo de cerradura. Siempre damos presupuesto antes de trabajar.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Dañan la puerta al abrirla?</h3>
                <p className="text-slate-600">
                  Usamos técnicas profesionales para minimizar daños. En la mayoría de casos no hay daño.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Piden documentación?</h3>
                <p className="text-slate-600">
                  Sí, por seguridad solicitamos DNI y comprobante de domicilio o autorización.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas un cerrajero YA?</h2>
          <p className="text-slate-600 mb-6">
            Cerrajeros profesionales disponibles 24/7 en tu zona
          </p>
          <Link href="/servicios?categoria=cerrajero">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Contactar Cerrajero 24hs
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}