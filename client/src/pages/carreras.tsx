import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Briefcase, Heart, Star } from "lucide-react";

export default function Carreras() {
  useEffect(() => {
    document.title = "Carreras - ServiciosHogar.com.ar";
  }, []);

  const jobs = [
    {
      title: "Desarrollador Full Stack",
      department: "Tecnología",
      location: "Buenos Aires / Remoto",
      type: "Tiempo completo",
      description: "Únete a nuestro equipo para desarrollar la próxima generación de servicios digitales para el hogar.",
      requirements: ["React/Node.js", "PostgreSQL", "APIs REST", "3+ años experiencia"]
    },
    {
      title: "Especialista en Atención al Cliente",
      department: "Soporte",
      location: "Buenos Aires",
      type: "Tiempo completo",
      description: "Ayuda a nuestros usuarios y profesionales a tener la mejor experiencia en nuestra plataforma.",
      requirements: ["Excelente comunicación", "Resolución de problemas", "Español nativo", "Inglés intermedio"]
    },
    {
      title: "Coordinador de Verificaciones",
      department: "Operaciones",
      location: "CABA / Híbrido",
      type: "Tiempo completo",
      description: "Gestiona el proceso de verificación de profesionales para mantener los altos estándares de calidad.",
      requirements: ["Atención al detalle", "Gestión de procesos", "Excel avanzado", "Experiencia en verificaciones"]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Trabajo con propósito",
      description: "Ayudamos a mejorar la vida de miles de familias argentinas"
    },
    {
      icon: Users,
      title: "Equipo diverso",
      description: "Colabora con profesionales talentosos de diferentes backgrounds"
    },
    {
      icon: Star,
      title: "Crecimiento profesional",
      description: "Oportunidades de desarrollo y capacitación continua"
    },
    {
      icon: Clock,
      title: "Flexibilidad",
      description: "Horarios flexibles y opciones de trabajo remoto"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Trabaja con Nosotros
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Únete a nuestro equipo y ayuda a conectar hogares argentinos con profesionales de confianza
          </p>
        </div>

        {/* Company Culture */}
        <Card className="mb-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Por qué ServiciosHogar?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Posiciones Abiertas</h2>
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge variant="secondary">{job.department}</Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </div>
                      </div>
                      <p className="text-slate-600 mb-3">{job.description}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">Requisitos:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, reqIndex) => (
                            <Badge key={reqIndex} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button>
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Proceso de Selección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Aplicación</h3>
                <p className="text-sm text-slate-600">Envía tu CV y carta de presentación</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Entrevista inicial</h3>
                <p className="text-sm text-slate-600">Conversación con RRHH sobre tu perfil</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Entrevista técnica</h3>
                <p className="text-sm text-slate-600">Evaluación de habilidades específicas</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Oferta</h3>
                <p className="text-sm text-slate-600">¡Bienvenido al equipo!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">
              ¿No encontraste la posición ideal?
            </h2>
            <p className="text-slate-600 mb-6">
              Envíanos tu CV y nos pondremos en contacto cuando tengamos una oportunidad que encaje con tu perfil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Enviar CV espontáneo
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/contacto">Contactar RRHH</a>
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Email: carreras@servicioshogar.com.ar
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}