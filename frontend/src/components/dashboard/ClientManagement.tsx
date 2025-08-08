import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users,
  Search,
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  MessageCircle,
  UserPlus,
  Heart,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  lastBooking: string;
  firstBooking: string;
  isVip: boolean;
  notes: string;
  preferredServices: string[];
  loyaltyPoints: number;
  status: 'active' | 'inactive' | 'vip';
}

interface BookingHistory {
  id: number;
  date: string;
  serviceName: string;
  price: number;
  status: 'completed' | 'cancelled' | 'pending';
  rating?: number;
  review?: string;
}

interface ClientDetails {
  client: Client;
  bookingHistory: BookingHistory[];
  totalRevenue: number;
  averageBookingValue: number;
  bookingFrequency: string;
}

const getStatusColor = (status: Client['status']) => {
  switch (status) {
    case 'vip': return 'bg-yellow-100 text-yellow-800';
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Client['status']) => {
  switch (status) {
    case 'vip': return <Heart className="h-4 w-4" />;
    case 'active': return <Users className="h-4 w-4" />;
    case 'inactive': return <Users className="h-4 w-4 opacity-50" />;
    default: return <Users className="h-4 w-4" />;
  }
};

export default function ClientManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['provider-clients', searchTerm, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`/api/provider/clients?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar clientes');
      return response.json();
    }
  });

  // Fetch client details
  const { data: clientDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['client-details', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return null;
      const response = await fetch(`/api/provider/clients/${selectedClient.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar detalles del cliente');
      return response.json();
    },
    enabled: !!selectedClient
  });

  // Update client notes mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, notes, isVip }: { clientId: number; notes: string; isVip: boolean }) => {
      const response = await fetch(`/api/provider/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes, isVip })
      });
      if (!response.ok) throw new Error('Error al actualizar cliente');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-details'] });
      toast({
        title: "Éxito",
        description: "Cliente actualizado correctamente"
      });
    }
  });

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'vip' && client.isVip) ||
                      (selectedTab === 'frequent' && client.totalBookings >= 5) ||
                      (selectedTab === 'recent' && new Date(client.lastBooking) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const clientStats = {
    total: clients.length,
    vip: clients.filter((c: Client) => c.isVip).length,
    frequent: clients.filter((c: Client) => c.totalBookings >= 5).length,
    recent: clients.filter((c: Client) => new Date(c.lastBooking) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>
                Administra tu base de clientes y mantén un seguimiento de su historial
              </CardDescription>
            </div>
            <Button onClick={() => setIsClientDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Cliente Manual
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{clientStats.total}</p>
                <p className="text-sm text-gray-600">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{clientStats.vip}</p>
                <p className="text-sm text-gray-600">Clientes VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{clientStats.frequent}</p>
                <p className="text-sm text-gray-600">Frecuentes (5+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{clientStats.recent}</p>
                <p className="text-sm text-gray-600">Activos (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({clientStats.total})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({clientStats.vip})</TabsTrigger>
          <TabsTrigger value="frequent">Frecuentes ({clientStats.frequent})</TabsTrigger>
          <TabsTrigger value="recent">Recientes ({clientStats.recent})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No se encontraron clientes
                  </h3>
                  <p className="text-gray-500">
                    Ajusta los filtros o espera a que lleguen más clientes
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredClients.map((client: Client) => (
                    <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              <Badge className={getStatusColor(client.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(client.status)}
                                  {client.status.toUpperCase()}
                                </div>
                              </Badge>
                              {client.isVip && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                  <Heart className="h-3 w-3 mr-1" />
                                  VIP
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {client.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {client.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {client.city}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(client.lastBooking), 'dd/MM/yyyy', { locale: es })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-semibold">{client.totalBookings}</p>
                                <p className="text-gray-500">Reservas</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold">${client.totalSpent.toLocaleString()}</p>
                                <p className="text-gray-500">Gastado</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="font-semibold">{client.averageRating.toFixed(1)}</span>
                                </div>
                                <p className="text-gray-500">Rating</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`mailto:${client.email}`)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`tel:${client.phone}`)}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(client)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {client.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notas:</strong> {client.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa y historial de {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : clientDetails && (
            <div className="space-y-6">
              {/* Client Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">${clientDetails.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Gastado</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{clientDetails.client.totalBookings}</p>
                    <p className="text-sm text-gray-600">Total Reservas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">${clientDetails.averageBookingValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Promedio/Reserva</p>
                  </CardContent>
                </Card>
              </div>

              {/* Client Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Agregar notas sobre el cliente..."
                      value={clientDetails.client.notes || ''}
                      onChange={(e) => {
                        // Update local state or implement controlled component
                      }}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="vip"
                          checked={clientDetails.client.isVip}
                          onChange={(e) => {
                            // Handle VIP status change
                          }}
                        />
                        <Label htmlFor="vip">Cliente VIP</Label>
                      </div>
                      <Button
                        onClick={() => updateClientMutation.mutate({
                          clientId: clientDetails.client.id,
                          notes: clientDetails.client.notes || '',
                          isVip: clientDetails.client.isVip
                        })}
                        disabled={updateClientMutation.isPending}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking History */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Reservas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientDetails.bookingHistory.map((booking: BookingHistory) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{booking.serviceName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{format(new Date(booking.date), 'dd/MM/yyyy', { locale: es })}</span>
                              <Badge variant={
                                booking.status === 'completed' ? 'default' :
                                booking.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${booking.price.toLocaleString()}</p>
                            {booking.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{booking.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {booking.review && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Reseña:</strong> {booking.review}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}