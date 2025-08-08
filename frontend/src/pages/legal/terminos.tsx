import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Scale, FileText } from "lucide-react";

export default function TerminosLegal() {
  useEffect(() => {
    document.title = "Términos y Condiciones - ServiciosHogar.com.ar";
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
              Términos y Condiciones
            </h1>
          </div>
          <p className="text-slate-600">
            Última actualización: Agosto 2024
          </p>
        </div>

        {/* Important Legal Notice */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            <strong>IMPORTANTE:</strong> ServiciosHogar.com.ar actúa únicamente como plataforma de vinculación digital. 
            NO participamos, garantizamos, controlamos ni interferimos en las contrataciones entre usuarios. 
            La responsabilidad de toda negociación, acuerdo y servicio es exclusivamente de las partes involucradas.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Aceptación de los Términos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Al acceder y utilizar ServiciosHogar.com.ar ("la Plataforma"), usted acepta estar sujeto a estos 
                términos y condiciones ("Términos") y todas las leyes y regulaciones aplicables de la República Argentina.
              </p>
              <p>
                Si no está de acuerdo con alguno de estos Términos, no utilice nuestro sitio web. 
                El uso continuado de la Plataforma constituye aceptación de cualquier modificación a estos Términos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Naturaleza del Servicio y Limitación de Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 font-semibold text-slate-900">
                ServiciosHogar.com.ar es una plataforma digital de intermediación que conecta:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Clientes:</strong> Personas que solicitan servicios domésticos</li>
                <li><strong>Prestadores:</strong> Profesionales independientes que ofrecen servicios</li>
              </ul>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">DECLARACIÓN EXPRESA DE NO RESPONSABILIDAD:</h4>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• NO somos parte de ningún contrato entre clientes y prestadores</li>
                  <li>• NO garantizamos la calidad, puntualidad o cumplimiento de los servicios</li>
                  <li>• NO controlamos ni supervisamos la ejecución de los trabajos</li>
                  <li>• NO asumimos responsabilidad por daños, perjuicios o conflictos</li>
                  <li>• NO actuamos como empleadores de los prestadores</li>
                </ul>
              </div>

              <p>
                <strong>Nuestro único rol:</strong> Facilitar el contacto inicial entre partes interesadas 
                mediante un sistema de créditos que permite a los prestadores acceder a datos de contacto de clientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Sistema de Créditos para Prestadores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los prestadores adquieren créditos para acceder a información de contacto de clientes potenciales.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Para Clientes (GRATUITO):</h4>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Publicar solicitudes de servicios</li>
                    <li>• Recibir respuestas de prestadores</li>
                    <li>• Chatear con prestadores interesados</li>
                    <li>• Elegir libremente con quién contratar</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Para Prestadores (CON CRÉDITOS):</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Ver solicitudes publicadas</li>
                    <li>• Gastar créditos para responder</li>
                    <li>• Acceder a datos de contacto del cliente</li>
                    <li>• Chatear y negociar directamente</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  <strong>IMPORTANTE:</strong> La compra de créditos NO garantiza trabajo, ingresos ni contactos exitosos. 
                  Solo habilita el acceso a solicitudes publicadas dentro de la plataforma.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Responsabilidades del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Obligaciones Generales:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Ser mayor de 18 años o contar con autorización parental</li>
                    <li>Proporcionar información veraz y actualizada</li>
                    <li>Utilizar la plataforma de manera legal y apropiada</li>
                    <li>Respetar los derechos de otros usuarios</li>
                    <li>No interferir con el funcionamiento del sitio</li>
                    <li>Cumplir con las leyes argentinas aplicables</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Responsabilidades de Prestadores:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Contar con habilitaciones profesionales requeridas</li>
                    <li>Mantener seguros y coberturas apropiadas</li>
                    <li>Cumplir con obligaciones fiscales (monotributo, etc.)</li>
                    <li>Verificar identidad y antecedentes cuando sea solicitado</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Responsabilidades de Clientes:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Verificar credenciales y referencias del prestador elegido</li>
                    <li>Acordar condiciones, precios y plazos directamente</li>
                    <li>Asegurar acceso seguro al lugar de trabajo</li>
                    <li>Cumplir con acuerdos de pago establecidos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Exclusión de Garantías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-3">
                  ServiciosHogar.com.ar NO GARANTIZA:
                </p>
                <ul className="text-red-700 space-y-2">
                  <li>• La disponibilidad, confiabilidad o funcionalidad ininterrumpida de la plataforma</li>
                  <li>• La veracidad, exactitud o completitud de la información proporcionada por usuarios</li>
                  <li>• La calidad, seguridad, legalidad o aptitud de los servicios ofrecidos</li>
                  <li>• El cumplimiento de acuerdos entre clientes y prestadores</li>
                  <li>• La ausencia de virus, errores o componentes dañinos</li>
                  <li>• Resultados específicos del uso de la plataforma</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitación de Responsabilidad (Art. 1757 Código Civil)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Conforme al artículo 1757 del Código Civil y Comercial de la Nación, ServiciosHogar.com.ar 
                limita su responsabilidad de la siguiente manera:
              </p>
              
              <div className="space-y-4">
                <div className="bg-slate-100 border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Exclusión Total de Responsabilidad por:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Daños directos, indirectos, incidentales o consecuentes</li>
                    <li>Pérdida de beneficios, datos o oportunidades comerciales</li>
                    <li>Servicios prestados por terceros (prestadores)</li>
                    <li>Acciones u omisiones de usuarios de la plataforma</li>
                    <li>Fuerza mayor o caso fortuito</li>
                  </ul>
                </div>

                <p className="text-sm text-slate-600">
                  En caso de que un tribunal determine alguna responsabilidad, esta se limitará 
                  al monto pagado por el usuario en los últimos 12 meses, con un máximo de $10.000 ARS.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Política de Privacidad y Datos Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                El tratamiento de datos personales se rige por nuestra 
                <a href="/legal/privacidad" className="text-primary font-medium hover:underline"> Política de Privacidad</a>, 
                conforme a la Ley 25.326 de Protección de Datos Personales.
              </p>
              <p>
                Los usuarios pueden ejercer sus derechos de acceso, rectificación, actualización y supresión (ARCO) 
                contactando a: <strong>privacidad@servicioshogar.com.ar</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
              <p>
                Los usuarios serán notificados de cambios significativos por email o mediante avisos en la plataforma. 
                El uso continuado del servicio constituye aceptación de los términos modificados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Jurisdicción y Ley Aplicable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Estos Términos se rigen por las leyes de la República Argentina. 
                Cualquier disputa relacionada con estos Términos será sometida a la jurisdicción 
                de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.
              </p>
              <p>
                Los usuarios renuncian expresamente a cualquier fuero especial que pudiera corresponderles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contacto Legal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Para consultas legales, reclamos o ejercicio de derechos:
              </p>
              <div className="bg-slate-100 rounded-lg p-4">
                <ul className="space-y-2">
                  <li><strong>Email legal:</strong> legal@servicioshogar.com.ar</li>
                  <li><strong>Email privacidad:</strong> privacidad@servicioshogar.com.ar</li>
                  <li><strong>Teléfono:</strong> +54 11 5555-0123</li>
                  <li><strong>Domicilio legal:</strong> Av. Corrientes 1234, CABA, Argentina (C1043AAZ)</li>
                  <li><strong>CUIT:</strong> 30-12345678-9</li>
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