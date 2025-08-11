import { Link } from "wouter";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
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
      title: "Servicios Populares",
      links: [
        { label: "Plomería", href: "/servicios/plomeria" },
        { label: "Electricidad", href: "/servicios/electricidad" },
        { label: "Pintura", href: "/servicios/pintura" },
        { label: "Limpieza", href: "/servicios/limpieza" },
        { label: "Carpintería", href: "/servicios/carpinteria" },
        { label: "Ver todos los servicios", href: "/servicios" },
      ]
    },
    {
      title: "Para Profesionales",
      links: [
        { label: "Registrarse como Profesional", href: "/register-provider" },
        { label: "Cómo funciona", href: "/como-funciona" },
        { label: "Guía de precios", href: "/precios" },
      ]
    },
    {
      title: "Ayuda",
      links: [
        { label: "Cómo funciona", href: "/como-funciona" },
        { label: "Centro de ayuda", href: "/centro-ayuda" },
        { label: "Contacto", href: "/contacto" },
        { label: "Sobre nosotros", href: "/about" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Términos y Condiciones", href: "/legal/terminos" },
        { label: "Política de Privacidad", href: "/legal/privacidad" },
        { label: "Aviso Legal", href: "/legal/aviso" },
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
            
            {/* Quick Contact */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/contacto" 
                className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Mail className="h-5 w-5" />
                <span>Contactanos</span>
              </Link>
              <Link 
                href="/servicios"
                className="inline-flex items-center justify-center space-x-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                <span>Ver Servicios</span>
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="font-semibold text-white mb-4 border-b border-slate-700 pb-2">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href.startsWith('http') ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-primary text-sm transition-colors cursor-pointer hover:translate-x-1 transform duration-200 inline-block"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-slate-300 hover:text-primary text-sm transition-colors cursor-pointer hover:translate-x-1 transform duration-200 inline-block">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">Profesionales Verificados</h4>
              <p className="text-slate-400 text-sm">Todos nuestros profesionales pasan por un riguroso proceso de verificación</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-3">
                <Phone className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">Soporte</h4>
              <p className="text-slate-400 text-sm">Estamos aquí para ayudarte en cada paso del proceso</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">Cobertura Nacional</h4>
              <p className="text-slate-400 text-sm">Servicios disponibles en las principales ciudades de Argentina</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
              <div className="text-slate-400 text-sm">
                © {currentYear} ServiciosHogar.com.ar
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                <span className="text-slate-400">Plataforma en funcionamiento</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/legal/terminos" className="text-slate-400 hover:text-primary transition-colors">
                Términos
              </Link>
              <Link href="/legal/privacidad" className="text-slate-400 hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link href="/legal/aviso" className="text-slate-400 hover:text-primary transition-colors">
                Aviso Legal
              </Link>
              <Link href="/contacto" className="text-slate-400 hover:text-primary transition-colors">
                Contacto
              </Link>
              <div className="flex items-center space-x-2 text-slate-400">
                <span>Pagos seguros:</span>
                <div className="flex space-x-1">
                  <div className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">MP</div>
                  <div className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Banco</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}