import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementNotification } from "@/components/achievements/achievement-notification";
// import { PWAInstallPrompt, PWAUpdateNotification, MobileOptimizer, InlineCriticalCSS, ResourcePreloader, usePerformanceMonitoring } from "@/components/pwa";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Services from "@/pages/services";
import ServicesSimple from "@/pages/services-simple";
import SmartSearch from "@/pages/smart-search";
import ServiceDetail from "@/pages/service-detail";
import ProviderProfile from "@/pages/provider-profile";
import ProviderDashboard from "@/pages/provider-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import AdminWordPress from "@/pages/admin-wordpress";
import AdminIntegrations from "@/pages/admin-integrations";
import MyRequests from "@/pages/my-requests";
import Payment from "@/pages/payment";
import PaymentMethods from "@/pages/payment-methods";
import PaymentSuccess from "@/pages/payment-success";
import TestPayments from "@/pages/test-payments";
import BuyCredits from "@/pages/buy-credits";
import GeolocationDashboard from "@/pages/geolocation-dashboard";
import Search from "@/pages/search";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import ComoFunciona from "@/pages/como-funciona";
import Contacto from "@/pages/contacto-fixed";
// Legacy routes - redirected to /legal/
import Terminos from "@/pages/terminos";
import Privacidad from "@/pages/privacidad";
import Seguridad from "@/pages/seguridad";
// New legal pages with proper Argentine compliance
import TerminosLegal from "@/pages/legal/terminos";
import PrivacidadLegal from "@/pages/legal/privacidad";
import AvisoLegalNuevo from "@/pages/legal/aviso";
import AvisoLegal from "@/pages/aviso-legal";
import Blog from "@/pages/blog";
import CentroAyuda from "@/pages/centro-ayuda";
import Carreras from "@/pages/carreras";
import Prensa from "@/pages/prensa";
import Precios from "@/pages/precios";
import ServiciosPlomeria from "@/pages/servicios-plomeria";
import ServiciosElectricidad from "@/pages/servicios-electricidad";
import ServiciosPintura from "@/pages/servicios-pintura";
import ServiciosLimpieza from "@/pages/servicios-limpieza";
import ServiciosCarpinteria from "@/pages/servicios-carpinteria";
import ServiciosGasista from "@/pages/servicios-gasista";
import ServiciosAlbanil from "@/pages/servicios-albanil";
import ServiciosTecnicoAire from "@/pages/servicios-tecnico-aire";
import ServiciosJardineria from "@/pages/servicios-jardineria";
import ServiciosCerrajero from "@/pages/servicios-cerrajero";
import ServiciosMudanzas from "@/pages/servicios-mudanzas";
import ServiciosHerrero from "@/pages/servicios-herrero";
import ServiciosTechista from "@/pages/servicios-techista";
import ServiciosFumigador from "@/pages/servicios-fumigador";
import ServiciosTecnicoPc from "@/pages/servicios-tecnico-pc";
import ServiciosPequenosArreglos from "@/pages/servicios-pequenos-arreglos";
import ServiciosTapicero from "@/pages/servicios-tapicero";
import ServiciosVidriero from "@/pages/servicios-vidriero";
import ServiciosInstaladorSolar from "@/pages/servicios-instalador-solar";
import Messages from "@/pages/messages";
import ReferralApply from "@/pages/referral-apply";
import Register from "@/pages/register";
import RegisterProvider from "@/pages/register-provider";
import ComprarCreditos from "@/pages/comprar-creditos";
import LegalCompliance from "@/pages/legal-compliance";
import CreateRequest from "@/pages/create-request";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentAchievement, closeNotification } = useAchievements();

  return (
    <div>
      <AchievementNotification 
        achievement={currentAchievement} 
        onClose={closeNotification} 
      />
      {/* Temporarily disabled PWA components for debugging
      <MobileOptimizer>
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      */}
      <Switch>
      {/* Public routes available to all users */}
      <Route path="/login" component={Login} />
      <Route path="/buscar" component={Search} />
      <Route path="/ai-search" component={SmartSearch} />
      <Route path="/servicios" component={ServicesSimple} />
      <Route path="/register" component={Register} />
      <Route path="/comprar-creditos" component={ComprarCreditos} />
      <Route path="/register-provider" component={RegisterProvider} />
      <Route path="/legal-compliance" component={LegalCompliance} />
      <Route path="/referral" component={ReferralApply} />
      {/* Specific service routes MUST come BEFORE the generic /servicios/:id route */}
      <Route path="/servicios/plomeria" component={ServiciosPlomeria} />
      <Route path="/servicios/electricidad" component={ServiciosElectricidad} />
      <Route path="/servicios/pintura" component={ServiciosPintura} />
      <Route path="/servicios/limpieza" component={ServiciosLimpieza} />
      <Route path="/servicios/carpinteria" component={ServiciosCarpinteria} />
      <Route path="/servicios/gasista" component={ServiciosGasista} />
      <Route path="/servicios/albanil" component={ServiciosAlbanil} />
      <Route path="/servicios/tecnico-aire" component={ServiciosTecnicoAire} />
      <Route path="/servicios/jardineria" component={ServiciosJardineria} />
      <Route path="/servicios/cerrajero" component={ServiciosCerrajero} />
      <Route path="/servicios/mudanzas" component={ServiciosMudanzas} />
      <Route path="/servicios/herrero" component={ServiciosHerrero} />
      <Route path="/servicios/techista" component={ServiciosTechista} />
      <Route path="/servicios/fumigador" component={ServiciosFumigador} />
      <Route path="/servicios/tecnico-pc" component={ServiciosTecnicoPc} />
      <Route path="/servicios/pequenos-arreglos" component={ServiciosPequenosArreglos} />
      <Route path="/servicios/tapicero" component={ServiciosTapicero} />
      <Route path="/servicios/vidriero" component={ServiciosVidriero} />
      <Route path="/servicios/instalador-solar" component={ServiciosInstaladorSolar} />
      {/* Generic routes AFTER specific ones */}
      <Route path="/servicios/:id" component={ServiceDetail} />
      <Route path="/profesional/:id" component={ProviderProfile} />
      <Route path="/test-payments" component={TestPayments} />
      <Route path="/about" component={About} />
      <Route path="/como-funciona" component={ComoFunciona} />
      <Route path="/contacto" component={Contacto} />
      {/* Legal pages - new structure */}
      <Route path="/legal/terminos" component={TerminosLegal} />
      <Route path="/legal/privacidad" component={PrivacidadLegal} />
      <Route path="/legal/aviso" component={AvisoLegalNuevo} />
      {/* Legacy redirects for SEO */}
      <Route path="/terminos" component={TerminosLegal} />
      <Route path="/privacidad" component={PrivacidadLegal} />
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route path="/seguridad" component={Seguridad} />
      <Route path="/blog" component={Blog} />
      <Route path="/centro-ayuda" component={CentroAyuda} />
      <Route path="/carreras" component={Carreras} />
      <Route path="/prensa" component={Prensa} />
      <Route path="/precios" component={Precios} />

      {/* Authentication-dependent routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/mis-solicitudes" component={MyRequests} />
          <Route path="/crear-solicitud" component={CreateRequest} />
          {/* Payment routes removed - customers pay professionals directly, not through platform */}
          {/* <Route path="/payment/:requestId" component={Payment} /> */}
          {/* <Route path="/payment-methods/:requestId" component={PaymentMethods} /> */}
          {/* <Route path="/payment-success/:requestId" component={PaymentSuccess} /> */}
          <Route path="/dashboard-profesional" component={ProviderDashboard} />
          <Route path="/geolocation" component={GeolocationDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          <Route path="/admin/wordpress" component={AdminWordPress} />
          <Route path="/admin/integrations" component={AdminIntegrations} />
          <Route path="/mensajes" component={Messages} />
          <Route path="/perfil" component={Profile} />
          <Route path="/comprar-creditos" component={BuyCredits} />
        </>
      )}
      <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // usePerformanceMonitoring(); // Temporarily disabled
  
  useEffect(() => {
    fetch("/api/test")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          return res.text();
        }
      })
      .then((data) => console.log("Respuesta backend:", data))
      .catch((err) => console.error("Error al conectar con backend:", err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Temporarily disabled PWA components
        <InlineCriticalCSS />
        <ResourcePreloader />
        */}
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
// Force deploy vie 09 ene 2026 14:42:23 -03
