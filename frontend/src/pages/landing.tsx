import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Shield,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TestimonialSection } from "@/components/sections/testimonial-section";
import { getCategoryImage } from "@/config/categoryImages";

const FALLBACK_CATEGORIES = [
  { id: 1,  name: "Plomería" },
  { id: 2,  name: "Electricidad" },
  { id: 3,  name: "Pintura" },
  { id: 4,  name: "Limpieza" },
  { id: 5,  name: "Carpintería" },
  { id: 6,  name: "Gasista" },
  { id: 7,  name: "Albañilería" },
  { id: 8,  name: "Aire Acondicionado" },
  { id: 9,  name: "Jardinería" },
  { id: 10, name: "Cerrajería" },
  { id: 11, name: "Mudanzas" },
  { id: 12, name: "Herrería" },
  { id: 13, name: "Techos" },
  { id: 14, name: "Fumigación" },
  { id: 15, name: "Electrodomésticos" },
  { id: 16, name: "Tapicería" },
];

export default function Landing() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: categories } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/categories"],
  });

  const displayCategories = categories ?? FALLBACK_CATEGORIES;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Encontrá el profesional que necesitás
              <span className="block text-blue-200 mt-2">cerca tuyo</span>
            </h1>

            <p className="text-lg lg:text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Conectamos clientes con profesionales verificados cerca tuyo
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch mb-8 w-full max-w-3xl mx-auto">
              <Link href="/nueva-solicitud" className="flex-1">
                <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center border-2 border-blue-300 hover:border-primary">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-primary font-bold text-xl mb-2">Necesito un profesional</h3>
                  <p className="text-slate-500 text-sm mb-3">Publicá tu solicitud y recibí presupuestos de profesionales verificados</p>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mb-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>100% gratis para clientes</span>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm group-hover:gap-3 transition-all">
                    Solicitar gratis <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              <Link href="/register-provider" className="flex-1">
                <div className="group cursor-pointer bg-white/95 rounded-2xl p-8 shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center border-2 border-slate-200 hover:border-orange-300">
                  <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-slate-800 font-bold text-xl mb-2">Soy profesional</h3>
                  <p className="text-slate-500 text-sm mb-3">Recibí solicitudes de clientes en tu zona y elegís a cuáles responder</p>
                  <div className="flex items-center gap-1 text-xs text-orange-500 font-semibold mb-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Solo pagás por los clientes que te interesan</span>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2.5 rounded-full font-semibold text-sm border border-orange-300 group-hover:bg-orange-200 transition-all">
                    Registrarme <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                <span>Profesionales verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                <span>Sin costo para clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                <span>Respuestas rápidas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID SERVICIOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              ¿Qué servicio necesitás?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Elegí la categoría y recibí presupuestos de profesionales verificados
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayCategories.slice(0, 25).map((category) => (
              <Link
                key={category.id}
                href={`/buscar?category=${encodeURIComponent(category.name)}`}
              >
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 hover:border-primary h-full">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg aspect-video">
                      <img
                        src={getCategoryImage(category.name)}
                        alt={`Servicio de ${category.name}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/services/pequenos_arreglos.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2 text-center group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="w-full justify-center text-xs"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Encontrá tu profesional
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/buscar">
              <Button variant="outline" size="lg" className="group">
                Encontrá tu profesional
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Así de simple
            </h2>
            <p className="text-lg text-slate-600">
              Sólo 3 pasos para encontrar al profesional ideal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Contá qué necesitás
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Describí el trabajo y tu ubicación. Toma menos de 2 minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Recibí presupuestos
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Los profesionales de tu zona recibirán tu solicitud y podrán contactarte.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Elegí y listo
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Compará perfiles, reseñas y elegí al mejor. Sin comisiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TestimonialSection />

      {/* TRUST */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Profesionales verificados
              </h3>
              <p className="text-slate-600 text-sm">
                Muchos cuentan con verificación de identidad
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                100% gratis para vos
              </h3>
              <p className="text-slate-600 text-sm">
                Solicitá presupuestos sin costo alguno
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Reseñas reales
              </h3>
              <p className="text-slate-600 text-sm">
                Lee opiniones verificadas de otros clientes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PROFESIONALES */}
      <section className="py-20 bg-gradient-to-r from-secondary to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            ¿Sos profesional de servicios?
          </h2>
          <p className="text-xl mb-10 text-green-100">
            Conectá con clientes que necesitan tus servicios hoy mismo
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register-provider">
              <Button
                size="lg"
                className="bg-white text-secondary hover:bg-slate-50 px-8 py-6 text-lg font-semibold shadow-xl w-full sm:w-auto"
              >
                Registrarme Gratis
              </Button>
            </Link>
            <Link href="/comprar-creditos">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-secondary px-8 py-6 text-lg font-semibold backdrop-blur-sm w-full sm:w-auto"
              >
                Ver Planes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
