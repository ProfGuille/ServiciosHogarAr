import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders, fetchWithAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MapPin, AlertCircle, Star, Phone, MessageCircle, Mail, CreditCard, Send } from "lucide-react";
import { AchievementGallery } from "@/components/achievements/achievement-gallery";
import { ReferralShareCard } from "@/components/referral/referral-share-card";
import { LocationPicker } from "@/components/maps/LocationPicker";
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
  hasAccount?: boolean;
  isReferringClient?: boolean;
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


function ClientRatingSelector({ leadId, providerId, existingRating }: { leadId: number; providerId: number | null; existingRating?: string | null }) {
  const [selected, setSelected] = useState<string | null>(existingRating ?? null);
  const [saved, setSaved] = useState(!!existingRating);
  const { mutate, isPending } = useMutation({
    mutationFn: async (rating: string) => {
      const res = await fetch(getApiUrl("/api/achievements/client-ratings"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ providerId, serviceRequestId: leadId, rating }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Coverage save failed:", res.status, errBody);
        throw new Error(errBody.error || `Error ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => setSaved(true),
  });

  if (!providerId) return null;

  const options = [
    { value: "contact_made", label: "✅ Contacto real" },
    { value: "no_response", label: "⚠️ Sin respuesta" },
    { value: "invalid_request", label: "❌ Solicitud inválida" },
  ];

  return (
    <div className="pt-2 border-t">
      <p className="text-xs text-muted-foreground mb-2">¿Cómo resultó este contacto?</p>
      {saved ? (
        <p className="text-xs text-green-600 font-medium">Calificación guardada ✓</p>
      ) : (
        <div className="flex flex-col gap-1">
          {options.map((o) => (
            <button
              key={o.value}
              disabled={isPending}
              onClick={() => { setSelected(o.value); mutate(o.value); }}
              className={`text-xs px-2 py-1 rounded border transition-colors text-left ${
                selected === o.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProviderDashboard() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [coverageRadius, setCoverageRadius] = useState(10);
  const [savingCoverage, setSavingCoverage] = useState(false);
  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  const handleSaveLocation = async () => {
    if (!providerId || !providerLocation) return;
    setSavingLocation(true);
    setLocationSaved(false);
    try {
      const res = await fetchWithAuth(getApiUrl(`/api/providers/${providerId}/location`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: providerLocation.lat, longitude: providerLocation.lng }),
      });
      if (res.ok) setLocationSaved(true);
    } catch (err) {
      console.error("Error guardando ubicación:", err);
    } finally {
      setSavingLocation(false);
    }
  };
  const [coverageSaved, setCoverageSaved] = useState(false);
  const [verifForm, setVerifForm] = useState({ personType: "fisica", documentType: "DNI", documentNumber: "", legalRepresentative: "", consentGiven: false });
  const [verifError, setVerifError] = useState("");
  const handleSaveCoverage = async () => {
    if (!providerId) return;
    setSavingCoverage(true);
    setCoverageSaved(false);
    try {
      const res = await fetchWithAuth(getApiUrl(`/api/providers/${providerId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const providerId = (user as any)?.providerId ?? null;

  // Redirigir si no es proveedor
  useEffect(() => {
    if (user && user.userType !== "provider") {
      if (user.userType === "admin") navigate("/admin");
      else navigate("/");
    }
  }, [user]);

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


  // Query: Stats del proveedor
  const { data: providerStats } = useQuery<{ rating: number | null; totalReviews: number | null; isVerified: boolean }>({
    queryKey: ["provider-stats", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/stats`));
      if (!res.ok) throw new Error("Error al obtener stats");
      return res.json();
    }
  });
  // Query: Reseñas del proveedor
  const { data: providerReviews } = useQuery<{ data: Array<{ id: number; rating: number; comment: string | null; created_at: string }>; total: number }>({
    queryKey: ["provider-reviews", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/reviews`));
      if (!res.ok) throw new Error("Error al obtener reseñas");
      return res.json();
    }
  });
  // Query: Categorías del proveedor
  const { data: providerCategories } = useQuery<Array<{ id: number; name: string; icon: string }>>({
    queryKey: ["provider-categories", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/categories`));
      if (!res.ok) throw new Error("Error al obtener categorías");
      return res.json();
    }
  });
  // Query: Ubicación del proveedor
  const { data: locationData } = useQuery<{ lat: number; lng: number } | null>({
    queryKey: ["provider-location", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/location`), {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Sincronizar locationData con providerLocation si no hay selección manual
  useEffect(() => {
    if (locationData && !providerLocation) {
      setProviderLocation({ lat: locationData.lat, lng: locationData.lng, address: '' });
    }
  }, [locationData]);

  // Verificación de identidad
  const { data: verificationData } = useQuery({
    queryKey: ["/api/providers/verification"],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerProfile?.id}/verification`), {
        headers: getAuthHeaders()
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Error al obtener verificacion");
      return res.json();
    },
    enabled: !!providerProfile?.id,
  });

  const submitVerificationMutation = useMutation({
    mutationFn: async (data: typeof verifForm) => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/verification`), {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar solicitud");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers/verification"] });
      setVerifError("");
    },
    onError: (err: Error) => setVerifError(err.message),
  });

  // Estado para edición de perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ businessName: "", description: "", hourlyRate: "", phone: "", experienceYears: "" });

  const handleEditProfile = () => {
    setProfileForm({
      businessName: providerProfile?.businessName || providerProfile?.business_name || "",
      description: providerProfile?.description || "",
      hourlyRate: providerProfile?.hourlyRate || providerProfile?.hourly_rate || "",
      phone: providerProfile?.phoneNumber || providerProfile?.phone_number || "",
      experienceYears: String(providerProfile?.experienceYears || providerProfile?.experience_years || ""),
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!providerId) return;
    try {
      const res = await fetchWithAuth(getApiUrl(`/api/providers/${providerId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: profileForm.businessName,
          description: profileForm.description,
          hourlyRate: profileForm.hourlyRate ? Number(profileForm.hourlyRate) : undefined,
          ...(profileForm.phone !== "" ? { phoneNumber: profileForm.phone } : {}),
          ...(profileForm.experienceYears !== "" ? { experienceYears: Number(profileForm.experienceYears) } : {}),
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
    const waDigits = phone.replace(/\D/g, "").replace(/^54/, "");
    return `https://wa.me/54${waDigits}?text=${message}`;
  };

  const getTelegramLink = (phone: string) => {
    // Telegram usa el número sin el código de país en el username
    // O se puede usar el deep link directo si conocemos el username
    const tgDigits = phone.replace(/\D/g, "").replace(/^54/, "");
    return `https://t.me/+54${tgDigits}`;
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
            Perfil Profesional
          </TabsTrigger>
          <TabsTrigger value="logros">
            Mis Logros
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
                      <div className="flex gap-2">
                        {lead.isUrgent && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Urgente
                          </Badge>
                        )}
                        {!lead.hasAccount && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-400">Sin cuenta registrada</Badge>
                        )}
                        {lead.isReferringClient && (
                          <Badge variant="outline" className="text-amber-600 border-amber-400 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Cliente referente
                          </Badge>
                        )}
                      </div>
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
                      {!lead.hasAccount && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-400">Sin cuenta registrada</Badge>
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
                    <ClientRatingSelector leadId={lead.id} providerId={providerId} existingRating={lead.clientRating} />
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
                    <label className="text-sm font-medium">Años de experiencia</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" type="number" min="0" max="50" value={profileForm.experienceYears} onChange={e => setProfileForm({...profileForm, experienceYears: e.target.value})} />
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
                    <span className="text-muted-foreground">Experiencia</span>
                    <span className="font-medium">{providerProfile?.experienceYears || providerProfile?.experience_years ? `${providerProfile?.experienceYears || providerProfile?.experience_years} años` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono</span>
                    <span className="font-medium">{providerProfile?.phoneNumber || providerProfile?.phone_number || "—"}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle>Tu ubicación</CardTitle>
              <CardDescription>Indicá dónde estás ubicado para que los clientes cercanos puedan encontrarte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationPicker
                onLocationSelect={(loc) => { setProviderLocation(loc); setLocationSaved(false); }}
                height="250px"
                showAddressSearch={true}
                placeholder="Buscá tu dirección..."
              />
              {providerLocation && (
                <p className="text-xs text-muted-foreground">📍 {providerLocation.address || `${providerLocation.lat.toFixed(4)}, ${providerLocation.lng.toFixed(4)}`}</p>
              )}
              <Button onClick={handleSaveLocation} disabled={savingLocation || !providerLocation} className="w-full">
                {savingLocation ? "Guardando..." : "Guardar ubicación"}
              </Button>
              {locationSaved && <p className="text-sm text-green-600 text-center">✓ Ubicación guardada correctamente</p>}
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

          {/* Categorías registradas */}
          <Card>
            <CardHeader>
              <CardTitle>Tus categorías de servicio</CardTitle>
              <CardDescription>Rubros en los que ofrecés tus servicios</CardDescription>
            </CardHeader>
            <CardContent>
              {providerCategories && providerCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {providerCategories.map(cat => (
                    <Badge key={cat.id} variant="secondary" className="text-sm px-3 py-1">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tenés categorías registradas.</p>
              )}
            </CardContent>
          </Card>
          {/* Verificación de identidad */}
          <Card>
            <CardHeader>
              <CardTitle>Verificación de identidad</CardTitle>
              <CardDescription>Obtené el distintivo de proveedor verificado para generar más confianza.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationData?.status === "approved" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-700 font-medium">✓ Identidad verificada</span>
                </div>
              )}
              {verificationData?.status === "pending" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700 text-sm font-medium">Solicitud en revisión</p>
                  <p className="text-amber-600 text-xs mt-1">Tu solicitud fue recibida y está siendo revisada por nuestro equipo.</p>
                </div>
              )}
              {verificationData?.status === "rejected" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">Solicitud rechazada</p>
                  {verificationData.adminNotes && <p className="text-red-600 text-xs mt-1">{verificationData.adminNotes}</p>}
                </div>
              )}
              {(!verificationData || verificationData?.status === "rejected") && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Tipo de persona</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={verifForm.personType}
                      onChange={e => setVerifForm({...verifForm, personType: e.target.value, documentType: e.target.value === "fisica" ? "DNI" : "CUIT"})}>
                      <option value="fisica">Persona física</option>
                      <option value="juridica">Persona jurídica (empresa)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{verifForm.personType === "fisica" ? "Número de DNI" : "CUIT"}</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                      placeholder={verifForm.personType === "fisica" ? "Ej: 30123456" : "Ej: 20-30123456-7"}
                      value={verifForm.documentNumber}
                      onChange={e => setVerifForm({...verifForm, documentNumber: e.target.value})} />
                  </div>
                  {verifForm.personType === "juridica" && (
                    <div>
                      <label className="text-sm font-medium">Nombre del representante legal</label>
                      <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                        placeholder="Nombre y apellido"
                        value={verifForm.legalRepresentative}
                        onChange={e => setVerifForm({...verifForm, legalRepresentative: e.target.value})} />
                    </div>
                  )}
                  <div className="flex items-start gap-2 p-3 bg-slate-50 border rounded-lg">
                    <input type="checkbox" id="consent" className="mt-1"
                      checked={verifForm.consentGiven}
                      onChange={e => setVerifForm({...verifForm, consentGiven: e.target.checked})} />
                    <label htmlFor="consent" className="text-xs text-slate-600">
                      Acepto que ServiciosHogar.com.ar almacene mi número de documento con fines de verificación de identidad, conforme a la{" "}
                      <a href="/privacidad" className="underline text-blue-600" target="_blank">Política de Privacidad</a>.
                    </label>
                  </div>
                  {verifError && <p className="text-sm text-red-600">{verifError}</p>}
                  <Button
                    className="w-full"
                    disabled={!verifForm.documentNumber || !verifForm.consentGiven || submitVerificationMutation.isPending}
                    onClick={() => submitVerificationMutation.mutate(verifForm)}>
                    {submitVerificationMutation.isPending ? "Enviando..." : "Solicitar verificación"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reputación */}
          <Card>
            <CardHeader>
              <CardTitle>Tu reputación</CardTitle>
              <CardDescription>Calificaciones recibidas de clientes. No se muestra el nombre del cliente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providerStats ? (
                <div className="flex items-center gap-4 p-3 bg-slate-50 border rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">
                      {providerStats.rating ? (providerStats.rating / 10).toFixed(1) : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">sobre 5.0</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(providerReviews?.data?.length ?? 0) > 0
                      ? `${providerReviews!.data.length} calificación${providerReviews!.data.length !== 1 ? "es" : ""} recibida${providerReviews!.data.length !== 1 ? "s" : ""}`
                      : "Sin calificaciones aún"}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              )}
              {providerReviews && providerReviews.data.length > 0 ? (
                <div className="space-y-3">
                  {providerReviews.data.map((r) => (
                    <div key={r.id} className="border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < r.rating ? "text-yellow-400" : "text-slate-200"}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-slate-600 italic">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              ) : (providerReviews?.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">Todavía no recibiste calificaciones.</p>
              ) : null}
            </CardContent>
          </Card>
          <ReferralShareCard />
        </TabsContent>
        <TabsContent value="logros" className="space-y-4">
          {user?.id ? (
            <AchievementGallery userId={user.id} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">Cargando logros...</div>
          )}
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
