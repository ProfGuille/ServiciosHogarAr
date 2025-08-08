import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, AlertTriangle, Info, ExternalLink } from "lucide-react";

export default function AvisoLegal() {
  useEffect(() => {
    document.title = "Aviso Legal - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-slate-900">
              Aviso Legal
            </h1>
          </div>
          <p className="text-slate-600">
            Descargo de responsabilidad y información legal | Agosto 2024
          </p>
        </div>

        {/* Critical Legal Disclaimer */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-bold text-lg">DESCARGO EXPRESO DE RESPONSABILIDAD</p>
              <p>
                ServiciosHogar.com.ar actúa únicamente como <strong>plataforma de vinculación digital</strong> entre 
                personas que buscan servicios del hogar y prestadores independientes. NO participamos, garantizamos, 
                controlamos ni asumimos responsabilidad alguna por los servicios, acuerdos o transacciones entre usuarios.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                1. Identificación del Responsable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Datos de la Plataforma:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Denominación:</strong> ServiciosHogar.com.ar</li>
                      <li><strong>Dominio:</strong> servicioshogar.com.ar</li>
                      <li><strong>CUIT:</strong> 30-12345678-9</li>
                      <li><strong>Tipo:</strong> Plataforma de intermediación digital</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Información de Contacto:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Domicilio legal:</strong> Av. Corrientes 1234, CABA</li>
                      <li><strong>Código postal:</strong> C1043AAZ</li>
                      <li><strong>Email legal:</strong> legal@servicioshogar.com.ar</li>
                      <li><strong>Teléfono:</strong> +54 11 5555-0123</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Naturaleza de la Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">¿Qué ES ServiciosHogar.com.ar?</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Una plataforma tecnológica de intermediación digital</li>
                    <li>• Un espacio para que clientes publiquen necesidades de servicios</li>
                    <li>• Un sistema que permite a prestadores encontrar oportunidades laborales</li>
                    <li>• Una herramienta de comunicación entre partes interesadas</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">¿Qué NO ES ServiciosHogar.com.ar?</h4>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>• NO somos una empresa de servicios del hogar</li>
                    <li>• NO empleamos a los prestadores de servicios</li>
                    <li>• NO controlamos ni supervisamos la calidad de los trabajos</li>
                    <li>• NO mediamos en conflictos entre clientes y prestadores</li>
                    <li>• NO garantizamos resultados, trabajos ni pagos</li>
                    <li>• NO asumimos responsabilidad por daños o perjuicios</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Modelo de Negocio y Funcionamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    <strong>Para Clientes:</strong> El uso de la plataforma es completamente GRATUITO. 
                    Pueden publicar solicitudes, recibir propuestas y elegir libremente con quién contratar.
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-blue-800">
                    <strong>Para Prestadores:</strong> Adquieren créditos para acceder a datos de contacto de clientes. 
                    La compra de créditos NO garantiza trabajo ni ingresos.
                  </AlertDescription>
                </Alert>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Proceso Típico:</h4>
                  <ol className="text-amber-700 space-y-1 text-sm list-decimal pl-5">
                    <li>Cliente publica una solicitud de servicio (gratis)</li>
                    <li>Prestadores ven la solicitud en la plataforma</li>
                    <li>Prestador interesado gasta créditos para responder</li>
                    <li>Cliente y prestador se comunican directamente</li>
                    <li>Negocian condiciones, precios y plazos entre ellos</li>
                    <li>Acuerdan forma de pago y ejecutan el trabajo</li>
                    <li>La plataforma NO interviene en ningún paso posterior al contacto inicial</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Exclusión de Responsabilidad Contractual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-3 text-lg">DECLARACIÓN FUNDAMENTAL:</h4>
                <div className="space-y-3 text-red-800">
                  <p className="font-medium">
                    ServiciosHogar.com.ar declara expresamente que:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>1. NO es parte contratante:</strong> No participa en ningún contrato de prestación de servicios entre clientes y prestadores.</li>
                    <li><strong>2. NO asume obligaciones:</strong> No garantiza disponibilidad, puntualidad, calidad o cumplimiento de servicios.</li>
                    <li><strong>3. NO controla prestadores:</strong> Los prestadores son trabajadores independientes que actúan por cuenta propia.</li>
                    <li><strong>4. NO valida servicios:</strong> No verificamos la calidad, legalidad o aptitud de los trabajos realizados.</li>
                    <li><strong>5. NO maneja pagos de servicios:</strong> Los pagos entre cliente y prestador son directos y externos a la plataforma.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Conforme a los artículos 1757 y siguientes del Código Civil y Comercial de la Nación, 
                ServiciosHogar.com.ar limita expresamente su responsabilidad:
              </p>

              <div className="space-y-4">
                <div className="bg-slate-100 border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Exclusión Total por:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Daños a personas o bienes durante servicios</li>
                      <li>Robos, hurtos o pérdidas</li>
                      <li>Incumplimientos contractuales entre usuarios</li>
                      <li>Calidad deficiente de servicios prestados</li>
                      <li>Disputas por precios o condiciones</li>
                    </ul>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Accidentes laborales o lesiones</li>
                      <li>Falta de seguros o habilitaciones</li>
                      <li>Infracciones legales o fiscales</li>
                      <li>Fraudes entre usuarios</li>
                      <li>Problemas de comunicación o coordinación</li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    <strong>Responsabilidad máxima:</strong> En caso de que un tribunal determine alguna responsabilidad 
                    de la plataforma, esta se limitará al monto de créditos pagados por el prestador en los últimos 12 meses, 
                    con un tope absoluto de $50.000 ARS.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Recomendaciones de Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Aunque no asumimos responsabilidad, recomendamos encarecidamente a los usuarios:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Para Clientes:</h4>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• Verificar identidad y referencias del prestador</li>
                    <li>• Solicitar presupuestos detallados por escrito</li>
                    <li>• Exigir comprobantes de seguros y habilitaciones</li>
                    <li>• Acordar formas de pago seguras</li>
                    <li>• Supervisar los trabajos durante su ejecución</li>
                    <li>• Mantener comunicación escrita</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Para Prestadores:</h4>
                  <ul className="text-green-700 space-y-1 text-xs">
                    <li>• Mantener seguros de responsabilidad civil</li>
                    <li>• Cumplir con obligaciones fiscales</li>
                    <li>• Usar equipos de protección apropiados</li>
                    <li>• Documentar trabajos con fotos</li>
                    <li>• Entregar presupuestos detallados</li>
                    <li>• Respetar normativas locales</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Todos los elementos de la plataforma (diseño, código, textos, imágenes, marcas) 
                  son propiedad de ServiciosHogar.com.ar o se usan bajo licencia apropiada.
                </p>

                <div className="bg-slate-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Uso Permitido:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Navegación y uso personal de la plataforma</li>
                    <li>Comunicación relacionada con servicios</li>
                    <li>Capturas de pantalla para referencias personales</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Uso Prohibido:</h4>
                  <ul className="text-red-700 list-disc pl-5 space-y-1 text-sm">
                    <li>Reproducción total o parcial sin autorización</li>
                    <li>Uso comercial de contenidos de la plataforma</li>
                    <li>Modificación o ingeniería inversa del sistema</li>
                    <li>Extracción masiva de datos (web scraping)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Disponibilidad del Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Nos esforzamos por mantener la plataforma disponible 24/7, pero:
              </p>
              
              <div className="space-y-3">
                <Alert className="border-amber-200 bg-amber-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-amber-800">
                    NO garantizamos disponibilidad continua ni libre de errores. 
                    Pueden ocurrir interrupciones por mantenimiento, actualizaciones o causas técnicas.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Posibles Interrupciones:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Mantenimiento programado (notificado con anticipación)</li>
                    <li>Actualizaciones de seguridad o funcionalidad</li>
                    <li>Problemas técnicos del proveedor de hosting</li>
                    <li>Ataques cibernéticos o problemas de conectividad</li>
                    <li>Causas de fuerza mayor</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Legislación Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Ley Aplicable:</h4>
                  <p className="text-blue-700 text-sm">
                    Este aviso legal y todas las relaciones derivadas del uso de la plataforma se rigen 
                    por las leyes de la República Argentina, específicamente:
                  </p>
                  <ul className="text-blue-700 list-disc pl-5 space-y-1 text-xs mt-2">
                    <li>Código Civil y Comercial de la Nación</li>
                    <li>Ley de Defensa del Consumidor N° 24.240</li>
                    <li>Ley de Protección de Datos Personales N° 25.326</li>
                    <li>Normativas de comercio electrónico</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Jurisdicción:</h4>
                  <p className="text-purple-700 text-sm">
                    Para cualquier conflicto o reclamación, las partes se someten a la jurisdicción 
                    de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, 
                    renunciando a cualquier otro fuero que pudiera corresponder.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Enlaces a Sitios de Terceros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                La plataforma puede contener enlaces a sitios web de terceros (procesadores de pago, 
                redes sociales, etc.). 
              </p>

              <Alert className="border-amber-200 bg-amber-50">
                <ExternalLink className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  <strong>Descargo:</strong> No controlamos ni somos responsables por el contenido, 
                  políticas de privacidad o prácticas de sitios web de terceros. 
                  El acceso a estos sitios es bajo su propia responsabilidad.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contacto y Consultas Legales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Para consultas sobre este aviso legal:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Contacto Principal:</h5>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Email:</strong> legal@servicioshogar.com.ar</li>
                      <li><strong>Teléfono:</strong> +54 11 5555-0123</li>
                      <li><strong>Horario:</strong> Lun-Vie 9:00-18:00</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Dirección Postal:</h5>
                    <address className="text-sm not-italic">
                      ServiciosHogar.com.ar<br />
                      Av. Corrientes 1234<br />
                      Ciudad Autónoma de Buenos Aires<br />
                      C1043AAZ - Argentina
                    </address>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Disclaimer */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Declaración Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">
                  AL UTILIZAR SERVICIOSHOGAR.COM.AR, USTED RECONOCE Y ACEPTA QUE:
                </p>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Ha leído, entendido y acepta este aviso legal en su totalidad</li>
                  <li>• Comprende que la plataforma actúa únicamente como intermediario</li>
                  <li>• Asume toda responsabilidad por sus interacciones con otros usuarios</li>
                  <li>• Libera a ServiciosHogar.com.ar de cualquier reclamo relacionado con servicios contratados</li>
                  <li>• Utilizará la plataforma de manera responsable y conforme a la ley</li>
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