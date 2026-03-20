import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { useSearch } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, SlidersHorizontal, Star, MapPin, Search } from "lucide-react";

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = new URLSearchParams(useSearch());

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const categoryParam = searchParams.get('categoria');
    const searchParam = searchParams.get('buscar');
    if (categoryParam && categories && (categories as any[]).length > 0) {
      const category = (categories as any[]).find((cat: any) =>
        cat.name.toLowerCase() === categoryParam.toLowerCase() ||
        cat.name.toLowerCase().includes(categoryParam.toLowerCase())
      );
      if (category) {
        setSelectedCategory(category.id.toString());
        setShowFilters(true);
      }
    }
    if (searchParam) setSearchQuery(searchParam);
  }, [categories, searchParams.toString()]);

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["/api/search/providers", selectedCity, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
      if (selectedCategory && selectedCategory !== 'all') params.set('categoryId', selectedCategory);
      params.set('limit', '50');
      const response = await fetch(`${getApiUrl()}/api/search/providers?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar proveedores');
      const result = await response.json();
      return result.data || [];
    },
  });

  const argentineCities = [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata",
    "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe", "San Juan"
  ];

  const filteredProviders = (providers as any[] || []).filter((provider: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      provider.businessName?.toLowerCase().includes(query) ||
      provider.description?.toLowerCase().includes(query) ||
      provider.city?.toLowerCase().includes(query) ||
      provider.categories?.some((cat: any) => cat.name?.toLowerCase().includes(query))
    );
  });

  const sortedProviders = [...filteredProviders].sort((a: any, b: any) => {
    switch (sortBy) {
      case "rating":    return Number(b.rating) - Number(a.rating);
      case "reviews":   return b.totalReviews - a.totalReviews;
      case "price_low": return Number(a.hourlyRate || 0) - Number(b.hourlyRate || 0);
      case "price_high":return Number(b.hourlyRate || 0) - Number(a.hourlyRate || 0);
      default: return 0;
    }
  });

  const hasActiveFilters = selectedCategory !== 'all' || selectedCity !== 'all' || !!searchQuery;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setSearchQuery('');
    window.history.pushState({}, '', '/servicios');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {selectedCategory !== "all" && categories
              ? `Profesionales de ${(categories as any[]).find((c: any) => c.id.toString() === selectedCategory)?.name || 'Servicios'}`
              : "Encontrá un profesional"}
          </h1>
          <p className="text-lg text-slate-600">Profesionales verificados para tu hogar</p>
        </div>

        <div className="mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">¿Qué servicio necesitás?</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Ej: Plomería, Electricidad..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Categoría</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {(categories as any[] || []).map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ciudad</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ciudades</SelectItem>
                      {argentineCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Mejor calificación</SelectItem>
                      <SelectItem value="reviews">Más reseñas</SelectItem>
                      <SelectItem value="price_low">Precio menor</SelectItem>
                      <SelectItem value="price_high">Precio mayor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filtros activos</label>
                      <div className="flex flex-wrap gap-2">
                        {searchQuery && (
                          <Badge variant="secondary">
                            "{searchQuery}"
                            <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">×</button>
                          </Badge>
                        )}
                        {selectedCategory !== 'all' && (
                          <Badge variant="secondary">
                            {(categories as any[] || []).find((c: any) => c.id.toString() === selectedCategory)?.name}
                            <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-destructive">×</button>
                          </Badge>
                        )}
                        {selectedCity !== 'all' && (
                          <Badge variant="secondary">
                            {selectedCity}
                            <button onClick={() => setSelectedCity("all")} className="ml-1 hover:text-destructive">×</button>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={clearFilters}>Limpiar filtros</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {providersLoading
                  ? <Skeleton className="h-6 w-32" />
                  : `${sortedProviders.length} profesional${sortedProviders.length !== 1 ? 'es' : ''} encontrado${sortedProviders.length !== 1 ? 's' : ''}`
                }
              </h2>
            </div>

            {providersLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}><CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" />
                  </CardContent></Card>
                ))}
              </div>
            ) : sortedProviders.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {sortedProviders.map((provider: any) => (
                  <Card key={provider.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-slate-600">{provider.businessName?.[0] || 'P'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1 truncate">{provider.businessName}</h3>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-slate-600 ml-1">{provider.rating} ({provider.totalReviews} reseñas)</span>
                            </div>
                            {provider.isVerified && <Badge variant="secondary" className="text-xs">Verificado</Badge>}
                          </div>
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />{provider.city}
                          </div>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{provider.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary text-sm">
                              {provider.hourlyRate ? `$${provider.hourlyRate}/hora` : ''}
                            </span>
                            <Button size="sm" asChild>
                              <a href={`/profesional/${provider.id}`}>Ver perfil</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron profesionales</h3>
                  <p className="text-slate-600 mb-4">
                    {hasActiveFilters
                      ? "No hay profesionales que coincidan con tu búsqueda. Probá ajustar los filtros."
                      : "Todavía no hay profesionales registrados en esta categoría."}
                  </p>
                  {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
