import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  Settings
} from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  id: number;
  dayOfWeek: number; // 0 = domingo, 1 = lunes, etc.
  startTime: string; // HH:mm format
  endTime: string;
  isRecurring: boolean;
  specificDate?: string; // YYYY-MM-DD for non-recurring slots
  isActive: boolean;
  maxBookings: number;
  currentBookings: number;
}

interface Booking {
  id: number;
  date: string;
  time: string;
  clientName: string;
  serviceName: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  price: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function AvailabilityCalendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true,
    specificDate: '',
    maxBookings: 1,
    isActive: true
  });

  // Fetch availability slots
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['availability-slots'],
    queryFn: async () => {
      const response = await fetch('/api/provider/availability', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar disponibilidad');
      return response.json();
    }
  });

  // Fetch bookings for current week
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['week-bookings', currentWeekStart],
    queryFn: async () => {
      const endDate = addDays(currentWeekStart, 6);
      const response = await fetch(
        `/api/provider/bookings?start=${format(currentWeekStart, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Error al cargar reservas');
      return response.json();
    }
  });

  // Save time slot mutation
  const saveSlotMutation = useMutation({
    mutationFn: async (data: typeof slotForm) => {
      const url = editingSlot 
        ? `/api/provider/availability/${editingSlot.id}`
        : '/api/provider/availability';
      
      const response = await fetch(url, {
        method: editingSlot ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Error al guardar horario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      queryClient.invalidateQueries({ queryKey: ['week-bookings'] });
      setIsSlotDialogOpen(false);
      setEditingSlot(null);
      resetSlotForm();
      toast({
        title: "Éxito",
        description: `Horario ${editingSlot ? 'actualizado' : 'creado'} correctamente`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const response = await fetch(`/api/provider/availability/${slotId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al eliminar horario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      toast({
        title: "Éxito",
        description: "Horario eliminado correctamente"
      });
    }
  });

  const resetSlotForm = () => {
    setSlotForm({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: true,
      specificDate: '',
      maxBookings: 1,
      isActive: true
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(direction === 'next' 
      ? addWeeks(currentWeekStart, 1) 
      : subWeeks(currentWeekStart, 1)
    );
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const getSlotsForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return timeSlots.filter((slot: TimeSlot) => 
      (slot.isRecurring && slot.dayOfWeek === dayOfWeek) ||
      (!slot.isRecurring && slot.specificDate === dateStr)
    );
  };

  const getBookingsForDateAndTime = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter((booking: Booking) => 
      booking.date === dateStr && booking.time === time
    );
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isRecurring: slot.isRecurring,
      specificDate: slot.specificDate || '',
      maxBookings: slot.maxBookings,
      isActive: slot.isActive
    });
    setIsSlotDialogOpen(true);
  };

  const handleAddSpecificSlot = (date: Date) => {
    setEditingSlot(null);
    setSlotForm({
      ...slotForm,
      isRecurring: false,
      specificDate: format(date, 'yyyy-MM-dd'),
      dayOfWeek: date.getDay()
    });
    setIsSlotDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendario de Disponibilidad</CardTitle>
              <CardDescription>
                Gestiona tus horarios de trabajo y reservas de clientes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingSlot(null); resetSlotForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSlot ? 'Editar Horario' : 'Nuevo Horario de Trabajo'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure su disponibilidad para recibir reservas
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isRecurring"
                        checked={slotForm.isRecurring}
                        onCheckedChange={(checked) => setSlotForm({...slotForm, isRecurring: checked})}
                      />
                      <Label htmlFor="isRecurring">Horario recurrente semanal</Label>
                    </div>

                    {slotForm.isRecurring ? (
                      <div>
                        <Label>Día de la semana</Label>
                        <Select 
                          value={slotForm.dayOfWeek.toString()} 
                          onValueChange={(value) => setSlotForm({...slotForm, dayOfWeek: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar día" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label>Fecha específica</Label>
                        <input
                          type="date"
                          value={slotForm.specificDate}
                          onChange={(e) => setSlotForm({...slotForm, specificDate: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Hora de inicio</Label>
                        <Select 
                          value={slotForm.startTime} 
                          onValueChange={(value) => setSlotForm({...slotForm, startTime: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Inicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Hora de fin</Label>
                        <Select 
                          value={slotForm.endTime} 
                          onValueChange={(value) => setSlotForm({...slotForm, endTime: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Fin" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Máximo de reservas simultáneas</Label>
                      <Select 
                        value={slotForm.maxBookings.toString()} 
                        onValueChange={(value) => setSlotForm({...slotForm, maxBookings: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cantidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={slotForm.isActive}
                        onCheckedChange={(checked) => setSlotForm({...slotForm, isActive: checked})}
                      />
                      <Label htmlFor="isActive">Horario activo</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSlotDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => saveSlotMutation.mutate(slotForm)}
                      disabled={saveSlotMutation.isPending}
                    >
                      {editingSlot ? 'Actualizar' : 'Crear'} Horario
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => navigateWeek('prev')}>
              ←
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentWeekStart, 'dd MMM', { locale: es })} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy', { locale: es })}
            </h3>
            <Button variant="outline" onClick={() => navigateWeek('next')}>
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Header Days */}
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="text-center font-medium p-2 bg-gray-50 rounded">
                {day.short}
              </div>
            ))}

            {/* Calendar Days */}
            {getWeekDays().map((date) => {
              const daySlots = getSlotsForDay(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div 
                  key={date.toISOString()} 
                  className={`border rounded-lg p-2 min-h-32 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {format(date, 'd')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSpecificSlot(date)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {daySlots.map((slot: TimeSlot) => {
                      const dayBookings = getBookingsForDateAndTime(date, slot.startTime);
                      const isFullyBooked = dayBookings.length >= slot.maxBookings;
                      
                      return (
                        <div
                          key={slot.id}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            !slot.isActive 
                              ? 'bg-gray-100 text-gray-500' 
                              : isFullyBooked 
                                ? 'bg-red-100 text-red-700'
                                : dayBookings.length > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                          }`}
                          onClick={() => handleEditSlot(slot)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{slot.startTime}-{slot.endTime}</span>
                            {dayBookings.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {dayBookings.length}/{slot.maxBookings}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Show booking details */}
                          {dayBookings.map((booking: Booking) => (
                            <div key={booking.id} className="mt-1 text-xs">
                              <div className="flex items-center gap-1">
                                {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                                {booking.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                                <span className="truncate">{booking.clientName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Estado de Horarios</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Parcialmente ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Completamente ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Inactivo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}