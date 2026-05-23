import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/layout/seo-head";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, FileText, CreditCard, Star, AlertTriangle,
  Briefcase, Camera, MessageSquare, Clock, Award
} from "lucide-react";

type Tab = "clientes" | "profesionales";

const clientTips = [
  {
    icon: ShieldCheck,
    title: "Verificá la identidad del profesional",
    body: "Antes de contratar, pedile DNI o documentación que confirme quién es. Los profesionales verificados en ServiciosHogar ya pasaron por una validación inicial, pero siempre es bueno corroborarlo en persona.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    icon: FileText,
    title: "Pedí el presupuesto por escrito",
    body: "Un presupuesto verbal no te protege. Solicitá que te detallen materiales, mano de obra, tiempos estimados y condiciones de pago. Guardá todo por escrito o por mensaje.",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
  },
  {
    icon: AlertTriangle,
    title: "Exigí que tenga seguro",
    body: "No todos los profesionales tienen seguro de responsabilidad civil. Preguntalo directamente antes de comenzar el trabajo. Si algo sale mal, el seguro te protege a vos también.",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    iconColor: "text-yellow-600",
  },
  {
    icon: CreditCard,
    title: "No pagues todo por adelantado",
    body: "Una señal razonable está bien, pero nunca pagues el 100% antes de ver el trabajo terminado. Lo habitual es 30-50% al inicio y el resto al finalizar conforme.",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconColor: "text-orange-600",
  },
  {
    icon: Camera,
    title: "Documentá el estado inicial",
    body: "Antes de que empiece el trabajo, sacá fotos del lugar o del problema. Si hay algún desacuerdo al finalizar, las fotos son tu mejor evidencia.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    icon: Star,
    title: "Calificá después del servicio",
    body: "Tu reseña ayuda a otros clientes a elegir mejor y premia a los profesionales honestos. Tomá 2 minutos para dejar tu experiencia en la plataforma.",
    color: "bg-pink-50 border-pink-200 text-pink-700",
    iconColor: "text-pink-600",
  },
];

const providerTips = [
  {
    icon: Camera,
    title: "Mostrá tu trabajo con fotos reales",
    body: "Las fotos de trabajos anteriores generan confianza inmediata. Subí imágenes del antes y después, trabajos terminados y detalles de calidad. Un perfil con fotos recibe hasta 3 veces más consultas.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "Respondé rápido y con claridad",
    body: "El tiempo de respuesta es clave. Cuando desbloqueás un lead, contactá al cliente dentro de las primeras horas. Un mensaje claro y profesional marca la diferencia frente a la competencia.",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
  },
  {
    icon: FileText,
    title: "Ofrecé presupuestos detallados",
    body: "Un presupuesto claro y por escrito genera confianza. Detallá materiales, tiempos, mano de obra y condiciones. Los clientes prefieren profesionales transparentes.",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    iconColor: "text-yellow-600",
  },
  {
    icon: ShieldCheck,
    title: "Considerá tener un seguro",
    body: "Un seguro de responsabilidad civil te protege a vos y al cliente. Es un argumento de venta poderoso y muchos clientes lo piden explícitamente antes de contratar.",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconColor: "text-orange-600",
  },
  {
    icon: Clock,
    title: "Cumplí los tiempos acordados",
    body: "La puntualidad y cumplir los plazos es lo que más valoran los clientes. Si hay algún imprevisto, avisá con anticipación. La comunicación proactiva construye reputación.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    icon: Award,
    title: "Pedí reseñas a tus clientes",
    body: "Después de cada trabajo exitoso, pedile al cliente que te califique en la plataforma. Las reseñas son tu mejor activo para conseguir más trabajos. No tengas vergüenza de pedirlas.",
    color: "bg-pink-50 border-pink-200 text-pink-700",
    iconColor: "text-pink-600",
  },
  {
    icon: Briefcase,
    title: "Mantené tu perfil actualizado",
    body: "Un perfil completo con descripción, categorías, zona de cobertura y precio orientativo aparece mejor posicionado en las búsquedas y genera más confianza en los clientes.",
    color: "bg-teal-50 border-teal-200 text-teal-700",
    iconColor: "text-teal-600",
  },
];

export default function Consejos() {
  const [tab, setTab] = useState<Tab>("clientes");
  const tips = tab === "clientes" ? clientTips : providerTips;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead customSEO={{
        title: "Consejos para contratar y trabajar mejor | ServiciosHogar.com.ar",
        description: "Guía práctica para clientes y profesionales: cómo contratar con seguridad, evitar problemas y construir confianza en cada servicio del hogar.",
        canonicalUrl: "https://servicioshogar.com.ar/consejos",
      }} />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Consejos para una buena experiencia
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tanto si buscás un profesional como si ofrecés tus servicios, estos consejos te ayudan a trabajar mejor y con más confianza.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("clientes")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "clientes"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Para clientes
            </button>
            <button
              onClick={() => setTab("profesionales")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "profesionales"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Para profesionales
            </button>
          </div>
        </div>

        {/* Tips grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div
                key={i}
                className={`rounded-xl border p-5 ${tip.color} transition-transform hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${tip.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          {tab === "clientes" ? (
            <>
              <p className="text-slate-600 mb-4">¿Listo para encontrar el profesional ideal?</p>
              <Button size="lg" onClick={() => window.location.href = "/nueva-solicitud"}>
                Publicar una solicitud
              </Button>
            </>
          ) : (
            <>
              <p className="text-slate-600 mb-4">¿Querés llegar a más clientes en tu zona?</p>
              <Button size="lg" onClick={() => window.location.href = "/register-provider"}>
                Registrarme como profesional
              </Button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
