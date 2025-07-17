import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import ProviderProfile from "@/pages/provider-profile";
import ProviderDashboard from "@/pages/provider-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import MyRequests from "@/pages/my-requests";
import Payment from "@/pages/payment";
import PaymentMethods from "@/pages/payment-methods";
import PaymentSuccess from "@/pages/payment-success";
import TestPayments from "@/pages/test-payments";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import ComoFunciona from "@/pages/como-funciona";
import Contacto from "@/pages/contacto";
import Terminos from "@/pages/terminos";
import Privacidad from "@/pages/privacidad";
import Seguridad from "@/pages/seguridad";
import Blog from "@/pages/blog";
import CentroAyuda from "@/pages/centro-ayuda";
import Carreras from "@/pages/carreras";
import Prensa from "@/pages/prensa";
import Precios from "@/pages/precios";
import ServiciosPlomeria from "@/pages/servicios-plomeria";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes available to all users */}
      <Route path="/servicios" component={Services} />
      <Route path="/servicios/:id" component={ServiceDetail} />
      <Route path="/profesional/:id" component={ProviderProfile} />
      <Route path="/test-payments" component={TestPayments} />
      <Route path="/about" component={About} />
      <Route path="/como-funciona" component={ComoFunciona} />
      <Route path="/contacto" component={Contacto} />
      <Route path="/terminos" component={Terminos} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/seguridad" component={Seguridad} />
      <Route path="/blog" component={Blog} />
      <Route path="/centro-ayuda" component={CentroAyuda} />
      <Route path="/carreras" component={Carreras} />
      <Route path="/prensa" component={Prensa} />
      <Route path="/precios" component={Precios} />
      <Route path="/servicios/plomeria" component={ServiciosPlomeria} />
      
      {/* Authentication-dependent routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/mis-solicitudes" component={MyRequests} />
          <Route path="/payment/:requestId" component={Payment} />
          <Route path="/payment-methods/:requestId" component={PaymentMethods} />
          <Route path="/payment-success/:requestId" component={PaymentSuccess} />
          <Route path="/dashboard-profesional" component={ProviderDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/perfil" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
