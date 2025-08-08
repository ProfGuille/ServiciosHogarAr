import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, Lock, FileText, AlertTriangle } from "lucide-react";

export default function PrivacidadLegal() {
  useEffect(() => {
    document.title = "Política de Privacidad - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-slate-900">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-slate-600">
            Última actualización: Agosto 2024 | Conforme a la Ley 25.326
          </p>
        </div>

        {/* Legal Framework Notice */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            Esta Política se rige por la <strong>Ley 25.326 de Protección de Datos Personales</strong> de Argentina 
            y garantiza sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                1. Responsable del Tratamiento de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 rounded-lg p-4">
                <p className="font-semibold mb-2">Responsable:</p>
                <ul className="space-y-1 text-sm">
                  <li><strong>Denominación:</strong> ServiciosHogar.com.ar</li>
                  <li><strong>CUIT:</strong> 30-12345678-9</li>
                  <li><strong>Domicilio:</strong> Av. Corrientes 1234, CABA, Argentina (C1043AAZ)</li>
                  <li><strong>Email:</strong> privacidad@servicioshogar.com.ar</li>
                  <li><strong>Teléfono:</strong> +54 11 5555-0123</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Conforme al art. 6 de la Ley 25.326, recopilamos datos cuando usted:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Datos que Usted Proporciona:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Información de registro (nombre, email, teléfono)</li>
                    <li>Domicilio y ubicación</li>
                    <li>Información profesional (para prestadores)</li>
                    <li>Comunicaciones y mensajes</li>
                    <li>Reseñas y calificaciones</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Datos Recopilados Automáticamente:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Dirección IP y datos de conexión</li>
                    <li>Información del navegador y dispositivo</li>
                    <li>Cookies y tecnologías similares</li>
                    <li>Registros de uso y navegación</li>
                    <li>Geolocalización (con su consentimiento)</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  <strong>Datos Sensibles:</strong> No recopilamos datos sensibles definidos en el art. 2 de la Ley 25.326 
                  (origen racial, opiniones políticas, convicciones religiosas, etc.) salvo consentimiento expreso.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Finalidades del Tratamiento (Art. 5 Ley 25.326)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Finalidades Principales:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Intermediación:</strong> Facilitar el contacto entre clientes y prestadores</li>
                    <li><strong>Administración:</strong> Gestionar cuentas de usuario y sistema de créditos</li>
                    <li><strong>Comunicación:</strong> Enviar notificaciones relacionadas con el servicio</li>
                    <li><strong>Seguridad:</strong> Prevenir fraudes y actividades ilícitas</li>
                    <li><strong>Mejoras:</strong> Optimizar funcionalidades de la plataforma</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Finalidades Secundarias (con consentimiento):</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Comunicaciones promocionales y marketing</li>
                    <li>Análisis estadísticos y métricas</li>
                    <li>Personalización de contenido</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Base Legal y Consentimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                El tratamiento de sus datos se basa en:
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800 mb-2">Consentimiento Libre e Informado (Art. 5 Ley 25.326)</h4>
                  <p className="text-green-700 text-sm">
                    Al registrarse, usted otorga consentimiento expreso para el tratamiento de sus datos 
                    conforme a esta política.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Ejecución Contractual</h4>
                  <p className="text-blue-700 text-sm">
                    Datos necesarios para brindar los servicios de intermediación solicitados.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-800 mb-2">Interés Legítimo</h4>
                  <p className="text-purple-700 text-sm">
                    Prevención de fraudes, seguridad de la plataforma y cumplimiento legal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cesión de Datos (Art. 11 Ley 25.326)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Sus datos se comparten únicamente en las siguientes circunstancias:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Cesión Autorizada:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Entre usuarios de la plataforma:</strong> Datos de contacto necesarios para el servicio 
                      (cuando un prestador gasta créditos para acceder a información del cliente)
                    </li>
                    <li>
                      <strong>Procesadores de pago:</strong> MercadoPago y entidades bancarias para transacciones seguras
                    </li>
                    <li>
                      <strong>Proveedores de servicios tecnológicos:</strong> Hosting, email y herramientas técnicas
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cesión por Imperativo Legal:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Autoridades judiciales o administrativas competentes</li>
                    <li>Requerimientos de AFIP, UIF u otros organismos</li>
                    <li>Cumplimiento de órdenes judiciales</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 font-medium">
                  <strong>NUNCA vendemos, alquilamos o comercializamos sus datos personales a terceros.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Derechos del Titular (Art. 14, 15, 16 Ley 25.326)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Conforme a la Ley 25.326, usted tiene los siguientes derechos:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 mb-2">Derecho de Acceso</h4>
                    <p className="text-blue-700 text-sm">
                      Solicitar información sobre qué datos tenemos y cómo los utilizamos.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-green-800 mb-2">Derecho de Rectificación</h4>
                    <p className="text-green-700 text-sm">
                      Corregir datos inexactos, incompletos o desactualizados.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="font-semibold text-purple-800 mb-2">Derecho de Cancelación</h4>
                    <p className="text-purple-700 text-sm">
                      Solicitar la eliminación de sus datos cuando corresponda legalmente.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <h4 className="font-semibold text-amber-800 mb-2">Derecho de Oposición</h4>
                    <p className="text-amber-700 text-sm">
                      Oponerse al tratamiento por motivos legítimos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-slate-100 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cómo Ejercer sus Derechos:</h4>
                <ul className="space-y-1 text-sm">
                  <li><strong>Email:</strong> privacidad@servicioshogar.com.ar</li>
                  <li><strong>Teléfono:</strong> +54 11 5555-0123</li>
                  <li><strong>Formulario web:</strong> Disponible en su perfil de usuario</li>
                </ul>
                <p className="text-xs text-slate-600 mt-2">
                  Responderemos en un plazo máximo de 10 días hábiles conforme al art. 14 de la Ley 25.326.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                7. Seguridad de los Datos (Art. 9 Ley 25.326)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Implementamos medidas técnicas y organizativas apropiadas:</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Medidas Técnicas</h4>
                  <ul className="text-sm space-y-1">
                    <li>Cifrado SSL/TLS 256-bit</li>
                    <li>Firewalls y protección DDoS</li>
                    <li>Backups encriptados</li>
                    <li>Acceso autenticado</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Medidas Organizativas</h4>
                  <ul className="text-sm space-y-1">
                    <li>Políticas de acceso restringido</li>
                    <li>Capacitación del personal</li>
                    <li>Auditorías periódicas</li>
                    <li>Contratos con terceros</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Monitoreo</h4>
                  <ul className="text-sm space-y-1">
                    <li>Detección de intrusiones</li>
                    <li>Logs de acceso</li>
                    <li>Alertas automáticas</li>
                    <li>Respuesta a incidentes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies y Tecnologías de Seguimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Utilizamos cookies para mejorar su experiencia:</p>
              
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Cookies Esenciales (Requeridas)</h4>
                  <p className="text-blue-700 text-sm">
                    Necesarias para el funcionamiento básico: autenticación, sesiones, seguridad.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800 mb-2">Cookies de Funcionalidad (Opcionales)</h4>
                  <p className="text-green-700 text-sm">
                    Recuerdan preferencias: idioma, ubicación, configuraciones personales.
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="font-semibold text-amber-800 mb-2">Cookies Analíticas (Con consentimiento)</h4>
                  <p className="text-amber-700 text-sm">
                    Estadísticas de uso anónimas para mejorar la plataforma.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-4">
                Puede configurar su navegador para gestionar cookies. Sin embargo, deshabilitar cookies esenciales 
                puede afectar la funcionalidad del sitio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contacto para Ejercer Derechos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Delegado de Protección de Datos:</h4>
                <ul className="space-y-2">
                  <li><strong>Email prioritario:</strong> privacidad@servicioshogar.com.ar</li>
                  <li><strong>Email alternativo:</strong> legal@servicioshogar.com.ar</li>
                  <li><strong>Teléfono:</strong> +54 11 5555-0123 (Ext. 100)</li>
                  <li><strong>Horario de atención:</strong> Lunes a Viernes, 9:00 a 18:00 hs</li>
                  <li><strong>Dirección postal:</strong> Av. Corrientes 1234, CABA (C1043AAZ)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}