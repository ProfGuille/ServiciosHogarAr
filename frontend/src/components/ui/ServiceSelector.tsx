import React, { useState } from 'react';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Button } from './button';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}

interface ServiceSelectorProps {
  title?: string;
  subtitle?: string;
  services: Service[];
  onServiceSelect: (service: Service, location?: string) => void;
  selectedService?: string;
  className?: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  title = "¿Qué servicio necesitas?",
  subtitle = "Selecciona el tipo de profesional que buscas",
  services,
  onServiceSelect,
  selectedService,
  className,
}) => {
  const [location, setLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Argentine cities for autocomplete
  const argentineCities = [
    "Buenos Aires (CABA)",
    "La Plata, Buenos Aires",
    "Mar del Plata, Buenos Aires",
    "Córdoba, Córdoba", 
    "Rosario, Santa Fe",
    "Mendoza, Mendoza",
    "Tucumán, Tucumán",
    "Salta, Salta",
    "Santa Fe, Santa Fe",
    "San Juan, San Juan",
    "Resistencia, Chaco",
    "Neuquén, Neuquén",
    "Paraná, Entre Ríos",
    "Posadas, Misiones",
    "San Salvador de Jujuy, Jujuy",
    "San Luis, San Luis",
    "Catamarca, Catamarca",
    "La Rioja, La Rioja",
    "Formosa, Formosa",
    "San Fernando del Valle de Catamarca, Catamarca",
    "Rawson, Chubut",
    "Viedma, Río Negro",
    "Ushuaia, Tierra del Fuego",
    "Santa Rosa, La Pampa"
  ];

  const filteredCities = argentineCities.filter(city =>
    city.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 5);

  const handleServiceClick = (service: Service) => {
    // Allow service selection without location - user can add location later
    onServiceSelect(service, location.trim() || undefined);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setShowLocationSuggestions(e.target.value.length > 0);
  };

  const selectCity = (city: string) => {
    setLocation(city);
    setShowLocationSuggestions(false);
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-lg text-gray-600">{subtitle}</p>
      </div>

      {/* Location Input */}
      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿En qué zona necesitas el servicio? (opcional)
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Ej: Buenos Aires, Córdoba, Rosario..."
            className="pl-10"
            value={location}
            onChange={handleLocationChange}
            onFocus={() => setShowLocationSuggestions(location.length > 0)}
          />
          
          {/* Location suggestions dropdown */}
          {showLocationSuggestions && filteredCities.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
              {filteredCities.map((city, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => selectCity(city)}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {city}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Indicar tu ubicación nos ayuda a mostrarte profesionales más cercanos
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
              "border-2 hover:border-blue-500",
              selectedService === service.id && "border-blue-500 bg-blue-50"
            )}
            onClick={() => handleServiceClick(service)}
          >
            <CardContent className="p-4 text-center">
              <div className="mb-3">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-24 object-cover rounded-md"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {location ? (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Buscando profesionales en: <span className="font-medium text-blue-600">{location}</span>
          </p>
        </div>
      ) : (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Los profesionales de toda Argentina están disponibles. ¡Añade tu ubicación para ver los más cercanos!
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;