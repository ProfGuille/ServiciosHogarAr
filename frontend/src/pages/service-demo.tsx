import React, { useState } from 'react';
import UserTypeSelector from '@/components/ui/UserTypeSelector';
import ServiceSelector from '@/components/ui/ServiceSelector';
import { servicesList } from '@/data/services';

const ServiceDemo: React.FC = () => {
  const [userType, setUserType] = useState<'client' | 'provider' | undefined>();
  const [selectedService, setSelectedService] = useState<string>('');

  const handleUserTypeSelect = (type: 'client' | 'provider') => {
    setUserType(type);
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service.id);
    console.log('Servicio seleccionado:', service);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Demo: Componentes UX inspirados en Recomendame
          </h1>
          <p className="text-xl text-center text-gray-600 mb-2">
            Implementación del patrón "Busco/Ofrezco" y selección visual de servicios
          </p>
          <p className="text-sm text-center text-gray-500">
            Imágenes tomadas del proyecto Recomendame de @ProfGuille
          </p>
        </div>

        {/* UserTypeSelector Demo */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            1. Selector de Tipo de Usuario
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <UserTypeSelector 
              onSelect={handleUserTypeSelect}
              selectedType={userType}
            />
            {userType && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  ✓ Tipo seleccionado: {userType === 'client' ? 'Cliente (Busco servicios)' : 'Proveedor (Ofrezco servicios)'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ServiceSelector Demo */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            2. Selector Visual de Servicios
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ServiceSelector
              services={servicesList}
              onServiceSelect={handleServiceSelect}
              selectedService={selectedService}
              title="Servicios Disponibles"
              subtitle="Selecciona el tipo de profesional que necesitas"
            />
            {selectedService && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ Servicio seleccionado: {servicesList.find(s => s.id === selectedService)?.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            📋 Notas de Implementación
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>Patrón UX:</strong> Inspirado en el exitoso proyecto Recomendame de @ProfGuille</p>
            <p>• <strong>Imágenes reales:</strong> Descargadas del repositorio Recomendame-proyectoCursoFullstack</p>
            <p>• <strong>Componentización:</strong> UserTypeSelector y ServiceSelector reutilizables</p>
            <p>• <strong>Data structure:</strong> Servicios organizados por categorías (construcción, hogar, seguridad)</p>
            <p>• <strong>Responsive design:</strong> Grid adaptativo para diferentes tamaños de pantalla</p>
          </div>
        </div>

        {/* Image Credits */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Imágenes de servicios tomadas de{' '}
            <a 
              href="https://github.com/ProfGuille/Recomendame-proyectoCursoFullstack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Recomendame-proyectoCursoFullstack
            </a>
            {' '}por @ProfGuille
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceDemo;