import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contacto() {
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const suggestService = searchParams.get('sugerir') === 'servicio';
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: suggestService ? "Sugerencia de nuevo servicio" : "",
    message: suggestService ? "Me gustaría sugerir que agreguen el siguiente servicio a la plataforma:\n\nServicio: \nDescripción: \n\n¿Por qué sería útil?: " : ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contacto - ServiciosHogar.com.ar";
    // Asegurar que la página se muestre desde arriba
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, email y mensaje.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "¡Mensaje enviado!",
        description: "Nos pondremos en contacto contigo pronto.",
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Contenido principal con ID para debugging */}
      <div id="main-content" style={{ paddingTop: "80px", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Contactanos
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              ¿Tienes preguntas o necesitas ayuda? Completa el formulario y nos pondremos en contacto contigo lo antes posible.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Envíanos un mensaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre *</label>
                      <Input 
                        name="name"
                        placeholder="Tu nombre completo" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input 
                        name="email"
                        type="email" 
                        placeholder="tu@email.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <Input 
                      name="phone"
                      placeholder="+54 11 1234-5678" 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Asunto</label>
                    <Input 
                      name="subject"
                      placeholder="¿En qué podemos ayudarte?" 
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mensaje *</label>
                    <Textarea 
                      name="message"
                      placeholder="Describe tu consulta o problema..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
      </div>

      <Footer />
    </div>
  );
}