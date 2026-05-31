import { useEffect, useState } from "react";
import Canonical from '@/components/Canonical';
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
          question: "¿Cómo publico una solicitud de servicio?",
          answer: "Hacé clic en Publicar solicitud, completá la categoría, zona y descripción del trabajo. Es gratis y podés hacerlo sin registrarte."
        },
        {
          question: "¿Qué pasa después de publicar mi solicitud?",
          answer: "Los profesionales de tu zona reciben la solicitud. Si les interesa, desbloquean tus datos de contacto y te llaman o escriben directamente."
        },
        {
          question: "¿Tengo que pagar algo como cliente?",
          answer: "No. Publicar solicitudes es completamente gratis. El precio del servicio lo acordás directamente con el profesional que elijas."
        },
        {
          question: "¿Cómo sé que un profesional es confiable?",
          answer: "Podés ver el perfil del profesional, sus calificaciones y reseñas de otros clientes. Los profesionales con el distintivo verificado pasaron por un proceso de verificación de identidad."
        },
        {
          question: "¿La plataforma garantiza el servicio?",
          answer: "ServiciosHogar conecta clientes con profesionales, pero no intermedia en la contratación ni garantiza el resultado del servicio. Te recomendamos acordar todo por escrito antes de comenzar el trabajo."
        },
        {
          question: "¿Qué beneficio tengo por referir a otros usuarios?",
          answer: "Si referís a otros usuarios con tu enlace, tus solicitudes de servicio aparecen destacadas con el distintivo 'Cliente referente' para los profesionales y tienen prioridad en el listado de solicitudes disponibles. Esto aumenta las chances de que más profesionales te contacten."
        }
      ]
    },
    {
      title: "Para profesionales",
      questions: [
        {
          question: "¿Cómo funciona el sistema de créditos?",
          answer: "Cada vez que querés ver los datos de contacto de un cliente (nombre, teléfono, email), usás 1 crédito. Al registrarte recibís 10 créditos de regalo."
        },
        {
          question: "¿Cómo compro más créditos?",
          answer: "Desde tu dashboard profesional, en la sección Comprar créditos. El pago se procesa a través de Mercado Pago."
        },
        {
          question: "¿Cómo me verifico como profesional?",
          answer: "Desde tu dashboard profesional podés enviar tu documentación para verificación de identidad. Una vez aprobada, tu perfil muestra el distintivo de verificado."
        },
        {
          question: "¿Qué información ve el cliente antes de que yo desbloquee?",
          answer: "El cliente ve solo la descripción de la solicitud y la zona. Vos ves lo mismo hasta que usás un crédito para desbloquear sus datos completos."
        },
        {
          question: "¿Puedo recuperar un crédito si los datos del cliente son inválidos?",
          answer: "Reportanos el caso desde el formulario de contacto indicando el ID de la solicitud. Lo revisamos manualmente y, si se confirma que los datos son inválidos, te devolvemos el crédito."
        },
        {
          question: "¿Cómo funciona el programa de referidos?",
          answer: "Desde tu dashboard encontrás tu enlace de referido. Cuando alguien se registra con ese enlace, ganás 1 crédito. Si ese referido es un profesional y realiza su primera compra de créditos, ganás 1 crédito adicional."
        },
        {
          question: "¿Qué es el badge 'Cliente referente'?",
          answer: "Las solicitudes de clientes que han referido a otros usuarios aparecen con el distintivo 'Cliente referente' en tu listado de solicitudes. Además, esas solicitudes se muestran primero, antes que las demás."
        }
      ]
    },
    {
      title: "Cuenta y acceso",
      questions: [
        {
          question: "¿Cómo creo una cuenta?",
          answer: "Hacé clic en Registrarse en la parte superior. Podés registrarte como cliente o como profesional según tu necesidad."
        },
        {
          question: "¿Olvidé mi contraseña, qué hago?",
          answer: "En la pantalla de inicio de sesión, hacé clic en Olvidé mi contraseña. Te enviamos un link para restablecerla al email de tu cuenta."
        },
        {
          question: "¿Puedo publicar una solicitud sin cuenta?",
          answer: "Sí. Las solicitudes anónimas están disponibles para clientes que no quieren registrarse. En ese caso, los profesionales verán tus datos al desbloquear la solicitud."
        }
      ]
    },
    {
      title: "Seguridad",
      questions: [
        {
          question: "¿Es seguro dar mis datos en la plataforma?",
          answer: "Toda la información viaja cifrada con SSL. Tus datos de contacto solo son visibles para profesionales que usan un crédito para desbloquearlos."
        },
        {
          question: "¿Cómo reporto un problema o actividad sospechosa?",
          answer: "Escribinos desde el formulario de contacto. Revisamos todos los reportes."
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
      <Canonical path="/centro-ayuda" title="Centro de ayuda — ServiciosHogarAr" description="Preguntas frecuentes y soporte para clientes y proveedores de ServiciosHogarAr. Encontrá respuestas rápidas sobre solicitudes, créditos y pagos." />

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
