// Geocoding service using free Nominatim API
// Part of MVP3 Phase 3: 100% free geolocation services

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  importance: number;
}

interface ReverseGeocodeResult {
  displayName: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

class GeocodingService {
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly USER_AGENT = 'ServiciosHogar.com.ar/1.0';
  
  /**
   * Geocode an address to coordinates
   * @param address The address to geocode
   * @param countryCode Optional country code to limit search (e.g., 'ar' for Argentina)
   * @param limit Maximum number of results (default: 5)
   */
  async geocode(
    address: string, 
    countryCode: string = 'ar', 
    limit: number = 5
  ): Promise<GeocodeResult[]> {
    try {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        countrycodes: countryCode,
        'accept-language': 'es,en',
      });

      const response = await fetch(`${this.BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const results: NominatimResult[] = await response.json();
      
      return results.map(this.normalizeGeocodeResult);
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Error al geocodificar la dirección');
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param lat Latitude
   * @param lng Longitude
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'es,en',
      });

      const response = await fetch(`${this.BASE_URL}/reverse?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const result: NominatimResult = await response.json();
      
      return this.normalizeReverseGeocodeResult(result);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Error al obtener la dirección de las coordenadas');
    }
  }

  /**
   * Search for places by name with suggestions
   * @param query The search query
   * @param countryCode Optional country code
   * @param limit Maximum number of results
   */
  async searchPlaces(
    query: string, 
    countryCode: string = 'ar', 
    limit: number = 10
  ): Promise<GeocodeResult[]> {
    if (query.length < 3) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        countrycodes: countryCode,
        'accept-language': 'es,en',
        dedupe: '1',
      });

      const response = await fetch(`${this.BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`Place search failed: ${response.status}`);
      }

      const results: NominatimResult[] = await response.json();
      
      // Sort by importance (higher is better)
      return results
        .map(this.normalizeGeocodeResult)
        .sort((a, b) => b.importance - a.importance);
    } catch (error) {
      console.error('Place search error:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a place
   * @param placeId The Nominatim place ID
   */
  async getPlaceDetails(placeId: number): Promise<GeocodeResult | null> {
    try {
      const params = new URLSearchParams({
        place_id: placeId.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'es,en',
      });

      const response = await fetch(`${this.BASE_URL}/details?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`Place details failed: ${response.status}`);
      }

      const result: NominatimResult = await response.json();
      
      return this.normalizeGeocodeResult(result);
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }

  private normalizeGeocodeResult = (result: NominatimResult): GeocodeResult => {
    const address = result.address || {};
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: {
        street: address.road || address.house_number ? 
          [address.road, address.house_number].filter(Boolean).join(' ') : 
          undefined,
        city: address.city || address.municipality || address.suburb || address.neighbourhood,
        state: address.state,
        country: address.country,
        postcode: address.postcode,
      },
      importance: result.importance || 0,
    };
  };

  private normalizeReverseGeocodeResult = (result: NominatimResult): ReverseGeocodeResult => {
    const address = result.address || {};
    
    return {
      displayName: result.display_name,
      address: {
        street: address.road || address.house_number ? 
          [address.road, address.house_number].filter(Boolean).join(' ') : 
          undefined,
        city: address.city || address.municipality || address.suburb || address.neighbourhood,
        state: address.state,
        country: address.country,
        postcode: address.postcode,
      },
    };
  };
}

// Export singleton instance
export const geocodingService = new GeocodingService();

// Export types
export type { GeocodeResult, ReverseGeocodeResult };