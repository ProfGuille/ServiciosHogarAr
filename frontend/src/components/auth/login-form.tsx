import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Try to get error message from response
        try {
          const result = await response.json();
          throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          // If response is not JSON, use status text
          if (response.status === 503 || response.status === 502) {
            throw new Error('El servicio está temporalmente no disponible. Por favor, inténtalo más tarde.');
          } else if (response.status === 404) {
            throw new Error('Servicio de autenticación no encontrado. El backend podría estar desconectado.');
          } else {
            throw new Error(`Error ${response.status}: Servicio no disponible`);
          }
        }
      }

      const result = await response.json();

      // Success
      console.log('Login successful:', result);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to dashboard or home
        setLocation('/');
      }

    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("No se puede conectar con el servidor. Por favor, verifica tu conexión a internet.");
      } else {
        setError(error instanceof Error ? error.message : "Error al iniciar sesión. Por favor, inténtalo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Iniciar Sesión
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Ingresa a tu cuenta de ServiciosHogar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-9"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-9"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <span>¿No tienes cuenta? </span>
            <button
              type="button"
              onClick={() => setLocation('/register')}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Regístrate aquí
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}