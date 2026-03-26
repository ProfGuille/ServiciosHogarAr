import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
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
  const [coverageRadius, setCoverageRadius] = useState(10);
  const [savingCoverage, setSavingCoverage] = useState(false);
  const [coverageSaved, setCoverageSaved] = useState(false);

  const handleSaveCoverage = async () => {
    if (!providerId) return;
    setSavingCoverage(true);
    setCoverageSaved(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/providers/${providerId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ coverageRadiusKm: coverageRadius }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setCoverageSaved(true);
      setTimeout(() => setCoverageSaved(false), 3000);
    } catch {
      alert("Error al guardar la zona de cobertura");
    } finally {
      setSavingCoverage(false);
    }
  };

  const { user } = useAuth();
  const [, navigate] = useLocation();
  const providerId = (user as any)?.providerId ?? null;

  // Redirigir si no es proveedor
  if (user && user.userType !== "provider") {
    if (user.userType === "admin") navigate("/admin");
    else navigate("/");
    return null;
  }

  // Query: Créditos disponibles
  const { data: credits } = useQuery<Credits>({
    queryKey: ["provider-credits", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/provider-credits/${providerId}`);
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
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/service-requests/available?providerId=${providerId}`);
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
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/service-requests/unlocked?providerId=${providerId}`);
      if (!res.ok) throw new Error("Error al obtener leads desbloqueados");
      return res.json();
    }
  });

  // Query: Perfil del proveedor
  const { data: providerProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["provider-profile", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}`));
      if (!res.ok) throw new Error("Error al obtener perfil");
      return res.json();
    }
  });

  // Estado para edición de perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ businessName: "", description: "", hourlyRate: "", phone: "" });

  const handleEditProfile = () => {
    setProfileForm({
      businessName: providerProfile?.businessName || providerProfile?.business_name || "",
      description: providerProfile?.description || "",
      hourlyRate: providerProfile?.hourlyRate || providerProfile?.hourly_rate || "",
      phone: providerProfile?.phoneNumber || providerProfile?.phone_number || "",
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!providerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/providers/${providerId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessName: profileForm.businessName,
          businessDescription: profileForm.description,
          hourlyRate: profileForm.hourlyRate ? Number(profileForm.hourlyRate) : undefined,
          phone: profileForm.phone,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setEditingProfile(false);
      refetchProfile();
    } catch {
      alert("Error al guardar el perfil");
    }
  };

  // Mutation: Desbloquear lead
  const unlockMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const res = await fetch(`${getApiUrl()}/api/service-requests/${leadId}/unlock`, {
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
      {/* Header con créditos */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mi Panel</h1>
          <p className="text-muted-foreground">Gestioná tus solicitudes y configurá tu perfil</p>
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
            <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => window.location.href = '/comprar-creditos'}>
              Comprar créditos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">
            Nuevas solicitudes ({availableLeads?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            Mis solicitudes ({unlockedLeads?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="perfil">
            Mi Perfil
          </TabsTrigger>
        </TabsList>

        {/* Tab: Leads Disponibles */}
        <TabsContent value="available" className="space-y-4">
          {loadingAvailable ? (
            <div className="text-center py-12">Cargando solicitudes...</div>
          ) : availableLeads?.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay nuevas solicitudes en este momento
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
                      Desbloquear datos del cliente (1 crédito)
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
            <div className="text-center py-12">Cargando solicitudes...</div>
          ) : unlockedLeads?.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Todavía no desbloqueaste ninguna solicitud
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

        <TabsContent value="perfil" className="space-y-4">
          {/* Datos del negocio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Datos de tu negocio</CardTitle>
                <CardDescription>Información que ven los clientes en tu perfil público</CardDescription>
              </div>
              {!editingProfile && (
                <Button size="sm" variant="outline" onClick={handleEditProfile}>Editar</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Nombre del negocio</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={profileForm.businessName} onChange={e => setProfileForm({...profileForm, businessName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea className="w-full mt-1 px-3 py-2 border rounded-md text-sm" rows={3} value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tarifa por hora (ARS)</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" type="number" value={profileForm.hourlyRate} onChange={e => setProfileForm({...profileForm, hourlyRate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teléfono de contacto</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" onClick={handleSaveProfile}>Guardar cambios</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setEditingProfile(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre</span>
                    <span className="font-medium">{providerProfile?.businessName || providerProfile?.business_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descripción</span>
                    <span className="font-medium max-w-xs text-right">{providerProfile?.description || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarifa/hora</span>
                    <span className="font-medium">{providerProfile?.hourlyRate || providerProfile?.hourly_rate ? `$${providerProfile?.hourlyRate || providerProfile?.hourly_rate} ARS` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono</span>
                    <span className="font-medium">{providerProfile?.phoneNumber || providerProfile?.phone_number || "—"}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zona de cobertura */}
          <Card>
            <CardHeader>
              <CardTitle>Zona de cobertura</CardTitle>
              <CardDescription>Radio en el que ofrecés tus servicios. Se muestra en tu perfil público.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <input type="range" min={1} max={50} value={coverageRadius} onChange={(e) => setCoverageRadius(Number(e.target.value))} className="flex-1" />
                  <span className="text-sm font-semibold w-16 text-right">{coverageRadius} km</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 20, 30, 50].map(v => (
                    <Button key={v} size="sm" variant={coverageRadius === v ? "default" : "outline"} onClick={() => setCoverageRadius(v)}>{v} km</Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveCoverage} disabled={savingCoverage} className="w-full">
                {savingCoverage ? "Guardando..." : "Guardar zona de cobertura"}
              </Button>
              {coverageSaved && <p className="text-sm text-green-600 text-center">✓ Zona guardada correctamente</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desbloquear datos del cliente?</DialogTitle>
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
              {unlockMutation.isPending ? "Desbloqueando..." : "Confirmar desbloqueo (1 crédito)"}
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
    <Footer />
    </div>
  );
}
