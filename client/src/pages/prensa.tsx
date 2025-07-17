import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Download, Users, TrendingUp, Award } from "lucide-react";

export default function Prensa() {
  useEffect(() => {
    document.title = "Prensa - ServiciosHogar.com.ar";
  }, []);

  const pressReleases = [
    {
      date: "15 Julio 2025",
      title: "ServiciosHogar.com.ar recauda $2M USD en Serie A",
      summary: "La startup argentina líder en servicios domésticos cierra ronda de inversión para expandirse a nuevas ciudades.",
      category: "Financiamiento",
      link: "#"
    },
    {
      date: "1 Julio 2025",
      title: "Alianza estratégica con MercadoPago para pagos seguros",
      summary: "Implementación de nueva infraestructura de pagos para mejorar la experiencia de usuarios y profesionales.",
      category: "Partnerships",
      link: "#"
    },
    {
      date: "20 Junio 2025",
      title: "500+ profesionales verificados en la plataforma",
      summary: "Hito importante en crecimiento con más de 10,000 servicios completados exitosamente.",
      category: "Crecimiento",
      link: "#"
    }
  ];

  const mediaKit = [
    {
      name: "Logos y Marca",
      description: "Pack completo de logos en diferentes formatos y versiones",
      format: "ZIP (PNG, SVG, EPS)",
      size: "2.4 MB"
    },
    {
      name: "Fotos Corporativas",
      description: "Imágenes del equipo, oficinas y profesionales en acción",
      format: "ZIP (JPG, PNG)",
      size: "15.7 MB"
    },
    {
      name: "Fact Sheet 2025",
      description: "Datos clave, estadísticas y información corporativa actualizada",
      format: "PDF",
      size: "1.2 MB"
    }
  ];

  const stats = [
    { icon: Users, label: "Usuarios Activos", value: "25,000+" },
    { icon: TrendingUp, label: "Servicios Completados", value: "10,000+" },
    { icon: Award, label: "Profesionales Verificados", value: "500+" },
    { icon: TrendingUp, label: "Ciudades", value: "15" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Sala de Prensa
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Recursos para medios, noticias corporativas y materiales de prensa
          </p>
        </div>

        {/* Key Stats */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">ServiciosHogar en Números</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Press Releases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Comunicados de Prensa</h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="secondary">{release.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          {release.date}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                      <p className="text-slate-600">{release.summary}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Leer más
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Kit de Medios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {mediaKit.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                  <div className="flex justify-between text-xs text-slate-500 mb-4">
                    <span>{item.format}</span>
                    <span>{item.size}</span>
                  </div>
                  <Button className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Acerca de ServiciosHogar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                ServiciosHogar.com.ar es la plataforma líder en Argentina que conecta 
                profesionales del hogar con clientes que necesitan servicios de calidad. 
                Fundada en 2024, la empresa ha facilitado más de 10,000 servicios y 
                cuenta con una red de más de 500 profesionales verificados.
              </p>
              <p className="text-slate-600">
                La plataforma ofrece servicios de plomería, electricidad, limpieza, 
                carpintería, y muchos más, con un sistema de calificaciones transparente 
                y opciones de pago seguras incluida la integración con MercadoPago.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos Corporativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Fundación:</span> 2024
                </div>
                <div>
                  <span className="font-medium">Sede:</span> Buenos Aires, Argentina
                </div>
                <div>
                  <span className="font-medium">CEO:</span> [Nombre del CEO]
                </div>
                <div>
                  <span className="font-medium">Empleados:</span> 25+
                </div>
                <div>
                  <span className="font-medium">Financiamiento:</span> Serie A - $2M USD
                </div>
                <div>
                  <span className="font-medium">Inversores:</span> [Nombre de inversores]
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">
              Contacto de Prensa
            </h2>
            <p className="text-slate-600 mb-6">
              Para consultas de medios, entrevistas o información adicional
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">Relaciones con Medios</h3>
                <p className="text-sm text-slate-600 mb-1">María González</p>
                <p className="text-sm text-slate-600 mb-1">Directora de Comunicaciones</p>
                <p className="text-sm text-slate-600">prensa@servicioshogar.com.ar</p>
                <p className="text-sm text-slate-600">+54 11 5555-0150</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Partnerships</h3>
                <p className="text-sm text-slate-600 mb-1">Carlos Rodriguez</p>
                <p className="text-sm text-slate-600 mb-1">Director de Alianzas</p>
                <p className="text-sm text-slate-600">partnerships@servicioshogar.com.ar</p>
                <p className="text-sm text-slate-600">+54 11 5555-0160</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}