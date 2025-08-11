import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReferralApply() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Check if there's a referral code in the URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setCode(refCode);
    }
  }, []);

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de referido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would be called during user registration
      // For demo purposes, we'll just show the flow
      const response = await apiRequest("POST", "/api/referrals/apply", {
        code: code.trim(),
        userId: "demo-user-id", // This would be the actual new user ID
      });

      if (response.success) {
        setApplied(true);
        toast({
          title: "¡Código aplicado!",
          description: "Has recibido tus créditos de bienvenida",
        });
        
        // Redirect to registration or home after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Código inválido o expirado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a ServiciosHogar!</CardTitle>
          <CardDescription>
            Ingresa el código de referido para obtener créditos gratis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applied ? (
            <Alert>
              <AlertDescription className="text-center">
                <p className="font-medium text-lg mb-2">¡Felicidades!</p>
                <p>Has recibido 50 créditos de bienvenida</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirigiendo...
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Código de referido</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC12345"
                  className="font-mono text-center text-lg"
                  maxLength={20}
                />
              </div>

              <Button
                onClick={handleApplyCode}
                disabled={loading || !code.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aplicando código...
                  </>
                ) : (
                  "Aplicar código"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes código?{" "}
                  <a href="/register" className="text-primary hover:underline">
                    Regístrate sin código
                  </a>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}