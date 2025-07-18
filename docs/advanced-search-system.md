# Advanced Search and Filtering System

## Overview

The Advanced Search and Filtering System provides comprehensive search capabilities for customers to find service providers based on multiple criteria. This feature improves the discovery experience with real-time filtering, location-based search, and intelligent sorting options.

## Key Features

### 1. Multi-Criteria Search
- **Text Search**: Search across provider names, descriptions, services, and locations
- **Real-time Suggestions**: Autocomplete suggestions from categories, cities, and service names
- **Popular Searches**: Display trending search terms with usage counts

### 2. Location-Based Filtering
- **City & Province Selection**: Filter by specific locations in Argentina
- **Radius Search**: Define search radius from 1-50km (requires coordinates)
- **Distance Calculations**: Uses Haversine formula for accurate distance measurements

### 3. Category & Service Filters
- **Multiple Category Selection**: Filter by one or more service categories
- **Service Type Filtering**: Find providers offering specific services
- **Dynamic Category Counts**: Show number of providers per category

### 4. Price Range Filtering
- **Custom Price Range**: Set minimum and maximum hourly rates
- **Predefined Ranges**: Quick selection for common price brackets
- **Price-based Sorting**: Sort results by price (low to high or high to low)

### 5. Rating & Reviews
- **Minimum Rating Filter**: Filter providers by star rating (1-5)
- **Review Availability**: Option to show only providers with reviews
- **Sort by Rating**: Order results by highest rated providers

### 6. Provider Attributes
- **Verification Status**: Filter for verified providers only
- **Experience Level**: Filter by minimum years of experience
- **Language Support**: Find providers who speak specific languages
- **Credit Availability**: Show only providers with available credits

### 7. Intelligent Sorting
- **Relevance**: Default sorting based on multiple factors
- **Distance**: Sort by proximity (when location provided)
- **Rating**: Sort by highest rated providers
- **Review Count**: Sort by most reviewed providers
- **Price**: Sort by lowest or highest hourly rate
- **Experience**: Sort by most experienced providers
- **Response Time**: Sort by fastest average response time

### 8. Search Results Features
- **Faceted Search**: Dynamic facets showing counts for cities, categories, price ranges, and ratings
- **Pagination**: Efficient result pagination with configurable page size
- **Result Cards**: Rich provider cards showing key information
- **Quick Actions**: Direct links to view profile or contact provider

## Technical Implementation

### Backend Components

#### SearchService (`server/services/searchService.ts`)
- Main search logic with complex query building
- Facet calculation for dynamic filtering
- Search suggestion generation
- Distance calculation utilities

#### Search Routes (`server/routes/search.ts`)
- `/api/search/providers` - Main search endpoint
- `/api/search/suggestions` - Autocomplete suggestions
- `/api/search/popular` - Popular search terms

### Frontend Components

#### SearchBar (`client/src/components/search/search-bar.tsx`)
- Intelligent search input with autocomplete
- Popular searches display
- Keyboard navigation support
- Location awareness

#### AdvancedSearchFilters (`client/src/components/search/advanced-search-filters.tsx`)
- Comprehensive filter interface
- Mobile-responsive design
- Active filter indicators
- Quick filter clearing

#### SearchResults (`client/src/components/search/search-results.tsx`)
- Provider card display
- Loading states
- Empty state handling
- Pagination controls

#### Search Page (`client/src/pages/search.tsx`)
- Main search interface
- URL parameter synchronization
- Filter state management
- Responsive layout

### Database Queries
- Optimized PostgreSQL queries with proper indexing
- Efficient JOIN operations for related data
- Aggregate functions for facet calculations
- Full-text search capabilities

## Usage Examples

### Basic Search
```
/buscar?q=plomero
```

### Location-based Search
```
/buscar?q=electricista&city=Buenos Aires&province=Buenos Aires
```

### Multi-filter Search
```
/buscar?categories=1,2,3&minPrice=1000&maxPrice=5000&verified=true&sortBy=rating
```

### Advanced Search with All Filters
```
/buscar?q=gasista&city=Córdoba&minRating=4&hasReviews=true&experienceYears=5&languages=es,en&sortBy=distance
```

## Benefits

### For Customers
- **Faster Discovery**: Find the right provider quickly
- **Better Matches**: Filter by specific requirements
- **Informed Decisions**: See ratings, reviews, and provider details
- **Location Convenience**: Find nearby providers
- **Price Transparency**: Compare rates easily

### For Providers
- **Increased Visibility**: Appear in relevant searches
- **Quality Leads**: Customers find them based on their strengths
- **Fair Competition**: Multiple sorting options beyond just price
- **Credit Efficiency**: Only appear to relevant customers

### For the Platform
- **Higher Conversion**: Better matching leads to more bookings
- **User Satisfaction**: Improved search experience
- **Data Insights**: Search patterns reveal user needs
- **Scalability**: Efficient query structure handles growth

## Future Enhancements

1. **AI-Powered Search**: Natural language processing for better query understanding
2. **Saved Searches**: Allow users to save and get alerts for search criteria
3. **Search Analytics**: Track popular searches and optimize categories
4. **Voice Search**: Add voice input capability
5. **Map View**: Visual representation of provider locations
6. **Availability Filtering**: Real-time availability checking
7. **Project-based Search**: Search by project type rather than service category
8. **Budget Calculator**: Estimate project costs based on search results