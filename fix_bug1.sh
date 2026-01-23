#!/bin/bash

# ===== FIX BUG #1: Homepage redirige a login =====

echo "🔧 Aplicando Fix Bug #1..."

# 1. Backup del archivo actual
cp frontend/src/App.tsx frontend/src/App.tsx.backup_bug1

# 2. Crear nuevo App.tsx con los cambios
cat > frontend/src/App.tsx << 'EOF'
import { Route, Switch } from 'wouter';

// Pages - Core
import Landing from '@/pages/landing';  // 👈 NUEVO: Landing pública
import HomePage from '@/pages/home';    // 👈 RENOMBRADO: Ahora es dashboard privado
import Login from '@/pages/login';
import Register from '@/pages/register';

// Pages - Provider
import RegisterProvider from '@/pages/register-provider';
import ProviderDashboard from '@/pages/provider-dashboard';
import ProviderProfile from '@/pages/provider-profile';

// Pages - Credits
import ComprarCreditos from '@/pages/comprar-creditos';
import CompraExitosa from '@/pages/compra-exitosa';
import CompraFallida from '@/pages/compra-fallida';
import CompraPendiente from '@/pages/compra-pendiente';

// Pages - Services
import Services from '@/pages/services';
import ServiceDetail from '@/pages/service-detail';
import Search from '@/pages/search';
import CreateRequest from '@/pages/create-request';
import MyRequests from '@/pages/my-requests';

// Pages - User
import Profile from '@/pages/profile';
import Messages from '@/pages/messages';

// Pages - Admin
import AdminDashboard from '@/pages/admin-dashboard';
import AnalyticsDashboard from '@/pages/analytics-dashboard';

// Pages - Institutional
import About from '@/pages/about';
import ComoFunciona from '@/pages/como-funciona';
import CentroAyuda from '@/pages/centro-ayuda';
import Contacto from '@/pages/contacto-fixed';

// Pages - Legal
import Terminos from '@/pages/terminos';
import Privacidad from '@/pages/privacidad';
import AvisoLegal from '@/pages/aviso-legal';
import Seguridad from '@/pages/seguridad';

function App() {
  return (
    <Switch>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" component={Landing} />  {/* 👈 LANDING PÚBLICA */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/register-provider" component={RegisterProvider} />

      {/* ===== AUTHENTICATED ROUTES ===== */}
      <Route path="/dashboard" component={HomePage} />  {/* 👈 DASHBOARD PRIVADO */}
      <Route path="/perfil" component={Profile} />
      <Route path="/mis-solicitudes" component={MyRequests} />
      <Route path="/mensajes" component={Messages} />

      {/* ===== PROVIDER ROUTES ===== */}
      <Route path="/dashboard-profesional" component={ProviderDashboard} />
      <Route path="/perfil-profesional" component={ProviderProfile} />

      {/* ===== CREDITS ROUTES ===== */}
      <Route path="/comprar-creditos" component={ComprarCreditos} />
      <Route path="/compra-exitosa" component={CompraExitosa} />
      <Route path="/compra-fallida" component={CompraFallida} />
      <Route path="/compra-pendiente" component={CompraPendiente} />

      {/* ===== SERVICES ROUTES (PUBLIC) ===== */}
      <Route path="/servicios" component={Services} />
      <Route path="/buscar" component={Search} />
      <Route path="/servicio/:id" component={ServiceDetail} />
      <Route path="/crear-solicitud" component={CreateRequest} />

      {/* ===== ADMIN ROUTES ===== */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/analytics" component={AnalyticsDashboard} />

      {/* ===== INSTITUTIONAL ROUTES (PUBLIC) ===== */}
      <Route path="/about" component={About} />
      <Route path="/como-funciona" component={ComoFunciona} />
      <Route path="/centro-ayuda" component={CentroAyuda} />
      <Route path="/contacto" component={Contacto} />

      {/* ===== LEGAL ROUTES (PUBLIC) ===== */}
      <Route path="/terminos" component={Terminos} />
      <Route path="/legal/terminos" component={Terminos} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/legal/privacidad" component={Privacidad} />
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route path="/legal/aviso" component={AvisoLegal} />
      <Route path="/seguridad" component={Seguridad} />

      {/* ===== 404 ROUTE ===== */}
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Página no encontrada</p>
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Volver al inicio
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
