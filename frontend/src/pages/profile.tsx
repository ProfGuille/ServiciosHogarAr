import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, MapPin, Calendar, Trophy, Gift } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders, fetchWithAuth } from "@/lib/auth";
import { LocationPicker } from "@/components/maps/LocationPicker";
import { AchievementGallery } from "@/components/achievements/achievement-gallery";
import { ReferralShareCard } from "@/components/referral/referral-share-card";
import { ReferralHistory } from "@/components/referral/referral-history";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
  });

  const providerId = (user as any)?.providerId ?? null;

  const { data: providerProfile, refetch: refetchProfile } = useQuery<any>({
    queryKey: ["provider-profile", providerId],
    enabled: !!providerId && (user as any)?.userType === "provider",
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}`));
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: providerStats } = useQuery<{ rating: number | null; totalReviews: number | null; isVerified: boolean }>({
    queryKey: ["provider-stats", providerId],
    enabled: !!providerId && (user as any)?.userType === "provider",
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/stats`));
      if (!res.ok) throw new Error("Error al obtener stats");
      return res.json();
    }
  });

  const { data: providerReviews } = useQuery<{ data: Array<{ id: number; rating: number; comment: string | null; created_at: string }>; total: number }>({
    queryKey: ["provider-reviews", providerId],
    enabled: !!providerId && (user as any)?.userType === "provider",
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/reviews`));
      if (!res.ok) throw new Error("Error al obtener reseñas");
      return res.json();
    }
  });

  const { data: providerCategories } = useQuery<Array<{ id: number; name: string; icon: string }>>({
    queryKey: ["provider-categories", providerId],
    enabled: !!providerId && (user as any)?.userType === "provider",
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/categories`));
      if (!res.ok) throw new Error("Error al obtener categorias");
      return res.json();
    }
  });

  const { data: locationData } = useQuery<{ lat: number; lng: number; address?: string } | null>({
    queryKey: ["provider-location", providerId],
    enabled: !!providerId && (user as any)?.userType === "provider",
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/location`), {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return res.json();
    }
  });

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

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ businessName: "", description: "", hourlyRate: "", phone: "", experienceYears: "" });
  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [coverageRadius, setCoverageRadius] = useState(10);
  const [savingCoverage, setSavingCoverage] = useState(false);
  const [coverageSaved, setCoverageSaved] = useState(false);
  const [verifForm, setVerifForm] = useState({ personType: "fisica", documentType: "DNI", documentNumber: "", legalRepresentative: "", consentGiven: false });
  const [verifError, setVerifError] = useState("");

  useEffect(() => {
    if (locationData && !providerLocation) {
      setProviderLocation({ lat: locationData.lat, lng: locationData.lng, address: locationData.address || "" });
    }
  }, [locationData]);

  useEffect(() => {
    if (providerProfile?.coverageRadiusKm) {
      setCoverageRadius(providerProfile.coverageRadiusKm);
    }
  }, [providerProfile]);

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

  const handleSaveLocation = async () => {
    if (!providerId || !providerLocation) return;
    setSavingLocation(true);
    setLocationSaved(false);
    try {
      const res = await fetchWithAuth(getApiUrl(`/api/providers/${providerId}/location`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify((() => {
          const street = (providerLocation as any).street;
          const suburb = (providerLocation as any).suburb;
          const state = (providerLocation as any).state;
          const cleanAddress = [street, suburb, state].filter(Boolean).join(', ');
          return {
            latitude: providerLocation.lat,
            longitude: providerLocation.lng,
            address: cleanAddress || providerLocation.address || null,
            city: (providerLocation as any).city || null,
            province: state || null,
          };
        })()),

      });
      if (res.ok) {
        setLocationSaved(true);
        queryClient.invalidateQueries({ queryKey: ["provider-location", providerId] });
        refetchProfile();
      }
    } catch (err) {
      console.error("Error guardando ubicacion:", err);
    } finally {
      setSavingLocation(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader><CardTitle>Acceso requerido</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Debes iniciar sesion para ver tu perfil.</p>
              <Button onClick={() => window.location.href = "/api/login"}>Iniciar sesion</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mi Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informacion Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 block">Nombre</label>
                    <p className="text-lg font-semibold">{user.firstName || "No especificado"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 block">Apellido</label>
                    <p className="text-lg font-semibold">{user.lastName || "No especificado"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Email</label>
                  </div>
                  <p className="text-lg pl-6">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                  </div>
                  <p className="text-lg pl-6">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "MMMM yyyy", { locale: es })
                      : "Fecha no disponible"}
                  </p>
                </div>
                {userProfile?.city && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium text-gray-500">Ubicacion</label>
                    </div>
                    <p className="text-lg pl-6">
                      {[userProfile.neighborhood, userProfile.city, userProfile.province].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Estado de la Cuenta</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 block">Tipo de usuario</label>
                  <Badge variant={user.userType === "provider" ? "default" : "secondary"}>
                    {user.userType === "provider" ? "Profesional" :
                     user.userType === "admin" ? "Administrador" : "Cliente"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 block">Estado</label>
                  <Badge variant="default">Activo</Badge>
                </div>
              </CardContent>
            </Card>

            {user.userType !== "admin" && (
              <Card>
                <CardHeader><CardTitle>Acciones Rapidas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {user.userType === "customer" && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/mis-solicitudes">Ver mis solicitudes</a>
                    </Button>
                  )}
                  {user.userType === "provider" && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/dashboard-profesional">Ver solicitudes</a>
                    </Button>
                  )}
                  {user.userType === "admin" && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin">Panel de Administracion</a>
                    </Button>
                  )}
                  <Button variant="destructive" className="w-full" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }}>
                    Cerrar sesion
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {user.userType === "provider" && (
          <div className="mt-8 space-y-6">

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Datos de tu negocio</CardTitle>
                  <CardDescription>Informacion que ven los clientes en tu perfil publico</CardDescription>
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
                      <label className="text-sm font-medium">Descripcion</label>
                      <textarea className="w-full mt-1 px-3 py-2 border rounded-md text-sm" rows={3} value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tarifa por hora (ARS)</label>
                      <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" type="number" value={profileForm.hourlyRate} onChange={e => setProfileForm({...profileForm, hourlyRate: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Anos de experiencia</label>
                      <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" type="number" min="0" max="50" value={profileForm.experienceYears} onChange={e => setProfileForm({...profileForm, experienceYears: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefono de contacto</label>
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
                      <span className="text-muted-foreground">Descripcion</span>
                      <span className="font-medium max-w-xs text-right">{providerProfile?.description || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tarifa/hora</span>
                      <span className="font-medium">{providerProfile?.hourlyRate || providerProfile?.hourly_rate ? `$${providerProfile?.hourlyRate || providerProfile?.hourly_rate} ARS` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experiencia</span>
                      <span className="font-medium">{providerProfile?.experienceYears || providerProfile?.experience_years ? `${providerProfile?.experienceYears || providerProfile?.experience_years} anos` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefono</span>
                      <span className="font-medium">{providerProfile?.phoneNumber || providerProfile?.phone_number || "—"}</span>
                    </div>
                    {locationData?.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Direccion</span>
                        <span className="font-medium max-w-xs text-right">{locationData.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tus categorias de servicio</CardTitle>
                <CardDescription>Rubros en los que ofrecés tus servicios</CardDescription>
              </CardHeader>
              <CardContent>
                {providerCategories && providerCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {providerCategories.map(cat => (
                      <Badge key={cat.id} variant="secondary" className="text-sm px-3 py-1">{cat.name}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tenes categorias registradas.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tu ubicacion</CardTitle>
                <CardDescription>Indica donde estas ubicado para que los clientes cercanos puedan encontrarte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LocationPicker
                  initialLocation={locationData ?? undefined}
                  onLocationSelect={(loc) => { setProviderLocation(loc); setLocationSaved(false); }}
                  height="250px"
                  showAddressSearch={true}
                  placeholder="Busca tu direccion..."
                />
                {providerLocation && (
                  <p className="text-xs text-muted-foreground">
                    {providerLocation.address || `${providerLocation.lat.toFixed(4)}, ${providerLocation.lng.toFixed(4)}`}
                  </p>
                )}
                <Button onClick={handleSaveLocation} disabled={savingLocation || !providerLocation} className="w-full">
                  {savingLocation ? "Guardando..." : "Guardar ubicacion"}
                </Button>
                {locationSaved && <p className="text-sm text-green-600 text-center">Ubicacion guardada correctamente</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zona de cobertura</CardTitle>
                <CardDescription>Radio en el que ofrecés tus servicios. Se muestra en tu perfil publico.</CardDescription>
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
                {coverageSaved && <p className="text-sm text-green-600 text-center">Zona guardada correctamente</p>}
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Verificacion de identidad</CardTitle>
                <CardDescription>Obtene el distintivo de proveedor verificado para generar mas confianza.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationData?.status === "approved" && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-700 font-medium">Identidad verificada</span>
                  </div>
                )}
                {verificationData?.status === "pending" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700 text-sm font-medium">Solicitud en revision</p>
                    <p className="text-amber-600 text-xs mt-1">Tu solicitud fue recibida y esta siendo revisada por nuestro equipo.</p>
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
                        <option value="fisica">Persona fisica</option>
                        <option value="juridica">Persona juridica (empresa)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{verifForm.personType === "fisica" ? "Numero de DNI" : "CUIT"}</label>
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
                        Acepto que ServiciosHogar.com.ar almacene mi numero de documento con fines de verificacion de identidad, conforme a la{" "}
                        <a href="/privacidad" className="underline text-blue-600" target="_blank" rel="noreferrer">Politica de Privacidad</a>.
                      </label>
                    </div>
                    {verifError && <p className="text-sm text-red-600">{verifError}</p>}
                    <Button
                      className="w-full"
                      disabled={!verifForm.documentNumber || !verifForm.consentGiven || submitVerificationMutation.isPending}
                      onClick={() => submitVerificationMutation.mutate(verifForm)}>
                      {submitVerificationMutation.isPending ? "Enviando..." : "Solicitar verificacion"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tu reputacion</CardTitle>
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
                        ? providerReviews!.data.length + " calificacion" + (providerReviews!.data.length !== 1 ? "es" : "") + " recibida" + (providerReviews!.data.length !== 1 ? "s" : "")
                        : "Sin calificaciones aun"}
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
                              <span key={i} className={i < r.rating ? "text-yellow-400" : "text-slate-200"}>star</span>
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
                  <p className="text-sm text-muted-foreground text-center py-2">Todavia no recibiste calificaciones.</p>
                ) : null}
              </CardContent>
            </Card>

          </div>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Programa de Referidos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReferralShareCard />
            <ReferralHistory />
          </div>
        </div>

        {user.userType === "provider" && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Mis Logros
            </h2>
            <Card>
              <CardContent className="p-0 pt-6">
                <AchievementGallery userId={user.id} />
              </CardContent>
            </Card>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
