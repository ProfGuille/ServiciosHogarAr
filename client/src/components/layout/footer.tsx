import { Link } from "wouter";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Heart
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Para Clientes",
      links: [
        { name: "Buscar Servicios", href: "/servicios" },
        { name: "Cómo Funciona", href: "/como-funciona" },
        { name: "Preguntas Frecuentes", href: "/faq" },
        { name: "Garantía de Calidad", href: "/garantia" },
        { name: "Ayuda y Soporte", href: "/ayuda" },
      ]
    },
    {
      title: "Para Profesionales",
      links: [
        { name: "Registrarse", href: "/api/login" },
        { name: "Planes y Precios", href: "/planes" },
        { name: "Centro de Ayuda", href: "/ayuda-profesionales" },
        { name: "Recursos", href: "/recursos" },
        { name: "App Móvil", href: "/app" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Términos y Condiciones", href: "/terminos" },
        { name: "Política de Privacidad", href: "/privacidad" },
        { name: "Política de Cookies", href: "/cookies" },
        { name: "Defensa del Consumidor", href: "/defensa-consumidor" },
        { name: "Contacto", href: "/contacto" },
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">ServiciosHogar</h3>
            <p className="text-slate-300 mb-6">
              La plataforma líder para servicios del hogar en Argentina. 
              Conectamos profesionales verificados con clientes que necesitan 
              soluciones confiables.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-slate-300">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} ServiciosHogar.com.ar. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-slate-400 text-sm">Hecho con</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span className="text-slate-400 text-sm">en Argentina</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
