// frontend/src/components/notifications/NotificationPreferences.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Bell, Mail, Smartphone, Clock, Shield } from 'lucide-react';
import { notificationService, type NotificationPreferences } from '@/services/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // Query para obtener preferencias
  const { data, isLoading, error } = useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
  });

  React.useEffect(() => {
    if (data && !preferences) {
      setPreferences(data);
    }
  }, [data, preferences]);

  // Mutación para actualizar preferencias
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) => 
      notificationService.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Éxito",
        description: "Preferencias guardadas correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al guardar las preferencias",
        variant: "destructive",
      });
    },
  });

  // Mutación para prueba de push
  const testPushMutation = useMutation({
    mutationFn: () => notificationService.sendTestPush(),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Notificación de prueba enviada",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Error al enviar notificación de prueba",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (data && !preferences) {
      setPreferences(data);
    }
  }, [data, preferences]);

  const handleSwitchChange = (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    
    const updated = { ...preferences, [field]: value };
    setPreferences(updated);
  };

  const handleTimeChange = (field: keyof NotificationPreferences, value: string) => {
    if (!preferences) return;
    
    const updated = { ...preferences, [field]: value };
    setPreferences(updated);
  };

  const handleSave = () => {
    if (!preferences) return;
    updatePreferencesMutation.mutate(preferences);
  };

  const setupPushNotifications = async () => {
    try {
      const subscription = await notificationService.setupPushNotifications();
      if (subscription) {
        toast({
          title: "Éxito",
          description: "Notificaciones push configuradas correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron configurar las notificaciones push",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al configurar notificaciones push",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  if (error || !preferences) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error al cargar las preferencias de notificación</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">Configura cómo y cuándo quieres recibir notificaciones</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updatePreferencesMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updatePreferencesMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Notificaciones por Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificaciones por Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Confirmaciones de reserva</Label>
              <p className="text-sm text-gray-600">Recibe emails cuando confirmes una reserva</p>
            </div>
            <Switch
              checked={preferences.emailBookingConfirmation}
              onCheckedChange={(checked) => handleSwitchChange('emailBookingConfirmation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Recordatorios de citas</Label>
              <p className="text-sm text-gray-600">Emails de recordatorio antes de tus citas</p>
            </div>
            <Switch
              checked={preferences.emailBookingReminder}
              onCheckedChange={(checked) => handleSwitchChange('emailBookingReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Mensajes nuevos</Label>
              <p className="text-sm text-gray-600">Notificaciones cuando recibas mensajes</p>
            </div>
            <Switch
              checked={preferences.emailNewMessage}
              onCheckedChange={(checked) => handleSwitchChange('emailNewMessage', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Actualizaciones de pago</Label>
              <p className="text-sm text-gray-600">Confirmaciones y recibos de pagos</p>
            </div>
            <Switch
              checked={preferences.emailPaymentUpdate}
              onCheckedChange={(checked) => handleSwitchChange('emailPaymentUpdate', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Marketing y promociones</Label>
              <p className="text-sm text-gray-600">Ofertas especiales y noticias</p>
            </div>
            <Switch
              checked={preferences.emailMarketing}
              onCheckedChange={(checked) => handleSwitchChange('emailMarketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones Push */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Configurar notificaciones push</Label>
              <p className="text-sm text-gray-600">Habilita notificaciones en tu navegador</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={setupPushNotifications}
              >
                Configurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testPushMutation.mutate()}
                disabled={testPushMutation.isPending}
              >
                Probar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Confirmaciones de reserva</Label>
              <p className="text-sm text-gray-600">Notificaciones push para reservas</p>
            </div>
            <Switch
              checked={preferences.pushBookingConfirmation}
              onCheckedChange={(checked) => handleSwitchChange('pushBookingConfirmation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Recordatorios de citas</Label>
              <p className="text-sm text-gray-600">Push notifications antes de tus citas</p>
            </div>
            <Switch
              checked={preferences.pushBookingReminder}
              onCheckedChange={(checked) => handleSwitchChange('pushBookingReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Mensajes nuevos</Label>
              <p className="text-sm text-gray-600">Notificaciones inmediatas de mensajes</p>
            </div>
            <Switch
              checked={preferences.pushNewMessage}
              onCheckedChange={(checked) => handleSwitchChange('pushNewMessage', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Actualizaciones de pago</Label>
              <p className="text-sm text-gray-600">Notificaciones de transacciones</p>
            </div>
            <Switch
              checked={preferences.pushPaymentUpdate}
              onCheckedChange={(checked) => handleSwitchChange('pushPaymentUpdate', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* No Molestar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            No Molestar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Activar modo "No molestar"</Label>
              <p className="text-sm text-gray-600">Silencia notificaciones en horarios específicos</p>
            </div>
            <Switch
              checked={preferences.doNotDisturb}
              onCheckedChange={(checked) => handleSwitchChange('doNotDisturb', checked)}
            />
          </div>

          {preferences.doNotDisturb && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <Label className="text-sm font-medium">Desde</Label>
                <Input
                  type="time"
                  value={preferences.doNotDisturbStart}
                  onChange={(e) => handleTimeChange('doNotDisturbStart', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Hasta</Label>
                <Input
                  type="time"
                  value={preferences.doNotDisturbEnd}
                  onChange={(e) => handleTimeChange('doNotDisturbEnd', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}