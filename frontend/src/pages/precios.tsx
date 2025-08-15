import { useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Info, TrendingUp, Users, Star, Calculator, FileText, Phone } from "lucide-react";

export default function Precios() {
  useEffect(() => {
    document.title = "Guía de Precios de Servicios - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  // Service pricing data with more complete information
  const servicePricing = [
    {
      category: "Plomería",
      description: "Reparaciones, instalaciones y mantenimiento de plomería",
      services: [
        { name: "Destape de cañería", min: 8000, max: 15000, unit: "servicio" },
        { name: "Cambio de canilla", min: 5000, max: 12000, unit: "unidad" },
        { name: "Reparación de inodoro", min: 8000, max: 20000, unit: "servicio" },
        { name: "Instalación de termotanque", min: 25000, max: 45000, unit: "instalación" }
      ],
      avgHourly: 4500,
      providerCount: 150
    },
    {
      category: "Electricidad", 
      description: "Instalaciones eléctricas, reparaciones y conexiones",
      services: [
        { name: "Instalación punto de luz", min: 3500, max: 8000, unit: "punto" },
        { name: "Instalación toma corriente", min: 2500, max: 6000, unit: "toma" },
        { name: "Cambio de tablero eléctrico", min: 30000, max: 60000, unit: "tablero" },
        { name: "Instalación ventilador de techo", min: 8000, max: 15000, unit: "unidad" }
      ],
      avgHourly: 5000,
      providerCount: 120
    },
    {
      category: "Pintura",
      description: "Pintura interior, exterior y trabajos decorativos",
      services: [
        { name: "Pintura interior", min: 800, max: 1500, unit: "m²" },
        { name: "Pintura exterior", min: 1200, max: 2000, unit: "m²" },
        { name: "Empapelado", min: 1500, max: 2500, unit: "m²" },
        { name: "Pintura de rejas", min: 600, max: 1200, unit: "m²" }
      ],
      avgHourly: 3500,
      providerCount: 180
    },
    {
      category: "Limpieza",
      description: "Limpieza doméstica, deep cleaning y mantenimiento",
      services: [
        { name: "Limpieza general (4 horas)", min: 12000, max: 20000, unit: "sesión" },
        { name: "Limpieza profunda", min: 18000, max: 30000, unit: "sesión" },
        { name: "Limpieza post obra", min: 25000, max: 40000, unit: "sesión" },
        { name: "Limpieza de alfombras", min: 2000, max: 4000, unit: "m²" }
      ],
      avgHourly: 3000,
      providerCount: 200
    },
    {
      category: "Gasista",
      description: "Instalaciones de gas, reparaciones y certificaciones",
      services: [
        { name: "Certificación de gas", min: 25000, max: 50000, unit: "certificado" },
        { name: "Instalación cocina/anafe", min: 15000, max: 30000, unit: "instalación" },
        { name: "Reparación pérdida de gas", min: 8000, max: 25000, unit: "reparación" },
        { name: "Instalación calefactor", min: 20000, max: 40000, unit: "instalación" }
      ],
      avgHourly: 6000,
      providerCount: 80
    },
    {
      category: "Técnico de aire",
      description: "Service, instalación y reparación de aires acondicionados",
      services: [
        { name: "Service aire split", min: 18000, max: 35000, unit: "service" },
        { name: "Instalación aire split", min: 25000, max: 50000, unit: "instalación" },
        { name: "Reparación aire", min: 15000, max: 40000, unit: "reparación" },
        { name: "Carga de gas", min: 12000, max: 25000, unit: "carga" }
      ],
      avgHourly: 5500,
      providerCount: 90
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Guía Completa de Precios de Servicios
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-6">
            Precios actualizados de servicios domésticos en Argentina. 
            Información confiable para que puedas planificar tu presupuesto con confianza.
          </p>
          <div className="text-sm text-slate-500">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Info className="h-6 w-6 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Información importante sobre precios
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Los precios son estimaciones basadas en el mercado argentino actual</li>
                <li>• Los costos pueden variar según la complejidad, ubicación y urgencia</li>
                <li>• Materiales generalmente no incluidos en las tarifas mostradas</li>
                <li>• Se recomienda solicitar múltiples presupuestos para comparar</li>
                <li>• Precios sujetos a inflación y variaciones del mercado</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {servicePricing.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-900">
                    {category.category}
                  </span>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{category.providerCount}+ profesionales</span>
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {category.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Average hourly rate */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Tarifa promedio por hora</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      ${category.avgHourly.toLocaleString()}
                    </div>
                  </div>

                  {/* Service details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Servicios específicos:</h4>
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-slate-800">{service.name}</div>
                            <div className="text-xs text-slate-500">por {service.unit}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">
                              ${service.min.toLocaleString()} - ${service.max.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl shadow-lg p-8 text-white text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas un presupuesto personalizado?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Los precios reales pueden variar según tus necesidades específicas. 
            Conecta con profesionales verificados para obtener cotizaciones exactas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/buscar">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                <Calculator className="h-5 w-5 mr-2" />
                Solicitar Presupuestos Gratis
              </Button>
            </Link>
            <Link href="/servicios">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Users className="h-5 w-5 mr-2" />
                Ver Profesionales
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Precios Actualizados</h3>
              <p className="text-sm text-slate-600">
                Actualizamos regularmente nuestros precios basándonos en datos del mercado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Profesionales Verificados</h3>
              <p className="text-sm text-slate-600">
                Todos los precios corresponden a profesionales con verificación de identidad
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Soporte Personalizado</h3>
              <p className="text-sm text-slate-600">
                ¿Dudas sobre precios? Contactanos para asesoramiento personalizado
              </p>
              <Link href="/contacto">
                <Button variant="outline" size="sm" className="mt-3">
                  Contactar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}