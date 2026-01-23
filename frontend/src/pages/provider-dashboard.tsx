import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MapPin, AlertCircle, Phone, MessageCircle, Mail, CreditCard, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Lead {
  id: number;
  title: string;
  description?: string;
  descriptionPreview?: string;
  neighborhood: string;
  city: string;
  province: string;
  categoryId: number;
  categoryName: string;
  isUrgent: boolean;
  preferredDate: string | null;
  createdAt: string;
  status: string;
  customerFirstName?: string;
  customerPhone?: string;
  customerEmail?: string;
  preferredContactMethods?: string;
  unlockedAt?: string;
  creditsSpent?: number;
}

interface Credits {
  providerId: number;
  currentCredits: number;
  totalPurchased: number;
  totalSpent: number;
}

export default function ProviderDashboard() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("available");

  // Obtener providerId del usuario (temporalmente hardcodeado, debería venir de auth)
  const providerId = 4; // TODO: Obtener del contexto de autenticación

  // Query: Créditos disponibles
  const { data: credits } = useQuery<Credits>({
    queryKey: ["provider-credits", providerId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/provider-credits/${providerId}`);
      if (!res.ok) throw new Error("Error al obtener créditos");
      return res.json();
    }
  });

  // Query: Leads disponibles
  const { data: availableLeads, isLoading: loadingAvailable } = useQuery<{
    data: Lead[];
    total: number;
  }>({
    queryKey: ["available-leads", providerId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/service-requests/available?providerId=${providerId}`);
      if (!res.ok) throw new Error("Error al obtener leads");
      return res.json();
    }
  });

  // Query: Leads desbloqueados
  const { data: unlockedLeads, isLoading: loadingUnlocked } = useQuery<{
    data: Lead[];
    total: number;
  }>({
    queryKey: ["unlocked-leads", providerId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/service-requests/unlocked?providerId=${providerId}`);
      if (!res.ok) throw new Error("Error al obtener leads desbloqueados");
      return res.json();
    }
  });

  // Mutation: Desbloquear lead
  const unlockMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const res = await fetch(`http://localhost:3000/api/service-requests/${leadId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al desbloquear lead");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-leads"] });
      queryClient.invalidateQueries({ queryKey: ["unlocked-leads"] });
      queryClient.invalidateQueries({ queryKey: ["provider-credits"] });
      setShowUnlockDialog(false);
      setSelectedLead(null);
      // Cambiar automáticamente a la pestaña "Mis Leads"
      setActiveTab("unlocked");
    }
  });

  const handleUnlockClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowUnlockDialog(true);
  };

  const handleConfirmUnlock = () => {
    if (selectedLead) {
      unlockMutation.mutate(selectedLead.id);
    }
  };

  const getWhatsAppLink = (phone: string, leadTitle: string) => {
    const message = encodeURIComponent(`Hola! Vi tu solicitud de "${leadTitle}" en ServiciosHogar. Me gustaría enviarte un presupuesto.`);
    return `https://wa.me/54${phone.replace(/\D/g, "")}?text=${message}`;
  };

  const getTelegramLink = (phone: string) => {
    // Telegram usa el número sin el código de país en el username
    // O se puede usar el deep link directo si conocemos el username
    return `https://t.me/+54${phone.replace(/\D/g, "")}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header con créditos */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Proveedor</h1>
          <p className="text-muted-foreground">Gestiona tus leads y presupuestos</p>
        </div>
        <Card className="w-64">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Créditos Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credits?.currentCredits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {credits?.totalSpent || 0} usados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">
            Leads Disponibles ({availableLeads?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            Mis Leads ({unlockedLeads?.total || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Leads Disponibles */}
        <TabsContent value="available" className="space-y-4">
          {loadingAvailable ? (
            <div className="text-center py-12">Cargando leads...</div>
          ) : availableLeads?.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay leads disponibles en este momento
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableLeads?.data.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{lead.title}</CardTitle>
                      {lead.isUrgent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lead.neighborhood}, {lead.city}, {lead.province}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {lead.descriptionPreview}
                      </p>
                      <Badge variant="outline">{lead.categoryName}</Badge>
                    </div>

                    {lead.preferredDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(lead.preferredDate), "PPP", { locale: es })}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleUnlockClick(lead)}
                      disabled={!credits || credits.currentCredits < 1}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Desbloquear (1 crédito)
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Publicado {format(new Date(lead.createdAt), "PPP", { locale: es })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Mis Leads */}
        <TabsContent value="unlocked" className="space-y-4">
          {loadingUnlocked ? (
            <div className="text-center py-12">Cargando leads...</div>
          ) : unlockedLeads?.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No has desbloqueado ningún lead todavía
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {unlockedLeads?.data.map((lead) => (
                <Card key={lead.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{lead.title}</CardTitle>
                        <CardDescription>
                          Cliente: {lead.customerFirstName}
                        </CardDescription>
                      </div>
                      {lead.isUrgent && (
                        <Badge variant="destructive">Urgente</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Descripción:</h4>
                      <p className="text-sm text-muted-foreground">{lead.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {lead.neighborhood}, {lead.city}, {lead.province}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Datos de contacto:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {lead.customerPhone}
                        </div>
                        {lead.customerEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {lead.customerEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(getWhatsAppLink(lead.customerPhone!, lead.title), "_blank")}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => window.open(getTelegramLink(lead.customerPhone!), "_blank")}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Telegram
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      Desbloqueado {format(new Date(lead.unlockedAt!), "PPP 'a las' HH:mm", { locale: es })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desbloquear este lead?</DialogTitle>
            <DialogDescription>
              Se descontará 1 crédito de tu cuenta. Tendrás acceso a los datos completos del cliente.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-2 py-4">
              <h4 className="font-semibold">{selectedLead.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedLead.descriptionPreview}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {selectedLead.neighborhood}, {selectedLead.city}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmUnlock}
              disabled={unlockMutation.isPending}
            >
              {unlockMutation.isPending ? "Desbloqueando..." : "Confirmar (1 crédito)"}
            </Button>
          </DialogFooter>
          {unlockMutation.isError && (
            <p className="text-sm text-red-600 mt-2">
              {unlockMutation.error.message}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
