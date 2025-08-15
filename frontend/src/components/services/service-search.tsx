import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin } from "lucide-react";

export function ServiceSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fallback categories when API is not available
  const fallbackCategories = [
    { id: 1, name: "Plomería" },
    { id: 2, name: "Electricidad" },
    { id: 3, name: "Pintura" },
    { id: 4, name: "Limpieza" },
    { id: 5, name: "Carpintería" },
    { id: 6, name: "Gasista" },
    { id: 7, name: "Albañil" },
    { id: 8, name: "Técnico de aire" },
    { id: 9, name: "Jardinería" },
    { id: 10, name: "Cerrajero" },
    { id: 11, name: "Mudanzas" },
    { id: 12, name: "Herrero" }
  ];

  // Use fallback if categories API fails
  const displayCategories = categories || fallbackCategories;

  const handleSearch = () => {
    // Build search params
    const params = new URLSearchParams();
    if (searchQuery) params.set("buscar", searchQuery);
    if (locationQuery) params.set("ubicacion", locationQuery);
    
    setLocation(`/servicios?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              ¿Qué servicio necesitas?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Ej: Plomería, Electricidad..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            {/* Quick suggestions */}
            {displayCategories && searchQuery.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1">
                {displayCategories
                  .filter(cat => 
                    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((category) => (
                    <button
                      key={category.id}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        setSearchQuery(category.name);
                        handleSearch();
                      }}
                    >
                      {category.name}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Ciudad o código postal"
                className="pl-10"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button 
              className="w-full bg-secondary text-white hover:bg-green-700"
              onClick={handleSearch}
            >
              Buscar Servicios
            </Button>
          </div>
        </div>

        {/* Popular Services */}
        {displayCategories && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 mb-3">Servicios populares:</p>
            <div className="flex flex-wrap gap-2">
              {displayCategories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setSearchQuery(category.name);
                    handleSearch();
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
