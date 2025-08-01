import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Calendar, Coins, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReferralHistoryItem {
  id: number;
  referredUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  status: string;
  rewardCredits: number | null;
  createdAt: string;
  completedAt: string | null;
}

export function ReferralHistory() {
  const { data: referrals, isLoading } = useQuery<ReferralHistoryItem[]>({
    queryKey: ["/api/referrals/history"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUserName = (user: ReferralHistoryItem["referredUser"]) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email?.split("@")[0] || "Usuario";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Historial de Referidos
        </CardTitle>
        <CardDescription>
          Todas las personas que has invitado a la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!referrals || referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aún no has referido a nadie
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ¡Comparte tu código y comienza a ganar créditos!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {getUserName(referral.referredUser)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {referral.referredUser.email}
                      </p>
                    </div>
                    {getStatusBadge(referral.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(referral.createdAt), "dd MMM yyyy", { locale: es })}
                    </div>
                    
                    {referral.rewardCredits && referral.rewardCredits > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Coins className="h-3 w-3" />
                        +{referral.rewardCredits} créditos
                      </div>
                    )}
                  </div>
                  
                  {referral.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      Primera compra: {format(new Date(referral.completedAt), "dd MMM yyyy", { locale: es })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}