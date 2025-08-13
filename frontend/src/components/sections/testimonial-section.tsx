import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

interface TestimonialProps {
  name: string;
  location: string;
  service: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  verified?: boolean;
}

const testimonials: TestimonialProps[] = [
  {
    name: "María González",
    location: "Palermo, CABA",
    service: "Plomería",
    rating: 5,
    comment: "Excelente servicio. El plomero llegó puntual y resolvió el problema de la cañería en menos de 2 horas. Muy profesional y precio justo.",
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    verified: true
  },
  {
    name: "Carlos Rodríguez",
    location: "Zona Norte, GBA",
    service: "Electricidad",
    rating: 5,
    comment: "Súper recomendable. Cambió toda la instalación eléctrica de mi casa. Trabajo prolijo y cumplió con los tiempos acordados.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    verified: true
  },
  {
    name: "Ana Martínez",
    location: "Villa Crespo, CABA",
    service: "Limpieza",
    rating: 5,
    comment: "La empresa de limpieza que contraté a través de la plataforma fue increíble. Mi casa quedó impecable y el precio fue muy competitivo.",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    verified: true
  },
  {
    name: "Diego Fernández",
    location: "San Isidro, GBA",
    service: "Carpintería",
    rating: 5,
    comment: "Hice un mueble a medida para mi living. El carpintero fue muy profesional, me asesoró bien y el resultado superó mis expectativas.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    verified: true
  }
];

function TestimonialCard({ testimonial }: { testimonial: TestimonialProps }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} />
              <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{testimonial.name}</h4>
                {testimonial.verified && (
                  <Badge variant="secondary" className="text-xs">Verificado</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              <Badge variant="outline" className="mt-1 text-xs">{testimonial.service}</Badge>
            </div>
          </div>
          <Quote className="h-8 w-8 text-blue-200" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">"{testimonial.comment}"</p>
      </CardContent>
    </Card>
  );
}

export function TestimonialSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-slate-600">
            Miles de clientes satisfechos confían en nosotros para sus servicios del hogar
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-6 bg-white px-8 py-4 rounded-full shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.8/5</div>
              <div className="text-sm text-gray-600">Calificación promedio</div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-gray-600">Reseñas verificadas</div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <div className="text-sm text-gray-600">Recomendarían</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}