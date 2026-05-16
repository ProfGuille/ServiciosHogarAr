import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { ServiceCategory } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  Settings,
  FileText,
  BarChart3,
  Globe,
  Activity
} from "lucide-react";


function VerificationActions({ id, onReview }: { id: number; onReview: (args: { id: number; status: string; adminNotes: string }) => void }) {
  const [notes, setNotes] = useState("");
  return (
    <div className="space-y-2 pt-2 border-t">
      <textarea
        className="w-full px-3 py-2 border rounded-md text-sm"
        rows={2}
        placeholder="Nota para el proveedor (opcional para aprobar, recomendada para rechazar)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          onClick={() => onReview({ id, status: "approved", adminNotes: notes })}>
          Aprobar
        </button>
        <button
          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          onClick={() => onReview({ id, status: "rejected", adminNotes: notes })}>
          Rechazar
        </button>
      </div>
    </div>
  );
}


function PreciosTab() {
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [newPkg, setNewPkg] = useState({ nombre: "", creditos: "", precio: "", destacado: false });
  const { data: paquetes, refetch } = useQuery<any[]>({
    queryKey: ["admin-credit-packages"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/admin/credit-packages`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error al cargar paquetes");
      return res.json();
    },
  });

  const [editing, setEditing] = useState<Record<number, any>>({});

  const handleChange = (id: number, field: string, value: any) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (id: number) => {
    const changes = editing[id];
    if (!changes) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/credit-packages/${id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...changes,
          creditos: changes.creditos ? parseInt(changes.creditos) : undefined,
          precio: changes.precio ? parseInt(changes.precio) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast({ title: "Paquete actualizado" });
      setEditing(prev => { const n = {...prev}; delete n[id]; return n; });
      refetch();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleActivo = async (p: any) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/credit-packages/${p.id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      });
      if (!res.ok) throw new Error("Error");
      toast({ title: p.activo ? "Paquete ocultado" : "Paquete activado" });
      refetch();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`¿Eliminar el paquete "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/credit-packages/${p.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al eliminar");
      toast({ title: "Paquete eliminado" });
      refetch();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    const creditos = parseInt(newPkg.creditos);
    const precio = parseInt(newPkg.precio);
    if (!newPkg.nombre.trim() || isNaN(creditos) || creditos <= 0 || isNaN(precio) || precio <= 0) {
      toast({ title: "Error", description: "Completá todos los campos correctamente.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/credit-packages`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newPkg.nombre.trim(), creditos, precio, destacado: newPkg.destacado }),
      });
      if (!res.ok) throw new Error("Error al crear");
      toast({ title: "Paquete creado" });
      setNewPkg({ nombre: "", creditos: "", precio: "", destacado: false });
      setShowNew(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Paquetes de créditos</CardTitle>
        <Button size="sm" onClick={() => setShowNew(v => !v)}>
          {showNew ? "Cancelar" : "Nuevo paquete"}
        </Button>
      </CardHeader>
      <CardContent>
        {showNew && (
          <div className="border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-slate-50">
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input value={newPkg.nombre} onChange={e => setNewPkg(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Premium" />
            </div>
            <div>
              <Label className="text-xs">Créditos</Label>
              <Input type="number" min={1} value={newPkg.creditos} onChange={e => setNewPkg(p => ({ ...p, creditos: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Precio (ARS)</Label>
              <Input type="number" min={1} value={newPkg.precio} onChange={e => setNewPkg(p => ({ ...p, precio: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Destacado</Label>
              <input type="checkbox" checked={newPkg.destacado} className="h-5 w-5 mt-1" onChange={e => setNewPkg(p => ({ ...p, destacado: e.target.checked }))} />
            </div>
            <Button size="sm" onClick={handleCreate}>Crear</Button>
          </div>
        )}
        <div className="space-y-4">
          {(paquetes || []).map((p: any) => (
            <div key={p.id} className={`border rounded-lg p-4 grid grid-cols-2 md:grid-cols-6 gap-3 items-end ${!p.activo ? "opacity-50" : ""}`}>
              <div>
                <Label className="text-xs">Nombre</Label>
                <Input
                  defaultValue={p.nombre}
                  onChange={e => handleChange(p.id, "nombre", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Créditos</Label>
                <Input
                  type="number"
                  defaultValue={p.creditos}
                  min={1}
                  onChange={e => handleChange(p.id, "creditos", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Precio (ARS)</Label>
                <Input
                  type="number"
                  defaultValue={p.precio}
                  min={1}
                  onChange={e => handleChange(p.id, "precio", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Destacado</Label>
                <input
                  type="checkbox"
                  defaultChecked={p.destacado}
                  className="h-5 w-5 mt-1"
                  onChange={e => handleChange(p.id, "destacado", e.target.checked)}
                />
              </div>
              <Button size="sm" disabled={!editing[p.id]} onClick={() => handleSave(p.id)}>
                Guardar
              </Button>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleToggleActivo(p)}>
                  {p.activo ? "Ocultar" : "Activar"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(p)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Los cambios se reflejan inmediatamente en la página /precios.
        </p>
      </CardContent>
    </Card>
  );
}

function ContactosTab() {
  const { data, isLoading } = useQuery<{ data: any[]; total: number }>({
    queryKey: ["/api/admin/client-ratings"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/client-ratings"), {
        headers: getAuthHeaders() as Record<string, string>,
      });
      if (!res.ok) throw new Error("Error al obtener marcas");
      return res.json();
    },
  });
  const label: Record<string, string> = {
    contact_made: "✅ Contacto realizado",
    no_response: "⚠️ Sin respuesta",
    invalid_request: "❌ Solicitud inválida",
  };
  if (isLoading) return <div className="text-center py-12">Cargando...</div>;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Marcas de contacto</CardTitle>
          <CardDescription>Estado de contacto registrado por proveedores ({data?.total ?? 0} registros)</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.data?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin registros aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Proveedor</th>
                    <th className="pb-2 pr-4">Solicitud</th>
                    <th className="pb-2 pr-4">Marca</th>
                    <th className="pb-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{r.provider_name || `#${r.provider_id}`}</td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-xs truncate">{r.request_title || `#${r.request_id}`}</td>
                      <td className="py-2 pr-4">{label[r.rating] ?? r.rating}</td>
                      <td className="py-2 text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit", month: "short", year: "numeric",
                          timeZone: "America/Argentina/Buenos_Aires"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogrosTab() {
  const { data: achievements, isLoading } = useQuery<any[]>({
    queryKey: ["/api/achievements"],
  });

  if (isLoading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logros disponibles</CardTitle>
          <CardDescription>Todos los logros del sistema y sus condiciones</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 pr-4">Nombre</th>
                <th className="pb-2 pr-4">Categoría</th>
                <th className="pb-2 pr-4">Puntos</th>
                <th className="pb-2 pr-4">Rareza</th>
                <th className="pb-2 pr-4">Condición</th>
                <th className="pb-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {(achievements || []).map((a: any) => (
                <tr key={a.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 pr-4 font-medium">{a.name}</td>
                  <td className="py-2 pr-4">{({"provider":"Actividad","reputation":"Reputación","customer":"Cliente","platform":"Plataforma","special":"Especial"})[a.category] ?? a.category}</td>
                  <td className="py-2 pr-4">{a.points ?? 0} pts</td>
                  <td className="py-2 pr-4">{({"common":"Común","uncommon":"Poco común","rare":"Raro","epic":"Épico","legendary":"Legendario"})[a.rarity] ?? a.rarity ?? "—"}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{({"unlocks_total":"Desbloqueos totales","unlocks_30days":"Desbloqueos últimos 30 días","identity_verified":"Identidad verificada","rating_min":"Rating mínimo","months_active":"Meses activo","profile_complete":"Perfil completo","top_zone":"Top de su zona"})[a.condition_type] ?? a.condition_type ?? "—"}</td>
                  <td className="py-2">{a.condition_value ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);

  const { data: verificationsData, refetch: refetchVerifications } = useQuery({
    queryKey: ["/api/admin/identity-reviews"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/identity-reviews"), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error al obtener verificaciones");
      return res.json();
    },
  });
  const { data: usersData } = useQuery<{ users: any[] }>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/users"), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      return res.json();
    },
    enabled: activeTab === "usuarios",
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });
  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/settings"), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });
  const [analyticsDateInput, setAnalyticsDateInput] = useState<string>("");
  const [marketplaceDateInput, setMarketplaceDateInput] = useState<string>("");

  useEffect(() => {
    if (settingsData?.marketplaceStartDate) {
      setMarketplaceDateInput(String(settingsData.marketplaceStartDate).split("T")[0]);
    }
  }, [settingsData?.marketplaceStartDate]);

  // Sincronizar input con valor guardado en DB al cargar o re-autenticar
  useEffect(() => {
    if (settingsData?.marketplaceStartDate) {
      setMarketplaceDateInput(String(settingsData.marketplaceStartDate).split("T")[0]);
    }
  }, [settingsData?.marketplaceStartDate]);
  const handleSaveMarketplaceDate = async (date: string | null) => {
    await fetch(getApiUrl("/api/admin/settings"), {
      method: "PATCH",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ marketplaceStartDate: date }),
    });
    refetchSettings();
  };
  const handleSaveAnalyticsDate = async (date: string | null) => {
    await fetch(getApiUrl("/api/admin/settings"), {
      method: "PATCH",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ analyticsStartDate: date }),
    });
    refetchSettings();
    queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
  };
  const { data: profileChanges } = useQuery({
    queryKey: ["/api/admin/profile-changes"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/profile-changes"), { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error al cargar auditoría");
      return res.json();
    },
  });

  const reviewVerificationMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes: string }) => {
      const res = await fetch(getApiUrl(`/api/admin/identity-reviews/${id}`), {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes })
      });
      if (!res.ok) throw new Error("Error al revisar verificacion");
      return res.json();
    },
    onSuccess: () => {
      refetchVerifications();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
    }
  });

  const verifyProviderMutation = useMutation({
    mutationFn: async (providerId: number) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/admin/providers/${providerId}/verify`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isVerified ? "Proveedor verificado" : "Verificacion removida",
        description: data.isVerified ? "El profesional fue verificado exitosamente." : "Se removio la verificacion.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      if (selectedProvider) setSelectedProvider((prev: any) => ({ ...prev, isVerified: data.isVerified }));
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo verificar el proveedor.", variant: "destructive" });
    },
  });

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);


    const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const handleVerRequestDetail = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/admin/requests/${requestId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedRequest(data);
      setRequestDialogOpen(true);
    } catch {
      toast({ title: "Error", description: "No se pudo cargar la solicitud.", variant: "destructive" });
    }
  };

  const handleVerProviderProfile = async (providerId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/admin/providers/${providerId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedProvider(data);
      setProviderDialogOpen(true);
    } catch {
      toast({ title: "Error", description: "No se pudo cargar el perfil.", variant: "destructive" });
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.userType !== 'admin')) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden acceder a esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: dashboardSummary, refetch: refetchRequests } = useQuery({
    queryKey: ["/api/admin/dashboard-summary"],
    enabled: !!user && user.userType === 'admin',
  });

  const platformStats = (dashboardSummary as any)?.stats;
  const recentProviders = (dashboardSummary as any)?.providers;
  const recentRequests = (dashboardSummary as any)?.requests;
  const metrics = (dashboardSummary as any)?.metrics;
  const recentActivity = (dashboardSummary as any)?.activity;



  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user && user.userType === 'admin',
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; icon?: string }) => {
      const res = await fetch(getApiUrl("/api/admin/categories"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado exitosamente.",
      });
      setShowCategoryForm(false);
      refetchCategories();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; isActive?: boolean; name?: string; description?: string }) => {
      const res = await fetch(getApiUrl(`/api/admin/categories/${id}`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado exitosamente.",
      });
      refetchCategories();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(getApiUrl(`/api/admin/categories/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al eliminar");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado exitosamente.",
      });
      refetchCategories();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
    return null; // Will redirect
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const },
      in_progress: { label: "En progreso", variant: "default" as const },
      completed: { label: "Completado", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Panel de Administración
              </h1>
              <p className="text-lg text-slate-600">
                Gestión y supervisión de la plataforma ServiciosHogar
              </p>
            </div>
            
            <div className="flex gap-3">
              <a href="/perfil">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mi Perfil
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Usuarios totales</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-green-600">+12% este mes</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Profesionales activos</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalProviders || 0}
                  </p>
                  <p className="text-xs text-green-600">+8% este mes</p>
                </div>
                <Briefcase className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Solicitudes totales</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalRequests || 0}
                  </p>
                  <p className="text-xs text-green-600">+25% este mes</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Trabajos completados</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {platformStats?.totalCompletedJobs || 0}
                  </p>
                  <p className="text-xs text-green-600">+18% este mes</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="flex flex-wrap w-full gap-1">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="providers">Profesionales</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="verifications">Verificaciones</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
            <TabsTrigger value="precios">Precios</TabsTrigger>
            <TabsTrigger value="logros">Logros</TabsTrigger>
            <TabsTrigger value="contactos">Verificación de Clientes</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity && recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${item.type === "provider" ? "bg-green-500" : item.type === "review" ? "bg-yellow-500" : item.type === "purchase" ? "bg-purple-500" : "bg-blue-500"}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.type === "provider" ? "Nuevo profesional: " : item.type === "review" ? "Nueva reseña: " : item.type === "purchase" ? "Compra: " : "Nueva solicitud: "}
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 text-center py-4">Sin actividad reciente</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas clave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Profesionales verificados</span>
                        <span className="text-sm font-bold">{metrics?.verifiedCount ?? "—"} / {metrics?.totalProviders ?? "—"} ({metrics?.verifiedPercent ?? "—"}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics?.verifiedPercent ?? 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Solicitudes convertidas</span>
                        <span className="text-sm font-bold">{metrics?.convertedRequests ?? "—"} / {metrics?.totalRequests ?? "—"} ({metrics?.conversionPercent ?? "—"}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics?.conversionPercent ?? 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Solicitudes urgentes</span>
                        <span className="text-sm font-bold">{metrics?.urgentCount ?? "—"} / {metrics?.totalRequests ?? "—"} ({metrics?.urgentPercent ?? "—"}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${metrics?.urgentPercent ?? 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Solicitudes activas</span>
                        <span className="text-sm font-bold">{metrics?.activeCount ?? "—"} / {metrics?.totalRequests ?? "—"} ({metrics?.activePercent ?? "—"}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${metrics?.activePercent ?? 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Profesionales pendientes de verificación
                </CardTitle>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                {recentProviders && recentProviders.length > 0 ? (
                  <div className="space-y-4">
                    {recentProviders.map((provider) => (
                      <div key={provider.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                              {provider.businessName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {provider.businessName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-3 w-3" />
                                {provider.city}, {provider.province}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {provider.experienceYears} años experiencia
                                </Badge>
                                {!provider.isVerified && (
                                  <Badge variant="secondary" className="text-xs text-orange-600">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Pendiente verificación
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleVerProviderProfile(provider.id)}>
                              Ver perfil
                            </Button>
                            <Button
                              size="sm"
                              variant={provider.isVerified ? "outline" : "default"}
                              onClick={() => verifyProviderMutation.mutate(provider.id)}
                              disabled={verifyProviderMutation.isPending}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              {provider.isVerified ? "Quitar verificacion" : "Verificar"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay verificaciones pendientes
                    </h3>
                    <p className="text-slate-600">
                      Todos los profesionales están verificados.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Solicitudes recientes
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchRequests()}>
                    Actualizar
                  </Button>

                </div>
              </CardHeader>
              <CardContent>
                {recentRequests && recentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recentRequests.slice(0, 10).map((request) => {
                      const statusConfig = getStatusBadge(request.status);
                      
                      return (
                        <div key={request.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">
                                {request.title}
                              </h3>
                              <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {request.city}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(request.createdAt).toLocaleDateString('es-AR')}
                                </div>

                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                              {request.isUrgent && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Urgente
                                </Badge>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleVerRequestDetail(request.id)}>
                                Ver detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay solicitudes
                    </h3>
                    <p className="text-slate-600">
                      No se han recibido solicitudes recientemente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Categorías de servicios
                </CardTitle>
                <Button onClick={() => setShowCategoryForm(true)}>
                  Agregar categoría
                </Button>
              </CardHeader>
              <CardContent>
                {categories && categories.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {category.name}
                          </h3>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-slate-600 mb-3">
                            {category.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category);
                              setShowCategoryForm(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCategoryMutation.mutate({ 
                              id: category.id, 
                              isActive: !category.isActive 
                            })}
                          >
                            {category.isActive ? "Desactivar" : "Activar"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) {
                                deleteCategoryMutation.mutate(category.id);
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No hay categorías
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Comienza creando las primeras categorías de servicios.
                    </p>
                    <Button>
                      Crear primera categoría
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">Filtros de fecha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-1">Marketplace (proveedores)</p>
                    <p className="text-xs text-slate-500 mb-2">Las solicitudes anteriores a esta fecha no serán visibles para los proveedores.</p>
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          {settingsData?.marketplaceStartDate
                            ? `Desde: ${settingsData.marketplaceStartDate}`
                            : "Todas las solicitudes"}
                        </p>
                        <input
                          type="date"
                          className="border rounded px-2 py-1 text-sm"
                          value={marketplaceDateInput}
                          onChange={e => setMarketplaceDateInput(e.target.value)}
                        />
                      </div>
                      <Button size="sm" onClick={() => { if (marketplaceDateInput) handleSaveMarketplaceDate(marketplaceDateInput); }}>
                        Guardar
                      </Button>
                      {settingsData?.marketplaceStartDate && (
                        <Button size="sm" variant="outline" onClick={() => { setMarketplaceDateInput(""); handleSaveMarketplaceDate(null); }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Analíticas</p>
                    <p className="text-xs text-slate-500 mb-2">Rango de fechas para los gráficos y métricas.</p>
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          {settingsData?.analyticsStartDate
                            ? `Desde: ${settingsData.analyticsStartDate}`
                            : "Todos los datos"}
                        </p>
                        <input
                          type="date"
                          className="border rounded px-2 py-1 text-sm"
                          value={analyticsDateInput}
                          onChange={e => setAnalyticsDateInput(e.target.value)}
                        />
                      </div>
                      <Button size="sm" onClick={() => { if (analyticsDateInput) handleSaveAnalyticsDate(analyticsDateInput); }}>
                        Guardar
                      </Button>
                      {settingsData?.analyticsStartDate && (
                        <Button size="sm" variant="outline" onClick={() => { setAnalyticsDateInput(""); handleSaveAnalyticsDate(null); }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuarios este mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {analyticsData?.users?.thisMonth ?? "—"}
                      </div>
                      <p className="text-slate-600 text-sm">Nuevos usuarios este mes</p>
                      {analyticsData?.users?.delta !== undefined && (
                        <p className={`text-xs mt-1 font-medium ${analyticsData.users.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {analyticsData.users.delta >= 0 ? "▲" : "▼"} {Math.abs(analyticsData.users.delta)}% vs mes anterior
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 mb-1">
                          {analyticsData?.users?.lastMonth ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Mes anterior</p>
                      </div>
                      <div className="text-center p-4 bg-slate-100 rounded-lg">
                        <div className="text-xl font-bold text-slate-700 mb-1">
                          {analyticsData?.users?.total ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Total acumulado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Profesionales este mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {analyticsData?.providers?.thisMonth ?? "—"}
                      </div>
                      <p className="text-slate-600 text-sm">Nuevos profesionales este mes</p>
                      {analyticsData?.providers?.delta !== undefined && (
                        <p className={`text-xs mt-1 font-medium ${analyticsData.providers.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {analyticsData.providers.delta >= 0 ? "▲" : "▼"} {Math.abs(analyticsData.providers.delta)}% vs mes anterior
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600 mb-1">
                          {analyticsData?.providers?.lastMonth ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Mes anterior</p>
                      </div>
                      <div className="text-center p-4 bg-slate-100 rounded-lg">
                        <div className="text-xl font-bold text-slate-700 mb-1">
                          {analyticsData?.providers?.total ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Total acumulado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Solicitudes este mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {analyticsData?.requests?.thisMonth ?? "—"}
                      </div>
                      <p className="text-slate-600 text-sm">Solicitudes creadas este mes</p>
                      {analyticsData?.requests?.delta !== undefined && (
                        <p className={`text-xs mt-1 font-medium ${analyticsData.requests.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {analyticsData.requests.delta >= 0 ? "▲" : "▼"} {Math.abs(analyticsData.requests.delta)}% vs mes anterior
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600 mb-1">
                          {analyticsData?.requests?.lastMonth ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Mes anterior</p>
                      </div>
                      <div className="text-center p-4 bg-slate-100 rounded-lg">
                        <div className="text-xl font-bold text-slate-700 mb-1">
                          {analyticsData?.requests?.total ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Total acumulado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Desbloqueos este mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {analyticsData?.unlocks?.thisMonth ?? "—"}
                      </div>
                      <p className="text-slate-600 text-sm">Datos desbloqueados este mes</p>
                      {analyticsData?.unlocks?.delta !== undefined && (
                        <p className={`text-xs mt-1 font-medium ${analyticsData.unlocks.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {analyticsData.unlocks.delta >= 0 ? "▲" : "▼"} {Math.abs(analyticsData.unlocks.delta)}% vs mes anterior
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600 mb-1">
                          {analyticsData?.unlocks?.lastMonth ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Mes anterior</p>
                      </div>
                      <div className="text-center p-4 bg-slate-100 rounded-lg">
                        <div className="text-xl font-bold text-slate-700 mb-1">
                          {analyticsData?.unlocks?.total ?? "—"}
                        </div>
                        <p className="text-xs text-slate-600">Total acumulado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verifications">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Solicitudes de verificación de identidad</h2>
              {!verificationsData || verificationsData.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-slate-500">No hay solicitudes de verificación</CardContent></Card>
              ) : (
                verificationsData.map((v: any) => (
                  <Card key={v.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold">{v.businessName || `${v.firstName} ${v.lastName}`}</p>
                          <p className="text-sm text-slate-500">{v.email}</p>
                          <p className="text-sm">{v.personType === "fisica" ? "Persona física" : "Persona jurídica"} — {v.documentType} {v.documentNumber}</p>
                          {v.legalRepresentative && <p className="text-sm">Representante: {v.legalRepresentative}</p>}
                          <p className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}</p>
                          {v.adminNotes && <p className="text-sm text-slate-600 mt-1"><strong>Nota:</strong> {v.adminNotes}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[140px]">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${v.status === "approved" ? "bg-green-100 text-green-700" : v.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {v.status === "approved" ? "Aprobado" : v.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                          {v.status === "pending" && (
                            <VerificationActions id={v.id} onReview={(args) => reviewVerificationMutation.mutate(args)} />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="auditoria">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Auditoría de cambios de perfil</h2>
              {!profileChanges || !Array.isArray(profileChanges) || profileChanges.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-slate-500">No hay cambios registrados</CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-slate-600">Profesional</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-600">Campo</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-600">Valor anterior</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-600">Valor nuevo</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-600">Modificado por</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-600">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {profileChanges.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{c.business_name || `${c.provider_first} ${c.provider_last}`}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{({"businessName":"Nombre comercial","description":"Descripción","phoneNumber":"Teléfono","hourlyRate":"Tarifa/hora","experienceYears":"Años exp.","city":"Ciudad","province":"Provincia","coverageRadiusKm":"Radio cobertura"})[c.field_name] ?? c.field_name}</td>
                            <td className="px-4 py-3 text-red-600 max-w-[160px] truncate">{c.old_value ?? "—"}</td>
                            <td className="px-4 py-3 text-green-700 max-w-[160px] truncate">{c.new_value ?? "—"}</td>
                            <td className="px-4 py-3">{c.changed_by_first ? `${c.changed_by_first} ${c.changed_by_last}` : "—"}</td>
                            <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{new Date(c.changed_at).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="precios">
            {activeTab === "precios" && <PreciosTab />}
          </TabsContent>
          <TabsContent value="logros">
            {activeTab === "logros" && <LogrosTab />}
          </TabsContent>
          <TabsContent value="contactos">
            {activeTab === "contactos" && <ContactosTab />}
          </TabsContent>

          <TabsContent value="usuarios">
            {activeTab === "usuarios" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-2xl font-bold">{usersData?.users?.length ?? "—"}</p>
                      <p className="text-sm text-slate-500 mt-1">Usuarios registrados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-2xl font-bold">
                        {usersData?.users?.filter((u: any) => u.marketingConsent).length ?? "—"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Con consentimiento de marketing</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
                            <th className="text-left p-3 font-medium text-slate-600">Email</th>
                            <th className="text-left p-3 font-medium text-slate-600">Registro</th>
                            <th className="text-left p-3 font-medium text-slate-600">Marketing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData?.users?.map((u: any) => (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                              <td className="p-3">{u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : "—"}</td>
                              <td className="p-3 text-slate-600">{u.email}</td>
                              <td className="p-3 text-slate-500">
                                {new Date(u.createdAt).toLocaleDateString("es-AR")}
                              </td>
                              <td className="p-3">
                                {u.marketingConsent
                                  ? <span className="text-green-600 font-medium">Sí</span>
                                  : <span className="text-slate-400">No</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedRequest?.title}
            </DialogTitle>
            <DialogDescription>Detalle completo de la solicitud</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 block">Cliente</span>
                  <span className="font-medium">{selectedRequest.customerFirstName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-medium">{selectedRequest.customerEmail || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Telefono</span>
                  <span className="font-medium">{selectedRequest.customerPhone || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Categoria</span>
                  <span className="font-medium">{selectedRequest.categoryName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ubicacion</span>
                  <span className="font-medium">{selectedRequest.city}{selectedRequest.neighborhood ? `, ${selectedRequest.neighborhood}` : ""}, {selectedRequest.province}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado</span>
                  <div className="flex items-center gap-2">
                    {(() => { const s = getStatusBadge(selectedRequest.status); return <Badge variant={s.variant}>{s.label}</Badge>; })()}
                    <select
                      className="text-xs border rounded px-2 py-1"
                      value={selectedRequest.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        await fetch(getApiUrl(`/api/admin/requests/${selectedRequest.id}/status`), {
                          method: "PATCH",
                          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                          body: JSON.stringify({ status: newStatus })
                        });
                        refetchRequests();
                      }}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Fecha preferida</span>
                  <span className="font-medium">{selectedRequest.preferredDate ? new Date(selectedRequest.preferredDate).toLocaleDateString("es-AR") : "—"}</span>
                </div>
                {selectedRequest.isUrgent && (
                  <div className="col-span-2">
                    <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Urgente</Badge>
                  </div>
                )}
              </div>
              {selectedRequest.description && (
                <div>
                  <span className="text-slate-500 block text-sm mb-1">Descripcion</span>
                  <p className="text-sm border rounded p-2 bg-slate-50">{selectedRequest.description}</p>
                </div>
              )}
              {selectedRequest.customerNotes && (
                <div>
                  <span className="text-slate-500 block text-sm mb-1">Notas del cliente</span>
                  <p className="text-sm border rounded p-2 bg-slate-50">{selectedRequest.customerNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provider Profile Dialog */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {selectedProvider?.businessName}
            </DialogTitle>
            <DialogDescription>Perfil completo del profesional</DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 block">Nombre</span>
                  <span className="font-medium">{selectedProvider.firstName} {selectedProvider.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-medium">{selectedProvider.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Telefono</span>
                  <span className="font-medium">{selectedProvider.phoneNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ubicacion</span>
                  <span className="font-medium">{selectedProvider.city}, {selectedProvider.province}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Experiencia</span>
                  <span className="font-medium">{selectedProvider.experienceYears} anos</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tarifa/hora</span>
                  <span className="font-medium">{selectedProvider.hourlyRate ? `$${Number(selectedProvider.hourlyRate).toLocaleString("es-AR")}` : "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado</span>
                  <Badge variant={selectedProvider.isVerified ? "default" : "secondary"}>
                    {selectedProvider.isVerified ? "Verificado" : "Sin verificar"}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500 block">Registro</span>
                  <span className="font-medium">{new Date(selectedProvider.createdAt).toLocaleDateString("es-AR")}</span>
                </div>
              </div>
              {selectedProvider.description && (
                <div>
                  <span className="text-slate-500 block text-sm mb-1">Descripcion</span>
                  <p className="text-sm border rounded p-2 bg-slate-50">{selectedProvider.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProviderDialogOpen(false)}>Cerrar</Button>
            <Button
              variant={selectedProvider?.isVerified ? "outline" : "default"}
              onClick={() => selectedProvider && verifyProviderMutation.mutate(selectedProvider.id)}
              disabled={verifyProviderMutation.isPending}
            >
              <Shield className="h-4 w-4 mr-1" />
              {selectedProvider?.isVerified ? "Quitar verificacion" : "Verificar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Modifica los detalles de la categoría."
                : "Crea una nueva categoría de servicio para la plataforma."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                icon: formData.get("icon") as string,
              };
              
              if (editingCategory) {
                updateCategoryMutation.mutate({ id: editingCategory.id, ...data });
              } else {
                createCategoryMutation.mutate(data);
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCategory?.name || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCategory?.description || ""}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Icono
                </Label>
                <Input
                  id="icon"
                  name="icon"
                  defaultValue={editingCategory?.icon || ""}
                  className="col-span-3"
                  placeholder="ej: wrench, hammer, paint-roller"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {editingCategory ? "Guardar cambios" : "Crear categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
