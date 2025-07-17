import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

export default function CentroAyuda() {
  useEffect(() => {
    document.title = "Centro de Ayuda - ServiciosHogar.com.ar";
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  const faqCategories = [
    {
      title: "Primeros Pasos",
      questions: [
        {
          question: "¿Cómo crear una cuenta en ServiciosHogar?",
          answer: "Puedes registrarte haciendo clic en 'Iniciar Sesión' en la parte superior de la página. Usamos Replit Auth para un proceso seguro y rápido."
        },
        {
          question: "¿Cómo buscar profesionales en mi zona?",
          answer: "Ve a la página de Servicios, usa los filtros de ubicación y categoría para encontrar profesionales cerca de ti."
        },
        {
          question: "¿Es gratuito usar la plataforma?",
          answer: "Sí, registrarse y buscar profesionales es completamente gratuito. Solo pagas por los servicios que contratas."
        }
      ]
    },
    {
      title: "Reservas y Servicios",
      questions: [
        {
          question: "¿Cómo reservar un servicio?",
          answer: "Selecciona el profesional, elige fecha y hora, describe tu necesidad y confirma la reserva. Recibirás una confirmación por email."
        },
        {
          question: "¿Puedo modificar o cancelar una reserva?",
          answer: "Sí, puedes cancelar hasta 24 horas antes sin costo. Para modificaciones, contacta al profesional a través de la plataforma."
        },
        {
          question: "¿Qué pasa si el profesional no aparece?",
          answer: "Contáctanos inmediatamente. Nos encargaremos de resolver la situación y encontrar una solución."
        }
      ]
    },
    {
      title: "Pagos",
      questions: [
        {
          question: "¿Qué métodos de pago aceptan?",
          answer: "Aceptamos Mercado Pago (tarjetas, efectivo, transferencias), transferencia bancaria directa y efectivo al profesional."
        },
        {
          question: "¿Cuándo se cobra el servicio?",
          answer: "El pago se procesa después de que se completa el servicio y ambas partes confirman la satisfacción."
        },
        {
          question: "¿Hay comisiones adicionales?",
          answer: "Cobramos una comisión del 10% sobre el precio del servicio. No hay costos ocultos."
        }
      ]
    },
    {
      title: "Profesionales",
      questions: [
        {
          question: "¿Cómo verifican a los profesionales?",
          answer: "Todos pasan por verificación de identidad, antecedentes, certificaciones y referencias comerciales."
        },
        {
          question: "¿Cómo convertirse en profesional verificado?",
          answer: "Regístrate como profesional, completa el proceso de verificación y espera la aprobación de nuestro equipo."
        },
        {
          question: "¿Qué hacer si tengo problemas con un profesional?",
          answer: "Usa nuestro sistema de mediación. Contacta soporte y trabajaremos para resolver cualquier inconveniente."
        }
      ]
    },
    {
      title: "Seguridad",
      questions: [
        {
          question: "¿Es seguro dar mi dirección a los profesionales?",
          answer: "Sí, todos los profesionales están verificados. Solo compartimos la información necesaria para el servicio."
        },
        {
          question: "¿Qué medidas de seguridad implementan?",
          answer: "Usamos cifrado SSL, verificación de profesionales, pagos seguros y monitoreo continuo de la plataforma."
        },
        {
          question: "¿Cómo reportar actividad sospechosa?",
          answer: "Contacta inmediatamente a seguridad@servicioshogar.com.ar o usa el chat de soporte."
        }
      ]
    }
  ];

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle]
    }));
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Encuentra respuestas a las preguntas más frecuentes sobre ServiciosHogar
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3"
            />
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Buscar Servicios</h3>
              <p className="text-sm text-slate-600">
                Aprende cómo encontrar el profesional perfecto para tu necesidad
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChevronRight className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Hacer Reservas</h3>
              <p className="text-sm text-slate-600">
                Guía paso a paso para reservar servicios de manera fácil
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChevronDown className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Gestionar Pagos</h3>
              <p className="text-sm text-slate-600">
                Todo sobre métodos de pago, facturación y reembolsos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCategory(category.title)}
              >
                <CardTitle className="flex items-center justify-between">
                  {category.title}
                  {expandedCategories[category.title] ? 
                    <ChevronDown className="h-5 w-5" /> : 
                    <ChevronRight className="h-5 w-5" />
                  }
                </CardTitle>
              </CardHeader>
              {expandedCategories[category.title] && (
                <CardContent>
                  <div className="space-y-6">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                        <h4 className="font-medium text-slate-900 mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-slate-600 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta adicional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contacto"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contactar Soporte
              </a>
              <a 
                href="mailto:ayuda@servicioshogar.com.ar"
                className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                Enviar Email
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}