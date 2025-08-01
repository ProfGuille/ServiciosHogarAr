import { useEffect } from "react";
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
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-slate-600">
            Última actualización: Julio 2025
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
                <li>Reserva servicios o contrata profesionales</li>
                <li>Se comunica con nosotros</li>
                <li>Utiliza nuestro sitio web y aplicaciones</li>
                <li>Deja reseñas o calificaciones</li>
              </ul>
              <p className="mt-4">Esta información incluye:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Datos personales (nombre, email, teléfono, dirección)</li>
                <li>Información de pago (procesada de forma segura)</li>
                <li>Historial de servicios y transacciones</li>
                <li>Comunicaciones y mensajes</li>
                <li>Datos de uso y navegación</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Cómo Utilizamos su Información</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Utilizamos su información para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilitar la conexión con profesionales</li>
                <li>Procesar pagos y transacciones</li>
                <li>Brindar atención al cliente</li>
                <li>Mejorar nuestros servicios</li>
                <li>Enviar comunicaciones importantes</li>
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
                <li><strong>Profesionales:</strong> Datos necesarios para prestar el servicio</li>
                <li><strong>Procesadores de pago:</strong> Para transacciones seguras</li>
                <li><strong>Proveedores de servicios:</strong> Para operaciones técnicas</li>
                <li><strong>Autoridades:</strong> Cuando lo requiera la ley</li>
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
                <li>Auditorías regulares de seguridad</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Sus Derechos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acceder:</strong> Solicitar copia de su información personal</li>
                <li><strong>Rectificar:</strong> Corregir información inexacta</li>
                <li><strong>Eliminar:</strong> Solicitar eliminación de sus datos</li>
                <li><strong>Portabilidad:</strong> Obtener sus datos en formato transferible</li>
                <li><strong>Oposición:</strong> Objetar ciertos usos de su información</li>
                <li><strong>Limitación:</strong> Restringir el procesamiento de sus datos</li>
              </ul>
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
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso del sitio</li>
                <li>Personalizar su experiencia</li>
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
              <p className="mb-4">
                Conservamos su información mientras:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Su cuenta esté activa</li>
                <li>Sea necesario para brindar servicios</li>
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
                Su información puede ser procesada en servidores ubicados fuera de 
                Argentina. En estos casos, aplicamos las mismas medidas de protección 
                y cumplimos con las regulaciones aplicables de transferencia de datos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nuestros servicios están dirigidos a personas mayores de 18 años. 
                No recopilamos intencionalmente información de menores de edad sin 
                el consentimiento parental apropiado.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Cambios a esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Podemos actualizar esta política periódicamente. Le notificaremos 
                sobre cambios importantes por email o mediante avisos en nuestro sitio. 
                La fecha de "última actualización" indica cuándo fueron realizados 
                los cambios más recientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Para ejercer sus derechos o consultas sobre privacidad:
              </p>
              <ul className="space-y-1">
                <li>Email: privacidad@servicioshogar.com.ar</li>
                <li>Teléfono: +54 11 5555-0123</li>
                <li>Dirección: Av. Corrientes 1234, CABA, Argentina</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}