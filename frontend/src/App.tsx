import { Route, Switch } from 'wouter';
import HomePage from '@/pages/home';
import RegisterProvider from '@/pages/register-provider';
import Login from '@/pages/login';
import ComprarCreditos from '@/pages/comprar-creditos';
import CompraExitosa from '@/pages/compra-exitosa';
import CompraFallida from '@/pages/compra-fallida';
import CompraPendiente from '@/pages/compra-pendiente';

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/register-provider" component={RegisterProvider} />
      <Route path="/login" component={Login} />
      <Route path="/comprar-creditos" component={ComprarCreditos} />
      <Route path="/compra-exitosa" component={CompraExitosa} />
      <Route path="/compra-fallida" component={CompraFallida} />
      <Route path="/compra-pendiente" component={CompraPendiente} />
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
