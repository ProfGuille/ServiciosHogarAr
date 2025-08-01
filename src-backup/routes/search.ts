import { Router } from 'express';
import { SearchService, SearchFilters } from "../services/searchService";
import { z } from 'zod';

const router = Router();
const searchService = new SearchService();

// Search filters validation schema
const searchFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusKm: z.number().min(1).max(100).optional(),
  categoryId: z.number().optional(),
  categoryIds: z.array(z.number()).optional(),
  serviceTypes: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
  hasReviews: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  experienceYears: z.number().min(0).optional(),
  languages: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  hasCredits: z.boolean().optional(),
  sortBy: z.enum(['relevance', 'distance', 'rating', 'reviews', 'price_low', 'price_high', 'experience', 'response_time']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

// Advanced search endpoint
router.get('/search/providers', async (req, res) => {
  try {
    // Parse and validate query parameters
    const queryParams: any = {
      query: req.query.q as string,
      city: req.query.city as string,
      province: req.query.province as string,
      latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radiusKm: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
      categoryIds: req.query.categoryIds ? (req.query.categoryIds as string).split(',').map(id => parseInt(id)) : undefined,
      serviceTypes: req.query.services ? (req.query.services as string).split(',') : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      hasReviews: req.query.hasReviews === 'true',
      isVerified: req.query.verified === 'true',
      experienceYears: req.query.experience ? parseInt(req.query.experience as string) : undefined,
      languages: req.query.languages ? (req.query.languages as string).split(',') : undefined,
      hasCredits: req.query.hasCredits === 'true',
      sortBy: req.query.sortBy as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    // Validate filters
    const filters = searchFiltersSchema.parse(queryParams);

    // Perform search
    const results = await searchService.searchProviders(filters);

    reson({
      success: true,
      data: results.providers,
      total: results.total,
      facets: results.facets,
      pagination: {
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        hasMore: (filters.offset || 0) + (filters.limit || 20) < results.total
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to search providers'
    });
  }
});

// Search suggestions endpoint
router.get('/search/suggestions', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!query || query.length < 2) {
      return reson({ suggestions: [] });
    }

    const suggestions = await searchService.getSearchSuggestions(query, limit);

    reson({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
});

// Popular searches endpoint
router.get('/search/popular', async (req, res) => {
  try {
    // This would typically come from analytics or search history
    const popularSearches = [
      { term: 'Plomero urgente', count: 1523 },
      { term: 'Electricista certificado', count: 1245 },
      { term: 'Limpieza profunda', count: 987 },
      { term: 'Gasista matriculado', count: 876 },
      { term: 'Pintor profesional', count: 765 },
      { term: 'Aires acondicionados', count: 654 },
      { term: 'Cerrajero 24 horas', count: 543 },
      { term: 'Mudanzas económicas', count: 432 }
    ];

    reson({
      success: true,
      searches: popularSearches
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches'
    });
  }
});

export default router;