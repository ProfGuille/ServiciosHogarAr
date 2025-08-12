import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Search, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTypeOption {
  type: 'client' | 'provider';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface UserTypeSelectorProps {
  onSelect: (type: 'client' | 'provider') => void;
  selectedType?: 'client' | 'provider';
  className?: string;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  onSelect,
  selectedType,
  className,
}) => {
  const options: UserTypeOption[] = [
    {
      type: 'client',
      title: 'BUSCO',
      subtitle: 'A ALGUIEN RECOMENDADO',
      description: 'Necesito contratar un profesional o servicio para el hogar',
      icon: <Search className="h-12 w-12" />,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      type: 'provider',
      title: 'OFREZCO',
      subtitle: 'MIS SERVICIOS',
      description: 'Soy profesional y quiero ofrecer mis servicios',
      icon: <Briefcase className="h-12 w-12" />,
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          ¿Qué necesitas hacer?
        </h2>
        <p className="text-xl text-gray-600">
          Elige la opción que mejor describe tu situación
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {options.map((option) => (
          <Card
            key={option.type}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-xl",
              "border-2 hover:scale-105",
              selectedType === option.type && "border-2 border-primary"
            )}
            onClick={() => onSelect(option.type)}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                  option.color,
                  "text-white"
                )}>
                  {option.icon}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {option.title}
                </h3>
                <h4 className="text-xl font-semibold text-gray-700 mb-3">
                  {option.subtitle}
                </h4>
                <p className="text-gray-600">
                  {option.description}
                </p>
              </div>

              <Button
                className={cn(
                  "w-full text-lg py-3",
                  option.color,
                  "text-white font-semibold"
                )}
                size="lg"
              >
                {option.type === 'client' ? 'Buscar Servicios' : 'Registrarme como Profesional'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500">
          ¿No estás seguro? Puedes cambiar esta opción más tarde en tu perfil
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelector;