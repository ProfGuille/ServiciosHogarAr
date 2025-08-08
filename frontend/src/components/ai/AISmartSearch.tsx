import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Star, MapPin, Clock, Shield, Zap, Brain, Loader2 } from 'lucide-react';

interface MatchResult {
  providerId: number;
  provider: {
    id: number;
    businessName: string;
    city: string;
    phone: string;
    isVerified: boolean;
    averageRating: number;
    completedJobs: number;
  };
  matchScore: number;
  distance: number;
  estimatedResponseTime: string;
  recommendationReason: string;
  breakdown: {
    categoryMatch: number;
    locationScore: number;
    qualityScore: number;
    availabilityScore: number;
    responseScore: number;
    creditsScore: number;
  };
}

export default function AISmartSearch() {
  const [formData, setFormData] = useState({
    categoryId: '',
    city: '',
    estimatedBudget: '',
    isUrgent: false
  });
  
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);

  const categories = [
    { id: 1, name: 'Plomería' },
    { id: 2, name: 'Electricidad' },
    { id: 3, name: 'Pintura' },
    { id: 4, name: 'Limpieza' },
    { id: 5, name: 'Carpintería' }
  ];

  const handleSearch = async () => {
    if (!formData.categoryId || !formData.city) {
      alert('Por favor completa la categoría y la ciudad');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/ai/find-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setMatches(result.data.matches);
        setRequestInfo(result.data.requestInfo);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error calling AI matching:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    return 'Regular';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold">Búsqueda Inteligente</h1>
        </div>
        <p className="text-gray-600">Encuentra el profesional perfecto usando inteligencia artificial</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="text-yellow-500" size={20} />
            <span>Búsqueda con IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría de Servicio</Label>
              <Select value={formData.categoryId} onValueChange={(value) => 
                setFormData({...formData, categoryId: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                placeholder="Ej: Buenos Aires"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto Estimado</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Ej: 5000"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({...formData, estimatedBudget: e.target.value})}
              />
            </div>

            {/* Urgent */}
            <div className="space-y-2">
              <Label htmlFor="urgent">¿Es urgente?</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="urgent"
                  checked={formData.isUrgent}
                  onCheckedChange={(checked) => setFormData({...formData, isUrgent: checked})}
                />
                <span className="text-sm text-gray-600">
                  {formData.isUrgent ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={loading || !formData.categoryId || !formData.city}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando con IA...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Buscar con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Request Info */}
      {requestInfo && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{requestInfo.matchingProviders}</div>
                <div className="text-sm text-gray-600">Coincidencias encontradas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{requestInfo.totalProviders}</div>
                <div className="text-sm text-gray-600">Profesionales totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{requestInfo.categoryName}</div>
                <div className="text-sm text-gray-600">Categoría</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{requestInfo.city}</div>
                <div className="text-sm text-gray-600">Ciudad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Mejores Coincidencias</h2>
          
          {matches.map((match, index) => (
            <Card key={match.providerId} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Provider Info */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-semibold">{match.provider.businessName}</h3>
                          {match.provider.isVerified && (
                            <Shield className="text-green-500" size={20} />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{match.provider.city}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-500" />
                            <span>{match.provider.averageRating}/5</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{match.estimatedResponseTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={`${getScoreColor(match.matchScore)} border-0`}>
                        {match.matchScore}% • {getScoreLabel(match.matchScore)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-medium">Razón de recomendación:</span>
                      <span className="text-gray-600">{match.recommendationReason}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Trabajos completados: <strong>{match.provider.completedJobs}</strong></span>
                      <span>Teléfono: <strong>{match.provider.phone}</strong></span>
                    </div>
                  </div>

                  {/* AI Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Análisis IA:</h4>
                    <div className="space-y-2">
                      {Object.entries(match.breakdown).map(([key, value]) => {
                        const labels = {
                          categoryMatch: 'Coincidencia',
                          locationScore: 'Ubicación',
                          qualityScore: 'Calidad',
                          availabilityScore: 'Disponibilidad',
                          responseScore: 'Respuesta',
                          creditsScore: 'Créditos'
                        };
                        
                        return (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{labels[key]}:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{Math.round(value)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Contactar Profesional
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && matches.length === 0 && requestInfo && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500">
              <Brain size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No se encontraron coincidencias</h3>
              <p>Intenta ajustar tus criterios de búsqueda o buscar en otra ubicación.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}