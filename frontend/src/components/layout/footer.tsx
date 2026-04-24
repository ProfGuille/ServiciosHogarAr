import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  MessageCircle,
  Send,
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Home
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Para Clientes",
      links: [
        { label: "Buscar servicios", href: "/buscar" },
        { label: "Buscar profesionales", href: "/buscar" },
        { label: "Cómo funciona", href: "/como-funciona" },
        { label: "Crear solicitud", href: "/nueva-solicitud" },
      ]
    },
    {
      title: "Para Profesionales",
      links: [
        { label: "Registrarse como Profesional", href: "/register-provider" },
        { label: "Cómo funciona", href: "/como-funciona" },
        { label: "Precios y créditos", href: "/precios" },
      ]
    },
    {
      title: "Ayuda",
      links: [
        { label: "Centro de ayuda", href: "/centro-ayuda" },
        { label: "Contacto", href: "/contacto" },
        { label: "Sobre nosotros", href: "/about" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Términos y Condiciones", href: "/terminos" },
        { label: "Política de Privacidad", href: "/privacidad" },
        { label: "Aviso Legal", href: "/aviso-legal" },
        { label: "Seguridad", href: "/seguridad" },
      ]
    }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">ServiciosHogar</span>
            </div>
            <p className="text-slate-300 text-base mb-6 max-w-md">
              Conectamos hogares argentinos con profesionales verificados para cualquier servicio que necesites.
            </p>
            
            {/* Legal Disclaimer */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong className="text-slate-300">Plataforma de intermediación:</strong> ServiciosHogar.com.ar actúa únicamente como vínculo neutral entre clientes y prestadores independientes. No participamos en contrataciones ni asumimos responsabilidad por servicios prestados.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/sharer/sharer.php?u=https://servicioshogar.com.ar" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://wa.me/?text=Encontrá profesionales del hogar en tu zona https://servicioshogar.com.ar" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://t.me/share/url?url=https://servicioshogar.com.ar&text=Encontrá profesionales del hogar en tu zona" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Send className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/intent/tweet?url=https://servicioshogar.com.ar&text=Encontrá profesionales del hogar en tu zona" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href} className="text-slate-300 hover:text-white transition-colors text-sm">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Mail className="h-4 w-4" />
              <span>administrador@servicioshogar.com.ar</span>
            </div>
            <div className="text-slate-400 text-sm">
              © {currentYear} ServiciosHogar.com.ar. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
