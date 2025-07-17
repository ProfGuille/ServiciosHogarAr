import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default function Contacto() {
  useEffect(() => {
    document.title = "Contacto - ServiciosHogar.com.ar";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Contactanos
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Envíanos un mensaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <Input placeholder="Tu nombre completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" placeholder="tu@email.com" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <Input placeholder="+54 11 1234-5678" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Asunto</label>
                  <Input placeholder="¿En qué podemos ayudarte?" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mensaje</label>
                  <Textarea 
                    placeholder="Describe tu consulta o problema..."
                    rows={5}
                  />
                </div>

                <Button className="w-full" size="lg">
                  Enviar mensaje
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Teléfono</h3>
                    <p className="text-slate-600">+54 11 5555-0123</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Disponible de lunes a viernes de 9:00 a 18:00 hs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-slate-600">contacto@servicioshogar.com.ar</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Respuesta en menos de 24 horas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Oficina</h3>
                    <p className="text-slate-600">Av. Corrientes 1234, CABA</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Buenos Aires, Argentina
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Horarios de atención</h3>
                    <div className="text-slate-600">
                      <p>Lunes a Viernes: 9:00 - 18:00</p>
                      <p>Sábados: 9:00 - 13:00</p>
                      <p>Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Cómo verifican a los profesionales?</h3>
                <p className="text-slate-600 text-sm">
                  Todos pasan por verificación de identidad, antecedentes y certificaciones profesionales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
                <p className="text-slate-600 text-sm">
                  Mercado Pago, transferencia bancaria y efectivo directo al profesional.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Hay garantía en los servicios?</h3>
                <p className="text-slate-600 text-sm">
                  Sí, ofrecemos garantía de satisfacción y mediación en caso de problemas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Puedo cancelar un servicio?</h3>
                <p className="text-slate-600 text-sm">
                  Sí, puedes cancelar hasta 24 horas antes sin costo adicional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}