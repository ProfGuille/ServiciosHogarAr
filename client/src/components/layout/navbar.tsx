import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Home,
  Search,
  Briefcase,
  MessageSquare,
  Shield
} from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const navigation = [
    { name: "Inicio", href: "/", current: location === "/" },
    { name: "Buscar Servicios", href: "/servicios", current: location === "/servicios" },
    { name: "Cómo Funciona", href: "/como-funciona", current: false },
    { name: "Para Profesionales", href: "/para-profesionales", current: false },
  ];

  const userNavigation = [
    { name: "Mi Perfil", href: "/perfil", icon: User },
    { name: "Mis Solicitudes", href: "/mis-solicitudes", icon: Briefcase },
    { name: "Mensajes", href: "/mensajes", icon: MessageSquare },
    { name: "Configuración", href: "/configuracion", icon: Settings },
  ];

  const providerNavigation = [
    { name: "Dashboard", href: "/dashboard-profesional", icon: Home },
    { name: "Mi Perfil", href: "/perfil-profesional", icon: User },
    { name: "Solicitudes", href: "/solicitudes", icon: Briefcase },
    { name: "Mensajes", href: "/mensajes", icon: MessageSquare },
  ];

  const adminNavigation = [
    { name: "Panel Admin", href: "/admin", icon: Shield },
    { name: "Usuarios", href: "/admin/usuarios", icon: User },
    { name: "Profesionales", href: "/admin/profesionales", icon: Briefcase },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserNavigation = () => {
    if (user?.userType === "admin") return adminNavigation;
    if (user?.userType === "provider") return providerNavigation;
    return userNavigation;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">ServiciosHogar</h1>
                <span className="text-xs text-slate-500">.com.ar</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    item.current
                      ? "text-primary border-b-2 border-primary"
                      : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || 'Usuario'} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.firstName || 'Usuario'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {user.userType === 'admin' ? 'Administrador' : 
                           user.userType === 'provider' ? 'Profesional' : 'Cliente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {getUserNavigation().map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => window.location.href = "/api/login"}>
                  Iniciar Sesión
                </Button>
                <Button onClick={() => window.location.href = "/api/login"}>
                  Registrarse
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    item.current
                      ? "text-primary bg-primary/10"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && user && (
                <>
                  <div className="border-t border-slate-200 pt-3">
                    {getUserNavigation().map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
