import React from 'react';
import { Card, CardContent } from './card';
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
  onServiceSelect: (service: Service) => void;
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
  return (
    <div className={cn("w-full max-w-6xl mx-auto p-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-lg text-gray-600">{subtitle}</p>
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
            onClick={() => onServiceSelect(service)}
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
    </div>
  );
};

export default ServiceSelector;