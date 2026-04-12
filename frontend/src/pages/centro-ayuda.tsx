import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

export default function CentroAyuda() {
  useEffect(() => {
    document.title = "Centro de Ayuda - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  const faqCategories = [
    {
      title: "Para clientes",
      questions: [
        {
          question: "Como publico una solicitud de servicio?",
          answer: "Hace clic en Publicar solicitud, completa la categoria, zona y descripcion del trabajo. Es gratis y podes hacerlo sin registrarte."
        },
        {
          question: "Que pasa despues de publicar mi solicitud?",
          answer: "Los profesionales de tu zona reciben la solicitud. Si les interesa, desbloquean tus datos de contacto y te llaman o escriben directamente."
        },
        {
          question: "Tengo que pagar algo como cliente?",
          answer: "No. Publicar solicitudes es completamente gratis. El precio del servicio lo acordas directamente con el profesional que elijas."
        },
        {
          question: "Como se que un profesional es confiable?",
          answer: "Podes ver el perfil del profesional, sus calificaciones y resenas de otros clientes. Los profesionales con el distintivo verificado pasaron por un proceso de verificacion de identidad."
        },
        {
          question: "La plataforma garantiza el servicio?",
          answer: "ServiciosHogar conecta clientes con profesionales, pero no intermedia en la contratacion ni garantiza el resultado del servicio. Te recomendamos acordar todo por escrito antes de comenzar el trabajo."
        }
      ]
    },
    {
      title: "Para profesionales",
      questions: [
        {
          question: "Como funciona el sistema de creditos?",
          answer: "Cada vez que queres ver los datos de contacto de un cliente (nombre, telefono, email), usas 1 credito. Al registrarte recibis 10 creditos de regalo."
        },
        {
          question: "Como compro mas creditos?",
          answer: "Desde tu dashboard profesional, en la seccion Comprar creditos. El pago se procesa a traves de Mercado Pago."
        },
        {
          question: "Como me verifico como profesional?",
          answer: "Desde tu dashboard profesional podes enviar tu documentacion para verificacion de identidad. Una vez aprobada, tu perfil muestra el distintivo de verificado."
        },
        {
          question: "Que informacion ve el cliente antes de que yo desbloquee?",
          answer: "El cliente ve solo la descripcion de la solicitud y la zona. Vos ves lo mismo hasta que usas un credito para desbloquear sus datos completos."
        },
        {
          question: "Puedo recuperar un credito si los datos del cliente son invalidos?",
          answer: "Reportanos el caso desde el formulario de contacto con el ID de la solicitud y lo revisamos manualmente."
        }
      ]
    },
    {
      title: "Cuenta y acceso",
      questions: [
        {
          question: "Como creo una cuenta?",
          answer: "Hace clic en Registrarse en la parte superior. Podes registrarte como cliente o como profesional segun tu necesidad."
        },
        {
          question: "Olvide mi contrasena, que hago?",
          answer: "En la pantalla de login, hace clic en Olvide mi contrasena. Te enviamos un link para restablecerla al email de tu cuenta."
        },
        {
          question: "Puedo publicar una solicitud sin cuenta?",
          answer: "Si. Las solicitudes anonimas estan disponibles para clientes que no quieren registrarse. En ese caso, los profesionales veran tus datos al desbloquear la solicitud."
        }
      ]
    },
    {
      title: "Seguridad",
      questions: [
        {
          question: "Es seguro dar mis datos en la plataforma?",
          answer: "Toda la informacion viaja cifrada con SSL. Tus datos de contacto solo son visibles para profesionales que usan un credito para desbloquearlos."
        },
        {
          question: "Como reporto un problema o actividad sospechosa?",
          answer: "Escribinos desde el formulario de contacto en /contacto. Revisamos todos los reportes."
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Preguntas frecuentes sobre ServiciosHogar
          </p>
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
                        <h4 className="font-medium text-slate-900 mb-2">{faq.question}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-12 text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">No encontraste lo que buscabas?</h2>
            <p className="text-slate-600 mb-6">Escribinos y te respondemos a la brevedad.</p>
            <a
              href="/contacto"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Ir al formulario de contacto
            </a>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
