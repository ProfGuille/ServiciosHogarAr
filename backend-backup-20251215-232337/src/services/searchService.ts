type SearchFilters = {
  query?: string;
  category?: string;
  // Agrega más campos según necesites
};

class SearchService {
  async search(filters: SearchFilters) {
    // Implementa tu lógica de búsqueda aquí
    return []; // Resultado simulado
  }
}

export const searchService = new SearchService();
export type { SearchFilters };