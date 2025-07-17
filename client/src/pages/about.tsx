import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, MapPin, Clock, Award, Heart } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "Acerca de - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Acerca de ServiciosHogar.com.ar
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Conectamos hogares argentinos con profesionales de confianza para todos tus servicios domésticos.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Nuestra Misión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              En ServiciosHogar.com.ar, nuestra misión es simplificar la vida de las familias argentinas 
              conectándolas con profesionales calificados y confiables. Creemos que todos merecen un hogar 
              bien cuidado y servicios de calidad al alcance de un clic.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Profesionales Verificados</h3>
              <p className="text-sm text-slate-600">
                Todos nuestros profesionales pasan por un riguroso proceso de verificación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Cobertura Nacional</h3>
              <p className="text-sm text-slate-600">
                Disponible en las principales ciudades de Argentina
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Servicio 24/7</h3>
              <p className="text-sm text-slate-600">
                Plataforma disponible las 24 horas para tus necesidades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Comunidad</h3>
              <p className="text-sm text-slate-600">
                Miles de usuarios confían en nosotros para sus servicios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Garantía de Calidad</h3>
              <p className="text-sm text-slate-600">
                Sistema de reseñas y garantía en todos los servicios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Pagos Seguros</h3>
              <p className="text-sm text-slate-600">
                Múltiples opciones de pago seguras y confiables
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nuestros Números</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-slate-600">Profesionales</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-sm text-slate-600">Servicios Realizados</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">15</div>
                <div className="text-sm text-slate-600">Ciudades</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
                <div className="text-sm text-slate-600">Calificación Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Plomería", "Electricidad", "Limpieza", "Carpintería", 
                "Pintura", "Jardinería", "Cerrajería", "Refrigeración",
                "Instalaciones", "Reparaciones", "Mantenimiento", "Mudanzas"
              ].map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}