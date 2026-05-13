import { useEffect } from "react";
import Canonical from '@/components/Canonical';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terminos() {
  useEffect(() => {
    document.title = "Términos de Servicio - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Canonical path="/terminos" />

      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Términos de Servicio
          </h1>
          <p className="text-slate-600">
            Última actualización: Abril 2026
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Aceptación de los Términos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Al acceder y utilizar ServiciosHogar.com.ar, usted acepta estar sujeto a estos
                términos de servicio y todas las leyes y regulaciones aplicables. Si no está
                de acuerdo con alguno de estos términos, no utilice nuestro sitio web.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Descripción del Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                ServiciosHogar.com.ar es una plataforma digital de intermediación que conecta
                a usuarios que necesitan servicios del hogar con prestadores independientes.
                Nuestra función se limita a facilitar ese contacto inicial. No prestamos
                servicios domésticos directamente ni intervenimos en los acuerdos comerciales
                entre las partes.
              </p>
              <p className="mb-4">Facilitamos:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publicación de solicitudes de servicio por parte de clientes</li>
                <li>Búsqueda y contacto con prestadores registrados</li>
                <li>Sistema de créditos para que prestadores accedan a datos de contacto de clientes</li>
                <li>Sistema de calificaciones y reseñas</li>
                <li>Verificación voluntaria de identidad de proveedores</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Registro y Cuentas de Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Para utilizar ciertos servicios, debe:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la confidencialidad de su cuenta</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Ser mayor de 18 años</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Responsabilidades de los Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Los usuarios se comprometen a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utilizar la plataforma de manera legal y apropiada</li>
                <li>No interferir con el funcionamiento del sitio</li>
                <li>Respetar los derechos de otros usuarios y prestadores</li>
                <li>Proporcionar calificaciones honestas y constructivas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Prestadores de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los prestadores registrados son trabajadores independientes o empresas autónomas.
                ServiciosHogar.com.ar no es su empleador y no es responsable directo por los
                servicios que presten.
              </p>
              <p className="mb-4">Nos comprometemos a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ofrecer un proceso voluntario de verificación de identidad (DNI para personas físicas; CUIT y representante legal para personas jurídicas), conforme a la Ley 25.326</li>
                <li>Mantener un sistema de calificaciones transparente</li>
                <li>Remover prestadores que incumplan nuestros estándares</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5b. Exactitud de la Información de Proveedores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="mb-2">
                Los proveedores son los únicos responsables de la veracidad y actualización
                de los datos que publican en la plataforma: nombre, descripción, credenciales,
                experiencia, tarifas y cualquier otra información de su perfil.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>ServiciosHogar.com.ar actúa como intermediario tecnológico y no verifica de forma exhaustiva la totalidad de la información declarada por los proveedores.</li>
                <li>El distintivo de <strong>proveedor verificado</strong> acredita únicamente que el proveedor completó el proceso de verificación de identidad. No constituye garantía de calidad ni idoneidad profesional.</li>
                <li>La plataforma no se responsabiliza por daños derivados de información falsa o inexacta publicada por proveedores, en tanto actúe con diligencia ante las denuncias recibidas.</li>
                <li>Cualquier usuario que detecte información falsa puede denunciarlo a <strong>contacto@servicioshogar.com.ar</strong>. Nos comprometemos a investigar y, de corresponder, suspender o dar de baja al proveedor infractor.</li>
                <li>Nos reservamos el derecho de remover perfiles que incurran en falsedad de datos, sin previo aviso y sin derecho a reembolso de créditos adquiridos.</li>
              </ul>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Para usuarios:</strong> recomendamos verificar las credenciales del prestador de forma independiente antes de contratarlo, y reportar cualquier irregularidad a nuestro equipo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Sistema de Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los prestadores adquieren créditos en la plataforma para acceder a los datos
                de contacto de clientes interesados. Cada desbloqueo consume 1 crédito.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Los créditos se adquieren mediante Mercado Pago</li>
                <li>Los créditos no son reembolsables una vez utilizados</li>
                <li>ServiciosHogar.com.ar no intermedia ni procesa pagos entre clientes y prestadores — esos acuerdos son exclusivamente entre las partes</li>
                <li>Los créditos no vencen mientras la cuenta esté activa</li>
                <li>Los créditos pueden obtenerse también a través del programa de referidos</li>
              </ul>
              <p className="mt-4 font-medium">Programa de referidos</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Al registrarse un usuario con tu enlace de referido, recibís 1 crédito</li>
                <li>Si ese referido realiza su primera compra de créditos, recibís 1 crédito adicional</li>
                <li>Los créditos obtenidos por referidos tienen las mismas condiciones que los comprados</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">LIMITACIÓN EXPRESA DE RESPONSABILIDAD</h4>
                  <p className="text-red-700 text-sm">
                    En los términos más amplios permitidos por la legislación argentina,
                    ServiciosHogar.com.ar excluye toda responsabilidad por:
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Daños directos, indirectos, incidentales, especiales o consecuentes</li>
                  <li>Actos u omisiones de los prestadores de servicios registrados</li>
                  <li>Calidad, seguridad o legalidad de los servicios prestados por terceros</li>
                  <li>Cumplimiento de acuerdos económicos entre usuarios y prestadores</li>
                  <li>Disponibilidad continua e ininterrumpida de la plataforma</li>
                  <li>Pérdida de datos o interrupción de actividades</li>
                </ul>
                <p className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                  <strong>Responsabilidad máxima:</strong> En caso de que se determine alguna
                  responsabilidad de nuestra parte, esta estará limitada al monto abonado
                  por el usuario en créditos durante los últimos 30 días.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
                El uso continuado del servicio constituye aceptación de los términos modificados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Jurisdicción y Ley Aplicable</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Estos términos se rigen por las leyes de la República Argentina. Cualquier
                disputa estará sujeta a la jurisdicción de los tribunales competentes de la
                Ciudad Autónoma de Buenos Aires.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Para consultas sobre estos términos:
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
