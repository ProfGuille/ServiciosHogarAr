import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch as useWouterSearch } from 'wouter';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/search/search-bar';
import { AdvancedSearchFilters } from '@/components/search/advanced-search-filters';
import { SearchResults } from '@/components/search/search-results';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SearchFilters {
  query?: string;
  city?: string;
  province?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  hasReviews?: boolean;
  isVerified?: boolean;
  experienceYears?: number;
  languages?: string[];
  hasCredits?: boolean;
  sortBy?: string;
}

export default function Search() {
  const urlSearchParams = new URLSearchParams(useWouterSearch());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const initialFilters: SearchFilters = {
      query: urlSearchParams.get('q') || '',
      city: urlSearchParams.get('city') || undefined,
      province: urlSearchParams.get('province') || undefined,
      sortBy: urlSearchParams.get('sortBy') || 'relevance',
    };

    // Parse category IDs
    const categoryIds = urlSearchParams.get('categories');
    if (categoryIds) {
      initialFilters.categoryIds = categoryIds.split(',').map(Number);
    }

    // Parse numeric filters
    const minPrice = urlSearchParams.get('minPrice');
    if (minPrice) initialFilters.minPrice = Number(minPrice);

    const maxPrice = urlSearchParams.get('maxPrice');
    if (maxPrice) initialFilters.maxPrice = Number(maxPrice);

    const minRating = urlSearchParams.get('minRating');
    if (minRating) initialFilters.minRating = Number(minRating);

    // Parse boolean filters
    if (urlSearchParams.get('verified') === 'true') {
      initialFilters.isVerified = true;
    }

    if (urlSearchParams.get('hasReviews') === 'true') {
      initialFilters.hasReviews = true;
    }

    if (urlSearchParams.get('hasCredits') === 'true') {
      initialFilters.hasCredits = true;
    }

    return initialFilters;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.city) params.set('city', filters.city);
    if (filters.province) params.set('province', filters.province);
    if (filters.categoryIds?.length) params.set('categories', filters.categoryIds.join(','));
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.isVerified) params.set('verified', 'true');
    if (filters.hasReviews) params.set('hasReviews', 'true');
    if (filters.hasCredits) params.set('hasCredits', 'true');
    if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Fetch categories for filters
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Build search query params
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.city) params.set('city', filters.city);
    if (filters.province) params.set('province', filters.province);
    if (filters.categoryIds?.length) params.set('categoryIds', filters.categoryIds.join(','));
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined) params.set('minRating', filters.minRating.toString());
    if (filters.hasReviews) params.set('hasReviews', 'true');
    if (filters.isVerified) params.set('verified', 'true');
    if (filters.hasCredits) params.set('hasCredits', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    
    params.set('limit', itemsPerPage.toString());
    params.set('offset', ((currentPage - 1) * itemsPerPage).toString());

    return params.toString();
  };

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search/providers', filters, currentPage],
    queryFn: () => apiRequest('GET', `/api/search/providers?${buildSearchParams()}`),
  });

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'sortBy' && key !== 'query' && value !== undefined && value !== ''
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar 
            onSearch={handleSearch} 
            initialQuery={filters.query || ''}
            showLocation={true}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop filters sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories || []}
              facets={searchResults?.facets}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Results */}
            <SearchResults
              providers={searchResults?.data || []}
              isLoading={isLoading}
              total={searchResults?.total || 0}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>

      {/* Mobile filters modal */}
      {showMobileFilters && (
        <AdvancedSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories || []}
          facets={searchResults?.facets}
          showMobileFilters={showMobileFilters}
          onCloseMobileFilters={() => setShowMobileFilters(false)}
        />
      )}

      <Footer />
    </div>
  );
}