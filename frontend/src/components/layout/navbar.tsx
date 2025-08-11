import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { NotificationCenter } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Briefcase,
  FileText,
  BarChart
} from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const isActive = (path: string) => location === path;

  const navigationLinks = [
    { href: "/", label: t('nav.home'), icon: Home },
    { href: "/buscar", label: t('nav.search'), icon: Search },
    { href: "/servicios", label: t('nav.services'), icon: Briefcase },
  ];

  const authenticatedLinks = [
    { href: "/mis-solicitudes", label: t('nav.requests'), icon: FileText },
    { href: "/dashboard-profesional", label: t('nav.dashboard'), icon: Briefcase },
  ];

  const adminLinks = [
    { href: "/admin", label: t('nav.admin'), icon: Shield },
    { href: "/analytics", label: t('nav.analytics'), icon: BarChart },
  ];

  const UserMenu = () => {
    if (!isAuthenticated || !user) return null;

    const initials = user.firstName && user.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email?.[0]?.toUpperCase() || "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImageUrl} alt={user.firstName || "Usuario"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuItem asChild>
            <Link href="/perfil">
              <User className="mr-2 h-4 w-4" />
              {t('nav.profile')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/mis-solicitudes">
              <FileText className="mr-2 h-4 w-4" />
              {t('nav.requests')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard-profesional">
              <Settings className="mr-2 h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('nav.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">ServiciosHogar</span>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Argentina
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={isActive(link.href) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              ))}
              
              {isAuthenticated && authenticatedLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={isActive(link.href) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              ))}

              {/* Admin link - solo para admins */}
              {isAuthenticated && user?.email?.includes('@admin') && adminLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={isActive(link.href) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu & Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <LanguageSwitcher />
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  <NotificationCenter />
                  <UserMenu />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login">
                      {t('nav.login')}
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        {t('nav.register')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/register">
                          <User className="mr-2 h-4 w-4" />
                          Registro Cliente
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register-provider">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Registro Proveedor
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={isActive(link.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {isAuthenticated && authenticatedLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button 
                    variant={isActive(link.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Button>
                </Link>
              ))}

              {/* Auth buttons for mobile */}
              {!isAuthenticated && (
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Link href="/register">
                    <Button 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;