import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Bug, Clock, Shield, Star, Home, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ServiciosFumigador() {
  useEffect(() => {
    document.title = "Fumigadores - Control de Plagas Profesional - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const services = [
    { name: "Control de cucarachas", icon: Bug },
    { name: "Eliminación de roedores", icon: Bug },
    { name: "Control de hormigas", icon: Bug },
    { name: "Fumigación de pulgas", icon: Bug },
    { name: "Control de mosquitos", icon: Bug },
    { name: "Desinfección ambiental", icon: Shield },
  ];

  const benefits = [
    "Productos aprobados por ANMAT",
    "Sin riesgo para mascotas y niños",
    "Certificado de fumigación",
    "Garantía de resultados",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-200">
            <Bug className="h-4 w-4 mr-1" />
            Control de Plagas
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Fumigadores Profesionales
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Eliminamos plagas de forma segura y efectiva. Productos aprobados, 
            técnicas modernas y garantía de resultados para tu tranquilidad.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/servicios?categoria=fumigador">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              <Bug className="mr-2 h-5 w-5" />
              Buscar Fumigadores
            </Button>
          </Link>
          <Link href="/contacto">
            <Button size="lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Solicitar Fumigación
            </Button>
          </Link>
        </div>

        {/* Safety Alert */}
        <Card className="mb-16 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Shield className="h-6 w-6" />
              Seguridad garantizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Utilizamos productos de baja toxicidad aprobados por ANMAT. 
              Seguros para personas y mascotas siguiendo las indicaciones del profesional.
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Servicios de Fumigación</h2>
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
                Tratamiento integral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Incluye inspección, aplicación y seguimiento. Recomendaciones 
                para prevenir futuras infestaciones.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Certificado oficial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Entregamos certificado de fumigación válido para consorcios, 
                comercios y requerimientos legales.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Preguntas frecuentes sobre fumigación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cuánto tiempo debo esperar para reingresar?</h3>
                <p className="text-slate-600">
                  Generalmente 2-4 horas. El fumigador indicará el tiempo exacto según el producto.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Es seguro para mascotas?</h3>
                <p className="text-slate-600">
                  Sí, siguiendo las indicaciones del profesional sobre tiempos de espera.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">¿Cada cuánto fumigar?</h3>
                <p className="text-slate-600">
                  Preventivamente cada 6-12 meses. En caso de infestación, según necesidad.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿Problemas con plagas?</h2>
          <p className="text-slate-600 mb-6">
            Eliminá plagas de forma segura con profesionales certificados
          </p>
          <Link href="/servicios?categoria=fumigador">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Contactar Fumigador Ahora
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}