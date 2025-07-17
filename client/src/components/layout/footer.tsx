import { Link } from "wouter";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Servicios",
      links: [
        { label: "Plomería", href: "/servicios?category=plomeria" },
        { label: "Electricidad", href: "/servicios?category=electricidad" },
        { label: "Limpieza", href: "/servicios?category=limpieza" },
        { label: "Carpintería", href: "/servicios?category=carpinteria" },
        { label: "Albañilería", href: "/servicios?category=albanileria" },
      ]
    },
    {
      title: "Para Profesionales",
      links: [
        { label: "Registrarse como Proveedor", href: "/api/login" },
        { label: "Dashboard", href: "/dashboard-profesional" },
        { label: "Verificación", href: "/dashboard-profesional" },
        { label: "Políticas", href: "/dashboard-profesional" },
      ]
    },
    {
      title: "Empresa",
      links: [
        { label: "Nosotros", href: "/about" },
        { label: "Cómo Funciona", href: "/como-funciona" },
        { label: "Blog", href: "/blog" },
        { label: "Carreras", href: "/blog" },
        { label: "Prensa", href: "/blog" },
      ]
    },
    {
      title: "Soporte",
      links: [
        { label: "Centro de Ayuda", href: "/centro-ayuda" },
        { label: "Contacto", href: "/contacto" },
        { label: "Términos de Servicio", href: "/terminos" },
        { label: "Privacidad", href: "/privacidad" },
        { label: "Seguridad", href: "/seguridad" },
      ]
    }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">ServiciosHogar</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              La plataforma líder en Argentina para conectar profesionales del hogar 
              con clientes que necesitan servicios de calidad.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+54 11 5555-0123</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contacto@servicioshogar.com.ar</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href}>
                      <span className="text-slate-300 hover:text-white text-sm transition-colors cursor-pointer">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Payment Methods */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">Síguenos:</span>
              <div className="flex space-x-3">
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">Métodos de pago:</span>
              <div className="flex items-center space-x-2">
                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-slate-900">
                  Mercado Pago
                </div>
                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-slate-900">
                  Transferencia
                </div>
                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-slate-900">
                  Efectivo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-300 text-sm">
              © {currentYear} ServiciosHogar.com.ar. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Link href="/terminos">
                <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                  Términos
                </span>
              </Link>
              <span className="text-slate-500">•</span>
              <Link href="/privacidad">
                <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                  Privacidad
                </span>
              </Link>
              <span className="text-slate-500">•</span>
              <Link href="/seguridad">
                <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">
                  Seguridad
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}