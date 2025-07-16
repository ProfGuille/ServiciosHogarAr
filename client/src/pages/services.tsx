import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
// import { ServiceSearch } from "@/components/services/service-search";
// import { ServiceCard } from "@/components/services/service-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, SlidersHorizontal, Star, MapPin } from "lucide-react";

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "Servicios - ServiciosHogar.com.ar";
  }, []);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["/api/providers", selectedCity, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCity) params.set('city', selectedCity);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      params.set('limit', '20');
      return fetch(`/api/providers?${params.toString()}`).then(res => res.json());
    },
  });

  const argentineCities = [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata",
    "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe", "San Juan"
  ];

  const filteredProviders = providers?.filter(provider => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        provider.businessName?.toLowerCase().includes(query) ||
        provider.description?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedProviders = filteredProviders?.sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return Number(b.rating) - Number(a.rating);
      case "reviews":
        return b.totalReviews - a.totalReviews;
      case "price_low":
        return Number(a.hourlyRate || 0) - Number(b.hourlyRate || 0);
      case "price_high":
        return Number(b.hourlyRate || 0) - Number(a.hourlyRate || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Buscar servicios</h1>
          <p className="text-lg text-slate-600">
            Encuentra profesionales verificados para tu hogar
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <ServiceSearch />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <Input
                    placeholder="Nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las ciudades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las ciudades</SelectItem>
                      {argentineCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Mejor calificación</SelectItem>
                      <SelectItem value="reviews">Más reseñas</SelectItem>
                      <SelectItem value="price_low">Precio menor</SelectItem>
                      <SelectItem value="price_high">Precio mayor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {(selectedCategory || selectedCity || searchQuery) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filtros activos</label>
                    <div className="space-y-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="mr-2">
                          Buscar: {searchQuery}
                          <button
                            onClick={() => setSearchQuery("")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {selectedCategory && (
                        <Badge variant="secondary" className="mr-2">
                          {categories?.find(c => c.id.toString() === selectedCategory)?.name}
                          <button
                            onClick={() => setSelectedCategory("")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                      {selectedCity && (
                        <Badge variant="secondary" className="mr-2">
                          {selectedCity}
                          <button
                            onClick={() => setSelectedCity("")}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {providersLoading ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    `${sortedProviders?.length || 0} profesionales encontrados`
                  )}
                </h2>
                {(selectedCity || selectedCategory) && (
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedCity && `en ${selectedCity}`}
                    {selectedCity && selectedCategory && " • "}
                    {selectedCategory && `categoría: ${categories?.find(c => c.id.toString() === selectedCategory)?.name}`}
                  </p>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {providersLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProviders && sortedProviders.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {sortedProviders.map((provider) => (
                  <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-600">
                          {provider.businessName?.[0] || 'P'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{provider.businessName}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-slate-600 ml-1">
                              {provider.rating} ({provider.totalReviews} reseñas)
                            </span>
                          </div>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {provider.city}
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {provider.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary">
                            ${provider.hourlyRate}/hora
                          </span>
                          <Button size="sm" asChild>
                            <a href={`/profesional/${provider.id}`}>
                              Ver perfil
                            </a>
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No se encontraron profesionales
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Intenta ajustar tus filtros o buscar en otra ubicación
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("");
                      setSelectedCategory("");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More */}
            {sortedProviders && sortedProviders.length >= 20 && (
              <div className="text-center mt-8">
                <Button variant="outline">
                  Cargar más resultados
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
