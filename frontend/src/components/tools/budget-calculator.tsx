import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calculator, Home, Zap, Wrench, MapPin } from 'lucide-react';

const serviceBaseRates = {
  // Construcción y Reparaciones
  plomeria: { min: 3000, max: 8000, unit: 'por servicio' },
  electricidad: { min: 2500, max: 6000, unit: 'por servicio' },
  pintura: { min: 2000, max: 5000, unit: 'por m²' },
  albanil: { min: 5000, max: 15000, unit: 'por día' },
  carpinteria: { min: 4000, max: 12000, unit: 'por proyecto' },
  gasista: { min: 3500, max: 9000, unit: 'por servicio' },
  herrero: { min: 6000, max: 18000, unit: 'por proyecto' },
  techista: { min: 8000, max: 25000, unit: 'por proyecto' },
  plastificador: { min: 1500, max: 3000, unit: 'por m²' },
  
  // Hogar y Electrodomésticos
  aire_acondicionado: { min: 4000, max: 12000, unit: 'por equipo' },
  heladeras: { min: 2500, max: 8000, unit: 'por reparación' },
  reparacion_electrodomesticos: { min: 2000, max: 7000, unit: 'por equipo' },
  destapacanerias: { min: 2000, max: 5000, unit: 'por servicio' },
  
  // Limpieza y Mantenimiento
  limpieza_general: { min: 1500, max: 3500, unit: 'por hora' },
  limpieza_alfombras: { min: 3000, max: 8000, unit: 'por m²' },
  jardineria: { min: 2000, max: 4500, unit: 'por sesión' },
  
  // Seguridad y Servicios
  cerrajero: { min: 2500, max: 7000, unit: 'por servicio' },
  seguridad_alarmas: { min: 8000, max: 30000, unit: 'por sistema' },
  mudanzas_fletes: { min: 5000, max: 20000, unit: 'por viaje' },
  cuidado_adultos: { min: 1200, max: 2500, unit: 'por hora' },
};

const zoneMultipliers = {
  'zona-norte': 1.3,
  'caba': 1.4,
  'zona-sur': 1.0,
  'zona-oeste': 1.1,
  'zona-este': 1.2,
};

const urgencyMultipliers = {
  normal: 1.0,
  urgente: 1.5,
  emergencia: 2.0,
};

export function BudgetCalculator() {
  const [serviceType, setServiceType] = useState('');
  const [zone, setZone] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [quantity, setQuantity] = useState([1]);
  const [estimatedBudget, setEstimatedBudget] = useState<{min: number, max: number} | null>(null);

  const calculateBudget = () => {
    if (!serviceType || !zone) return;

    const baseRate = serviceBaseRates[serviceType as keyof typeof serviceBaseRates];
    const zoneMultiplier = zoneMultipliers[zone as keyof typeof zoneMultipliers];
    const urgencyMultiplier = urgencyMultipliers[urgency as keyof typeof urgencyMultipliers];

    const min = Math.round(baseRate.min * zoneMultiplier * urgencyMultiplier * quantity[0]);
    const max = Math.round(baseRate.max * zoneMultiplier * urgencyMultiplier * quantity[0]);

    setEstimatedBudget({ min, max });
  };

  React.useEffect(() => {
    if (serviceType && zone) {
      calculateBudget();
    }
  }, [serviceType, zone, urgency, quantity]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Presupuesto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Tipo de Servicio</label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plomeria">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Plomería
                </div>
              </SelectItem>
              <SelectItem value="electricidad">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Electricidad
                </div>
              </SelectItem>
              <SelectItem value="pintura">Pintura</SelectItem>
              <SelectItem value="albanil">Albañilería</SelectItem>
              <SelectItem value="carpinteria">Carpintería</SelectItem>
              <SelectItem value="gasista">Gasista</SelectItem>
              <SelectItem value="herrero">Herrero</SelectItem>
              <SelectItem value="techista">Techista</SelectItem>
              <SelectItem value="plastificador">Plastificador</SelectItem>
              <SelectItem value="aire_acondicionado">Aire Acondicionado</SelectItem>
              <SelectItem value="heladeras">Reparación de Heladeras</SelectItem>
              <SelectItem value="reparacion_electrodomesticos">Reparación de Electrodomésticos</SelectItem>
              <SelectItem value="destapacanerias">Destapacañerías</SelectItem>
              <SelectItem value="limpieza_general">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Limpieza General
                </div>
              </SelectItem>
              <SelectItem value="limpieza_alfombras">Limpieza de Alfombras</SelectItem>
              <SelectItem value="jardineria">Jardinería</SelectItem>
              <SelectItem value="cerrajero">Cerrajero</SelectItem>
              <SelectItem value="seguridad_alarmas">Seguridad y Alarmas</SelectItem>
              <SelectItem value="mudanzas_fletes">Mudanzas y Fletes</SelectItem>
              <SelectItem value="cuidado_adultos">Cuidado de Adultos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Zona</label>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caba">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  CABA
                </div>
              </SelectItem>
              <SelectItem value="zona-norte">Zona Norte (GBA)</SelectItem>
              <SelectItem value="zona-sur">Zona Sur (GBA)</SelectItem>
              <SelectItem value="zona-oeste">Zona Oeste (GBA)</SelectItem>
              <SelectItem value="zona-este">Zona Este (GBA)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Urgencia</label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">
                Normal <Badge variant="secondary" className="ml-2">+0%</Badge>
              </SelectItem>
              <SelectItem value="urgente">
                Urgente <Badge variant="outline" className="ml-2">+50%</Badge>
              </SelectItem>
              <SelectItem value="emergencia">
                Emergencia <Badge variant="destructive" className="ml-2">+100%</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Cantidad/Tamaño: {quantity[0]}
            {serviceType && ` ${serviceBaseRates[serviceType as keyof typeof serviceBaseRates]?.unit}`}
          </label>
          <Slider
            value={quantity}
            onValueChange={setQuantity}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {estimatedBudget && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Presupuesto Estimado</h4>
            <div className="text-2xl font-bold text-blue-700">
              ${estimatedBudget.min.toLocaleString()} - ${estimatedBudget.max.toLocaleString()}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              *Precio estimado. El costo final puede variar según complejidad y materiales.
            </p>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={() => window.location.href = '/crear-solicitud'}
          disabled={!estimatedBudget}
        >
          Solicitar Presupuestos Gratis
        </Button>
      </CardContent>
    </Card>
  );
}