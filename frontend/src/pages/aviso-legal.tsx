import { useEffect } from "react";
import Canonical from '@/components/Canonical';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

export default function AvisoLegal() {
  useEffect(() => {
    document.title = "Aviso Legal - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Canonical path="/aviso-legal" />

      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Aviso Legal y Descargo de Responsabilidad
          </h1>
          <p className="text-slate-600">
            Última actualización: Abril 2026
          </p>
        </div>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Importante</h3>
              <p className="text-amber-700 text-sm">
                ServiciosHogar.com.ar es una plataforma de intermediación que conecta clientes
                con prestadores de servicios independientes. No participamos directamente en la
                prestación de servicios ni en los acuerdos comerciales o económicos entre las partes.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span>1. Naturaleza del Servicio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                ServiciosHogar.com.ar opera exclusivamente como intermediario digital, facilitando:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La publicación de solicitudes de servicio por parte de clientes</li>
                <li>El acceso de prestadores a esas solicitudes mediante un sistema de créditos</li>
                <li>Herramientas de gestión de solicitudes y calificaciones</li>
                <li>Verificación voluntaria de identidad de proveedores</li>
              </ul>
              <p className="mt-4 font-semibold text-slate-800">
                NO prestamos servicios domésticos directamente. NO intervenimos en la
                relación comercial ni económica entre cliente y prestador.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <span>2. Limitación de Responsabilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">DESCARGO TOTAL DE RESPONSABILIDAD</h4>
                  <p className="text-red-700 text-sm">
                    ServiciosHogar.com.ar NO se hace responsable por:
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Calidad del trabajo:</strong> La calidad, seguridad y cumplimiento de los servicios prestados por los profesionales registrados.</li>
                  <li><strong>Daños y perjuicios:</strong> Cualquier daño material, económico o personal que pueda resultar de los servicios contratados entre las partes.</li>
                  <li><strong>Cumplimiento de acuerdos:</strong> El cumplimiento de horarios, presupuestos o condiciones acordadas entre cliente y prestador.</li>
                  <li><strong>Disputas comerciales:</strong> Conflictos, malentendidos o desacuerdos entre clientes y prestadores de servicios.</li>
                  <li><strong>Seguros y licencias:</strong> Que los prestadores cuenten con seguros, licencias o habilitaciones requeridas por ley.</li>
                  <li><strong>Veracidad de perfiles:</strong> Aunque actuamos con diligencia ante denuncias, no verificamos de forma exhaustiva la totalidad de la información declarada por los proveedores.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Relación Contractual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Los prestadores de servicios registrados en nuestra plataforma son:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Trabajadores independientes</strong> o empresas autónomas</li>
                <li><strong>NO empleados</strong> de ServiciosHogar.com.ar</li>
                <li><strong>Responsables exclusivos</strong> de sus servicios y obligaciones fiscales, laborales y civiles</li>
              </ul>
              <p className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                <strong>Importante:</strong> Los acuerdos de servicios se establecen directamente
                entre cliente y prestador. ServiciosHogar.com.ar no es parte de esos contratos
                y no asume responsabilidad alguna por su cumplimiento o incumplimiento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Recomendaciones de Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <h4 className="font-semibold text-green-800 mb-2">RECOMENDAMOS ENCARECIDAMENTE:</h4>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verificar antecedentes, referencias y credenciales del prestador de forma independiente</li>
                <li>Solicitar presupuestos detallados y por escrito antes de iniciar cualquier trabajo</li>
                <li>Confirmar que el prestador cuente con seguros de responsabilidad civil</li>
                <li>Establecer condiciones claras sobre materiales, horarios y forma de pago</li>
                <li>Documentar el estado previo del lugar donde se realizará el servicio</li>
                <li>Reportar cualquier irregularidad a través de nuestra plataforma</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Uso de la Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Al utilizar ServiciosHogar.com.ar, usted acepta que:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utilizará la plataforma bajo su propia responsabilidad</li>
                <li>Proporcionará información veraz y actualizada</li>
                <li>Cumplirá con las leyes aplicables en sus transacciones</li>
                <li>No responsabilizará a la plataforma por los resultados de los servicios contratados con terceros</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Resolución de Disputas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                En caso de conflictos entre usuarios, ofrecemos orientación a través de nuestro
                centro de ayuda y podemos suspender cuentas ante violaciones graves de los
                términos de uso. Sin embargo, no garantizamos la resolución de disputas ni
                asumimos responsabilidad legal en conflictos entre usuarios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Jurisdicción y Ley Aplicable</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Este aviso legal se rige por las leyes de la República Argentina.
                Cualquier disputa relacionada con el uso de la plataforma estará
                sujeta a la jurisdicción de los tribunales competentes de la
                Ciudad Autónoma de Buenos Aires.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nos reservamos el derecho de modificar este aviso legal en cualquier momento.
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
                Es responsabilidad del usuario revisar periódicamente estos términos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contacto Legal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Para consultas legales o para reportar irregularidades graves:
              </p>
              <ul className="space-y-1">
                <li><strong>Email:</strong> legal@servicioshogar.com.ar</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
