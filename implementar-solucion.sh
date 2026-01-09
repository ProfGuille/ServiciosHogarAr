#!/bin/bash

# Script de implementación completa
# ServiciosHogar.com.ar - Fix Login + Callbacks MP
# Fecha: 2026-01-09

echo "🚀 Implementando solución completa..."
echo "======================================"
echo ""

# Paso 1: Verificar que estamos en el proyecto
echo "📂 Paso 1: Verificando directorio del proyecto..."
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "   ❌ Error: No estamos en el directorio del proyecto"
  echo "   Por favor ejecutá este script desde la raíz del proyecto ServiciosHogarAr"
  exit 1
fi
echo "   ✅ Estamos en: $(pwd)"
echo ""

# Paso 2: Crear helper de autenticación
echo "📝 Paso 2: Creando auth.ts helper..."
mkdir -p frontend/src/lib
cat > frontend/src/lib/auth.ts << 'EOF'
// frontend/src/lib/auth.ts

/**
 * Obtiene el token JWT del localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    // Decodificar el JWT para verificar si expiró
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    // Si el token expiró, lo eliminamos
    if (payload.exp && payload.exp < now) {
      logout();
      return false;
    }
    
    return true;
  } catch {
    // Si hay error al decodificar, token inválido
    logout();
    return false;
  }
}

/**
 * Obtiene la info del usuario del localStorage
 */
export function getUser(): any | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Cierra sesión eliminando token y usuario
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Headers con autenticación para fetch
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}
EOF
echo "   ✅ auth.ts creado"
echo ""

# Paso 3: Actualizar login.tsx
echo "📝 Paso 3: Actualizando login.tsx..."
cat > frontend/src/pages/login.tsx << 'EOF'
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/api';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // ✅ CRÍTICO: Guardar el token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        // También guardamos info del usuario si viene en la respuesta
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Redirigir al dashboard o comprar créditos
        setLocation('/comprar-creditos');
      } else {
        throw new Error('No se recibió el token de autenticación');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresá a tu cuenta de proveedor
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            
            <div className="text-sm text-center text-gray-600">
              ¿No tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => setLocation('/register-provider')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Registrate aquí
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
EOF
echo "   ✅ login.tsx actualizado"
echo ""

# Paso 4: Crear páginas de callback
echo "📝 Paso 4: Creando páginas de callback..."

# 4a: compra-exitosa.tsx
cat > frontend/src/pages/compra-exitosa.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function CompraExitosa() {
  const [, setLocation] = useLocation();
  const [paymentId, setPaymentId] = useState<string>('');
  const [credits, setCredits] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment_id') || params.get('collection_id');
    const creditsParam = params.get('credits');
    
    if (payment) setPaymentId(payment);
    if (creditsParam) setCredits(creditsParam);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            ¡Compra Exitosa!
          </CardTitle>
          <CardDescription>
            Tu pago fue procesado correctamente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Créditos agregados</div>
              {credits ? (
                <div className="text-3xl font-bold text-green-600">
                  +{credits} créditos
                </div>
              ) : (
                <div className="text-lg text-gray-600">
                  Se agregarán a tu cuenta en breve
                </div>
              )}
            </div>
          </div>

          {paymentId && (
            <div className="text-xs text-center text-gray-500">
              ID de pago: {paymentId}
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            Los créditos ya están disponibles en tu cuenta y podés empezar a usarlos inmediatamente.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full"
            onClick={() => setLocation('/comprar-creditos')}
          >
            Ver mis créditos
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Ir al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
EOF
echo "   ✅ compra-exitosa.tsx creado"

# 4b: compra-fallida.tsx
cat > frontend/src/pages/compra-fallida.tsx << 'EOF'
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function CompraFallida() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Compra Fallida
          </CardTitle>
          <CardDescription>
            No se pudo procesar tu pago
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Tu pago no pudo ser procesado. Esto puede deberse a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Fondos insuficientes</li>
                <li>Datos incorrectos</li>
                <li>Cancelación del pago</li>
                <li>Error temporal del servicio</li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-gray-600 text-center">
            No se realizó ningún cargo a tu cuenta.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full"
            onClick={() => setLocation('/comprar-creditos')}
          >
            Intentar nuevamente
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
EOF
echo "   ✅ compra-fallida.tsx creado"

# 4c: compra-pendiente.tsx
cat > frontend/src/pages/compra-pendiente.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function CompraPendiente() {
  const [, setLocation] = useLocation();
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment_id') || params.get('collection_id');
    
    if (payment) setPaymentId(payment);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-700">
            Pago Pendiente
          </CardTitle>
          <CardDescription>
            Estamos procesando tu pago
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Tu pago está siendo procesado. Esto puede ocurrir cuando:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Pagás con transferencia bancaria</li>
                <li>Pagás en efectivo (Rapipago, Pago Fácil)</li>
                <li>El banco está validando la transacción</li>
              </ul>
            </div>
          </div>

          {paymentId && (
            <div className="text-xs text-center text-gray-500">
              ID de pago: {paymentId}
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            Te notificaremos por email cuando se acredite el pago. Esto puede tardar hasta 48hs.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full"
            onClick={() => setLocation('/comprar-creditos')}
          >
            Ver estado de mis créditos
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
EOF
echo "   ✅ compra-pendiente.tsx creado"
echo ""

# Paso 5: Actualizar App.tsx para agregar rutas
echo "📝 Paso 5: Actualizando App.tsx con rutas..."
cat > frontend/src/App.tsx << 'EOF'
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
EOF
echo "   ✅ App.tsx actualizado"
echo ""

# Paso 6: Commit y push
echo "📤 Paso 6: Commit y push a GitHub..."
git add .
git commit -m "Fix: Login guarda token en localStorage + Páginas callback MercadoPago"
git push origin main
echo "   ✅ Push completado"
echo ""

echo "======================================"
echo "✅ ¡Implementación completa!"
echo "======================================"
echo ""
echo "📋 Próximos pasos:"
echo "1. Vercel detectará los cambios y redesplegará automáticamente"
echo "2. Esperá 2-3 minutos"
echo "3. Probá el login en: https://servicioshogar.com.ar/login"
echo ""
echo "🧪 Para testing manual:"
echo "   Email: circaireargentino+login@gmail.com"
echo "   Password: Password123"
echo ""
echo "📊 Archivos creados/modificados:"
echo "   - frontend/src/lib/auth.ts (NUEVO)"
echo "   - frontend/src/pages/login.tsx (ACTUALIZADO)"
echo "   - frontend/src/pages/compra-exitosa.tsx (NUEVO)"
echo "   - frontend/src/pages/compra-fallida.tsx (NUEVO)"
echo "   - frontend/src/pages/compra-pendiente.tsx (NUEVO)"
echo "   - frontend/src/App.tsx (ACTUALIZADO)"
echo ""
