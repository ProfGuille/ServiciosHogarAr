import { useEffect } from "react";
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
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Términos de Servicio
          </h1>
          <p className="text-slate-600">
            Última actualización: Julio 2025
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
                ServiciosHogar.com.ar es una plataforma digital que conecta a usuarios que 
                necesitan servicios domésticos con profesionales calificados. Facilitamos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Búsqueda y selección de profesionales</li>
                <li>Sistema de reservas y agendamiento</li>
                <li>Procesamiento de pagos seguros</li>
                <li>Sistema de calificaciones y reseñas</li>
                <li>Atención al cliente y soporte</li>
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
                <li>Ser mayor de 18 años o tener autorización parental</li>
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
                <li>Respetar los derechos de otros usuarios y profesionales</li>
                <li>Proporcionar calificaciones honestas y constructivas</li>
                <li>Cumplir con los términos de pago establecidos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Profesionales y Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los profesionales registrados son contratistas independientes. 
                ServiciosHogar.com.ar no es empleador de los profesionales y no es 
                responsable directo por los servicios prestados.
              </p>
              <p className="mb-4">Sin embargo, nos comprometemos a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verificar la identidad y credenciales de los profesionales</li>
                <li>Mantener un sistema de calificaciones transparente</li>
                <li>Ofrecer mediación en caso de disputas</li>
                <li>Remover profesionales que no cumplan nuestros estándares</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Pagos y Tarifas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los pagos se procesan de forma segura a través de nuestra plataforma. 
                Cobramos una comisión del 10% sobre cada transacción completada.
              </p>
              <p className="mb-4">Métodos de pago aceptados:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mercado Pago (tarjetas, efectivo, transferencias)</li>
                <li>Transferencia bancaria directa</li>
                <li>Efectivo al profesional (sin comisión)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Política de Cancelación</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cancelación gratuita hasta 24 horas antes del servicio</li>
                <li>Cancelaciones tardías pueden incurrir en cargos</li>
                <li>Reembolsos procesados en 5-7 días hábiles</li>
                <li>Casos especiales evaluados individualmente</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                ServiciosHogar.com.ar actúa como intermediario y no será responsable por 
                daños directos, indirectos, incidentales o consecuentes que resulten del 
                uso de nuestros servicios o de los servicios prestados por profesionales.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación 
                en el sitio web. El uso continuado del servicio constituye aceptación de 
                los términos modificados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Para preguntas sobre estos términos, contáctanos:
              </p>
              <ul className="space-y-1">
                <li>Email: legal@servicioshogar.com.ar</li>
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