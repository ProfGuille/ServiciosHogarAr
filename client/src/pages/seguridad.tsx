import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, UserCheck, CreditCard, Eye, AlertTriangle } from "lucide-react";

export default function Seguridad() {
  useEffect(() => {
    document.title = "Seguridad - ServiciosHogar.com.ar";
  }, []);

  const securityFeatures = [
    {
      icon: UserCheck,
      title: "Verificación de Profesionales",
      description: "Todos los profesionales pasan por verificación de identidad, antecedentes penales y validación de certificaciones profesionales.",
      features: [
        "Verificación de identidad con DNI",
        "Chequeo de antecedentes penales",
        "Validación de certificaciones",
        "Referencias comerciales"
      ]
    },
    {
      icon: Lock,
      title: "Protección de Datos",
      description: "Implementamos las mejores prácticas de seguridad para proteger su información personal y financiera.",
      features: [
        "Cifrado SSL/TLS de 256 bits",
        "Servidores seguros certificados",
        "Acceso restringido por roles",
        "Auditorías de seguridad regulares"
      ]
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Procesamos pagos a través de plataformas certificadas PCI-DSS para máxima seguridad financiera.",
      features: [
        "Mercado Pago certificado",
        "Cumplimiento PCI-DSS",
        "Detección de fraudes",
        "Transacciones monitoreadas"
      ]
    },
    {
      icon: Eye,
      title: "Monitoreo Continuo",
      description: "Supervisamos la plataforma 24/7 para detectar y prevenir actividades sospechosas.",
      features: [
        "Monitoreo en tiempo real",
        "Detección de anomalías",
        "Alertas automáticas",
        "Respuesta rápida a incidentes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Seguridad y Confianza
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Tu seguridad es nuestra prioridad. Conoce todas las medidas que implementamos 
            para protegerte y brindarte tranquilidad.
          </p>
        </div>

        {/* Security Features */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Certificaciones y Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">SSL Certificado</h3>
                <p className="text-sm text-slate-600">
                  Todas las comunicaciones están cifradas con certificados SSL válidos
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">PCI-DSS Compliant</h3>
                <p className="text-sm text-slate-600">
                  Cumplimos con los estándares de seguridad para el manejo de datos de tarjetas
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Datos Protegidos</h3>
                <p className="text-sm text-slate-600">
                  Cumplimiento con la Ley de Protección de Datos Personales de Argentina
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Consejos de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Para Clientes</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Verifica siempre el perfil y calificaciones del profesional
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Usa solo los métodos de pago de la plataforma
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Mantén la comunicación dentro de la plataforma
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Reporta cualquier comportamiento sospechoso
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Para Profesionales</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Mantén tu perfil actualizado y verificado
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Documenta tu trabajo con fotos
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Respeta los precios acordados
                  </li>
                  <li className="flex gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                    Usa equipo de protección adecuado
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incident Response */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>¿Detectaste algo sospechoso?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              Si observas actividad sospechosa, fraude o cualquier problema de seguridad, 
              repórtalo inmediatamente a través de estos canales:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Email Urgente</h3>
                <p className="text-sm text-slate-600">seguridad@servicioshogar.com.ar</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Línea de Seguridad</h3>
                <p className="text-sm text-slate-600">+54 11 5555-0199</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Chat en Vivo</h3>
                <p className="text-sm text-slate-600">Disponible 24/7 en la plataforma</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Actualizaciones de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Mejoramos continuamente nuestras medidas de seguridad. Últimas actualizaciones:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Implementación de autenticación de dos factores (2FA)</span>
                <span className="text-slate-500">Julio 2025</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Actualización de certificados SSL a TLS 1.3</span>
                <span className="text-slate-500">Junio 2025</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Nueva herramienta de detección de fraudes</span>
                <span className="text-slate-500">Mayo 2025</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Auditoría de seguridad externa completada</span>
                <span className="text-slate-500">Abril 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}