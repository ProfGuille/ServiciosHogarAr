import { useEffect } from "react";
import Canonical from '@/components/Canonical';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacidad() {
  useEffect(() => {
    document.title = "Política de Privacidad - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Canonical path="/privacidad" />

      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-slate-600">
            Última actualización: Abril 2026
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Recopilamos información cuando usted:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Se registra en nuestra plataforma</li>
                <li>Publica o responde solicitudes de servicio</li>
                <li>Se comunica con nosotros</li>
                <li>Utiliza nuestro sitio web</li>
                <li>Deja reseñas o calificaciones</li>
              </ul>
              <p className="mt-4">Esta información incluye:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Datos personales (nombre, email, teléfono, dirección)</li>
                <li>Historial de solicitudes y desbloqueos</li>
                <li>Datos de uso y navegación</li>
                <li>Número de DNI o CUIT para proveedores que solicitan verificación voluntaria de identidad</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1b. Verificación de Identidad de Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los proveedores que deseen obtener el distintivo de identidad verificada deberán aportar voluntariamente, mediante consentimiento expreso, los siguientes datos según su tipo:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Persona física:</strong> número de Documento Nacional de Identidad (DNI)</li>
                <li><strong>Persona jurídica:</strong> número de CUIT de la entidad y nombre completo del representante legal</li>
              </ul>
              <p className="mb-4"><strong>Finalidad:</strong> exclusivamente verificar la identidad del proveedor para brindar mayor confianza a los usuarios.</p>
              <p className="mb-4"><strong>Base legal:</strong> consentimiento expreso del titular (Art. 5, Ley 25.326) y necesidad para el desarrollo de la relación contractual con la plataforma.</p>
              <p className="mb-4"><strong>Retención:</strong> estos datos se conservan mientras la cuenta esté activa. Ante solicitud de baja o supresión, se eliminan en un plazo máximo de 30 días hábiles.</p>
              <p className="mb-4"><strong>Cesión:</strong> estos datos no son compartidos con terceros bajo ningún concepto, salvo requerimiento de autoridad competente.</p>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  El proceso de verificación es voluntario. No verificarse no impide operar en la plataforma, pero el perfil no mostrará el distintivo de proveedor verificado.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Cómo Utilizamos su Información</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Utilizamos su información para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilitar la conexión entre clientes y prestadores</li>
                <li>Gestionar el sistema de créditos y desbloqueos</li>
                <li>Brindar atención al cliente</li>
                <li>Mejorar nuestros servicios</li>
                <li>Enviar comunicaciones relacionadas con la plataforma</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Prevenir fraudes y actividades maliciosas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Compartir Información</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Compartimos información limitada con:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Prestadores:</strong> datos de contacto del cliente, únicamente cuando el prestador desbloquea una solicitud</li>
                <li><strong>Procesadores de pago:</strong> Mercado Pago, para transacciones de créditos</li>
                <li><strong>Proveedores de infraestructura:</strong> para operaciones técnicas (ver sección 8)</li>
                <li><strong>Autoridades:</strong> cuando lo requiera la ley</li>
              </ul>
              <p className="mt-4 font-semibold">
                Nunca vendemos su información personal a terceros.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Seguridad de los Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Implementamos medidas de seguridad que incluyen:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cifrado SSL para todas las transmisiones</li>
                <li>Servidores seguros y protegidos</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo continuo de seguridad</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Sus Derechos (Ley 25.326 de Protección de Datos Personales)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Conforme a la Ley 25.326 de Protección de Datos Personales de Argentina, usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acceso:</strong> Solicitar y obtener información sobre sus datos almacenados</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de datos cuando sean excesivos o tratados ilícitamente</li>
                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos en casos específicos</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Ejercicio de Derechos</h4>
                <p className="text-blue-700 text-sm">
                  Para ejercer estos derechos, contacte a: <strong>contacto@servicioshogar.com.ar</strong>
                  <br />Responderemos su solicitud dentro de los 10 días hábiles establecidos por ley.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Utilizamos cookies para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener su sesión iniciada</li>
                <li>Analizar el uso del sitio (Google Analytics)</li>
                <li>Mejorar la funcionalidad</li>
              </ul>
              <p className="mt-4">
                Puede configurar su navegador para rechazar cookies, aunque esto
                puede afectar la funcionalidad del sitio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Conservamos su información mientras:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Su cuenta esté activa</li>
                <li>Sea necesario para brindar los servicios</li>
                <li>Lo requieran obligaciones legales</li>
                <li>Existan disputas pendientes</li>
              </ul>
              <p className="mt-4">
                Después de este período, eliminamos o anonimizamos su información.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Transferencias Internacionales</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Su información puede ser procesada en servidores ubicados fuera de Argentina,
                específicamente en Estados Unidos, donde operan los proveedores de infraestructura
                que utiliza esta plataforma: Render (servidor backend) y Neon (base de datos).
                Dichos proveedores cuentan con políticas de protección de datos compatibles con
                estándares internacionales. En todos los casos, cumplimos con las regulaciones
                aplicables conforme al Art. 12 de la Ley 25.326.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nuestros servicios están dirigidos exclusivamente a personas mayores de 18 años.
                No recopilamos intencionalmente información de menores de edad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Cambios a esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios
                importantes por email o mediante avisos en nuestro sitio. La fecha de
                "última actualización" indica cuándo fueron realizados los cambios más recientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Para consultas sobre privacidad o para ejercer sus derechos:
              </p>
              <ul className="space-y-1">
                <li>Email: <strong>contacto@servicioshogar.com.ar</strong></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
