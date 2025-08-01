import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, CalendarDays, Settings, Plus } from "lucide-react";
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

interface AvailabilityCalendarProps {
  providerId: number;
}

export function AvailabilityCalendar({ providerId }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  });
  const [workingHours, setWorkingHours] = useState({
    start: "08:00",
    end: "18:00",
  });
  const [isAvailable, setIsAvailable] = useState(true);

  // Mock data for blocked dates and appointments
  const blockedDates = [
    new Date(2025, 6, 20), // July 20, 2025
    new Date(2025, 6, 25), // July 25, 2025
  ];

  const appointments = [
    {
      id: 1,
      date: new Date(2025, 6, 17),
      time: "10:00",
      client: "María García",
      service: "Reparación de cañería",
      status: "confirmed",
    },
    {
      id: 2,
      date: new Date(2025, 6, 18),
      time: "14:30",
      client: "Carlos López",
      service: "Instalación eléctrica",
      status: "pending",
    },
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  const getDateBadge = (date: Date) => {
    if (isToday(date)) return { text: "Hoy", variant: "default" as const };
    if (isTomorrow(date)) return { text: "Mañana", variant: "secondary" as const };
    return null;
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => 
      blockedDate.toDateString() === date.toDateString()
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };

  const getDayName = (dayKey: string) => {
    const days = {
      monday: "Lunes",
      tuesday: "Martes", 
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    };
    return days[dayKey as keyof typeof days];
  };

  return (
    <div className="space-y-6">
      {/* Availability Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Estado de Disponibilidad
              </CardTitle>
              <CardDescription>
                Gestiona tu disponibilidad para recibir nuevas solicitudes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="availability-toggle">Disponible</Label>
              <Switch
                id="availability-toggle"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isAvailable ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Aceptando nuevas solicitudes</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>No disponible para nuevas solicitudes</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>
              Selecciona una fecha para ver tu agenda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => isDateBlocked(date)}
              modifiers={{
                booked: appointments.map(apt => apt.date),
                blocked: blockedDates,
              }}
              modifiersStyles={{
                booked: { backgroundColor: '#dbeafe', color: '#1e40af' },
                blocked: { backgroundColor: '#fee2e2', color: '#dc2626' },
              }}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Días con citas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Días bloqueados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Agenda del {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </CardTitle>
                {getDateBadge(selectedDate) && (
                  <Badge variant={getDateBadge(selectedDate)!.variant} className="mt-1">
                    {getDateBadge(selectedDate)!.text}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Bloquear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin citas programadas
                </h3>
                <p className="text-gray-500">
                  No tienes citas para este día
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <Badge 
                        variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                      >
                        {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{appointment.service}</h4>
                    <p className="text-sm text-gray-600">Cliente: {appointment.client}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Working Hours Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Horarios de Trabajo
          </CardTitle>
          <CardDescription>
            Configura tus días y horarios de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Working Days */}
          <div>
            <h4 className="font-medium mb-3">Días de trabajo</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(workingDays).map(([day, isWorking]) => (
                <div key={day} className="flex items-center space-x-2">
                  <Switch
                    id={day}
                    checked={isWorking}
                    onCheckedChange={(checked) =>
                      setWorkingDays(prev => ({ ...prev, [day]: checked }))
                    }
                  />
                  <Label htmlFor={day} className="text-sm">
                    {getDayName(day)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="font-medium mb-3">Horario laboral</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="text-sm">Inicio</Label>
                <Select value={workingHours.start} onValueChange={(value) => 
                  setWorkingHours(prev => ({ ...prev, start: value }))
                }>
                  <SelectTrigger id="start-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="end-time" className="text-sm">Fin</Label>
                <Select value={workingHours.end} onValueChange={(value) => 
                  setWorkingHours(prev => ({ ...prev, end: value }))
                }>
                  <SelectTrigger id="end-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}