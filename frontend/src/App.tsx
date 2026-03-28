import { Route, Switch } from 'wouter';
import { lazy, Suspense } from 'react';

const Landing = lazy(() => import('@/pages/landing'));
const HomePage = lazy(() => import('@/pages/home'));
const Login = lazy(() => import('@/pages/login'));
const ForgotPassword = lazy(() => import('@/pages/forgot-password'));
const ResetPassword = lazy(() => import('@/pages/reset-password'));
const Register = lazy(() => import('@/pages/register'));
const RegisterProvider = lazy(() => import('@/pages/register-provider'));
const ProviderDashboard = lazy(() => import('@/pages/provider-dashboard'));
const ProviderProfile = lazy(() => import('@/pages/provider-profile'));
const ComprarCreditos = lazy(() => import('@/pages/comprar-creditos'));
const CompraExitosa = lazy(() => import('@/pages/compra-exitosa'));
const CompraFallida = lazy(() => import('@/pages/compra-fallida'));
const CompraPendiente = lazy(() => import('@/pages/compra-pendiente'));
const Services = lazy(() => import('@/pages/services'));
const ServiceDetail = lazy(() => import('@/pages/service-detail'));
const Search = lazy(() => import('@/pages/search'));
const CreateRequest = lazy(() => import('@/pages/create-request'));
const MyRequests = lazy(() => import('@/pages/my-requests'));
const Profile = lazy(() => import('@/pages/profile'));
const Messages = lazy(() => import('@/pages/messages'));
const AdminDashboard = lazy(() => import('@/pages/admin-dashboard'));
const AnalyticsDashboard = lazy(() => import('@/pages/analytics-dashboard'));
const About = lazy(() => import('@/pages/about'));
const ComoFunciona = lazy(() => import('@/pages/como-funciona'));
const CentroAyuda = lazy(() => import('@/pages/centro-ayuda'));
const Contacto = lazy(() => import('@/pages/contacto-fixed'));
const Terminos = lazy(() => import('@/pages/terminos'));
const Privacidad = lazy(() => import('@/pages/privacidad'));
const AvisoLegal = lazy(() => import('@/pages/aviso-legal'));
const Seguridad = lazy(() => import('@/pages/seguridad'));
const NewServiceRequest = lazy(() => import('@/pages/NewServiceRequest'));

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/register" component={Register} />
        <Route path="/register-provider" component={RegisterProvider} />
        <Route path="/dashboard" component={HomePage} />
        <Route path="/perfil" component={Profile} />
        <Route path="/mis-solicitudes" component={MyRequests} />
        <Route path="/mensajes" component={Messages} />
        <Route path="/dashboard-profesional" component={ProviderDashboard} />
        <Route path="/profesional/:id" component={ProviderProfile} />
        <Route path="/comprar-creditos" component={ComprarCreditos} />
        <Route path="/compra-exitosa" component={CompraExitosa} />
        <Route path="/compra-fallida" component={CompraFallida} />
        <Route path="/compra-pendiente" component={CompraPendiente} />
        <Route path="/servicios" component={Services} />
        <Route path="/buscar" component={Search} />
        <Route path="/servicio/:id" component={ServiceDetail} />
        <Route path="/crear-solicitud" component={CreateRequest} />
        <Route path="/nueva-solicitud" component={NewServiceRequest} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/analytics" component={AnalyticsDashboard} />
        <Route path="/about" component={About} />
        <Route path="/como-funciona" component={ComoFunciona} />
        <Route path="/centro-ayuda" component={CentroAyuda} />
        <Route path="/contacto" component={Contacto} />
        <Route path="/terminos" component={Terminos} />
        <Route path="/privacidad" component={Privacidad} />
        <Route path="/aviso-legal" component={AvisoLegal} />
        <Route path="/seguridad" component={Seguridad} />
      </Switch>
    </Suspense>
  );
}

export default App;
