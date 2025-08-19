import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Search, Phone } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="mb-8">
            <AlertCircle className="h-24 w-24 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
            <p className="text-gray-600 mb-8">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            
            <Link href="/buscar">
              <Button variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Buscar servicios
              </Button>
            </Link>
            
            <Link href="/contacto">
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Contactar soporte
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Si crees que esto es un error, por favor contacta a nuestro equipo de soporte.</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
