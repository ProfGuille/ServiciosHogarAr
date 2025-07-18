import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Gift, Copy, Share2, Users, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function ReferralShareCard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: referralCode, isLoading: codeLoading } = useQuery({
    queryKey: ["/api/referrals/code"],
  });

  const { data: referralStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  const shareUrl = referralCode ? `${window.location.origin}?ref=${referralCode.code}` : "";

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "¡Copiado!",
        description: "El enlace de referido se copió al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `¡Te invito a unirte a ServiciosHogar! Regístrate con mi código y obtén créditos gratis para contratar servicios: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareViaEmail = () => {
    const subject = "Invitación a ServiciosHogar";
    const body = `¡Hola!\n\nTe invito a unirte a ServiciosHogar, la mejor plataforma para encontrar profesionales de confianza.\n\nRegístrate con mi enlace y obtén créditos gratis: ${shareUrl}\n\n¡Nos vemos allí!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (codeLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Invita y Gana
        </CardTitle>
        <CardDescription>
          Comparte tu código de referido y gana créditos gratis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Stats */}
        {referralStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{referralStats.totalReferrals}</p>
              <p className="text-sm text-muted-foreground">Invitados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{referralStats.successfulReferrals}</p>
              <p className="text-sm text-muted-foreground">Exitosos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{referralStats.totalCreditsEarned}</p>
              <p className="text-sm text-muted-foreground">Créditos ganados</p>
            </div>
          </div>
        )}

        {/* Referral Code Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tu código de referido</label>
          <div className="flex gap-2">
            <Input
              value={referralCode?.code || ""}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
            >
              <Copy className={`h-4 w-4 ${copied ? "text-green-600" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Share URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Enlace de invitación</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
            >
              <Copy className={`h-4 w-4 ${copied ? "text-green-600" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={shareViaWhatsApp}
            className="flex-1"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={shareViaEmail}
            className="flex-1"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>

        {/* Referral Benefits */}
        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Beneficios del programa
          </h4>
          <ul className="space-y-2">
            {user?.userType === 'provider' ? (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">El profesional referido recibe 25 créditos al registrarse</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Tú recibes 100 créditos cuando compra su primer paquete</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Bonos especiales de 250 y 500 créditos al alcanzar 5 y 10 referidos</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ayuda a crecer nuestra comunidad de profesionales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Gana logros especiales por referir profesionales verificados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Conviértete en Cliente Embajador con 5 profesionales referidos</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}