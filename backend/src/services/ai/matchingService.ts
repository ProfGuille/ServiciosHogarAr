// backend/src/services/ai/matchingService.ts
/**
 * AI Matching Service - Smart Provider-Client Matching
 * Uses intelligent algorithms without expensive AI APIs
 */

interface Provider {
  id: number;
  businessName: string;
  city: string;
  latitude?: number;
  longitude?: number;
  serviceCategories: number[];
  isVerified: boolean;
  credits: number;
  phone?: string;
  averageRating?: number;
  completedJobs?: number;
  responseTimeHours?: number;
  availability?: {
    isAvailable: boolean;
    nextAvailableDate?: string;
    workingHours?: {
      start: string;
      end: string;
    };
  };
}

interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  customerId: number;
  city: string;
  latitude?: number;
  longitude?: number;
  estimatedBudget?: number;
  isUrgent: boolean;
  preferredDate?: string;
  preferredTime?: string;
}

interface MatchScore {
  providerId: number;
  provider: Provider;
  totalScore: number;
  breakdown: {
    categoryMatch: number;      // 25% weight
    locationScore: number;      // 20% weight
    qualityScore: number;       // 20% weight
    availabilityScore: number;  // 15% weight
    responseScore: number;      // 10% weight
    creditsScore: number;       // 10% weight
  };
  distance?: number;
  estimatedResponseTime?: string;
  recommendationReason: string;
}

export class AIMatchingService {
  
  /**
   * Find the best matching providers for a service request
   */
  static async findMatches(
    request: ServiceRequest, 
    providers: Provider[], 
    maxResults: number = 5
  ): Promise<MatchScore[]> {
    
    const matches: MatchScore[] = [];
    
    for (const provider of providers) {
      // Skip if provider doesn't have required credits
      if (provider.credits < 1) continue;
      
      // Skip if provider doesn't serve this category
      if (!provider.serviceCategories.includes(request.categoryId)) continue;
      
      const score = this.calculateMatchScore(request, provider);
      matches.push(score);
    }
    
    // Sort by total score (descending) and return top matches
    return matches
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, maxResults);
  }
  
  /**
   * Calculate comprehensive match score for a provider-request pair
   */
  private static calculateMatchScore(
    request: ServiceRequest, 
    provider: Provider
  ): MatchScore {
    
    const breakdown = {
      categoryMatch: this.calculateCategoryScore(request, provider),
      locationScore: this.calculateLocationScore(request, provider),
      qualityScore: this.calculateQualityScore(provider),
      availabilityScore: this.calculateAvailabilityScore(request, provider),
      responseScore: this.calculateResponseScore(provider),
      creditsScore: this.calculateCreditsScore(provider)
    };
    
    // Weighted total score (0-100)
    const totalScore = 
      breakdown.categoryMatch * 0.25 +
      breakdown.locationScore * 0.20 +
      breakdown.qualityScore * 0.20 +
      breakdown.availabilityScore * 0.15 +
      breakdown.responseScore * 0.10 +
      breakdown.creditsScore * 0.10;
    
    const distance = this.calculateDistance(request, provider);
    const estimatedResponseTime = this.estimateResponseTime(provider);
    const recommendationReason = this.generateRecommendationReason(breakdown, provider);
    
    return {
      providerId: provider.id,
      provider,
      totalScore: Math.round(totalScore),
      breakdown,
      distance,
      estimatedResponseTime,
      recommendationReason
    };
  }
  
  /**
   * Score based on service category match
   */
  private static calculateCategoryScore(request: ServiceRequest, provider: Provider): number {
    // Perfect match if provider serves the exact category
    if (provider.serviceCategories.includes(request.categoryId)) {
      return 100;
    }
    
    // TODO: Add related category matching (e.g., electrician can do basic electrical + smart home)
    return 0;
  }
  
  /**
   * Score based on geographic proximity
   */
  private static calculateLocationScore(request: ServiceRequest, provider: Provider): number {
    // City-based scoring if no coordinates
    if (!request.latitude || !provider.latitude) {
      if (request.city.toLowerCase() === provider.city.toLowerCase()) {
        return 90; // Same city
      }
      return 50; // Different city, assume moderate distance
    }
    
    const distance = this.calculateDistance(request, provider);
    
    if (distance <= 5) return 100;      // Within 5km
    if (distance <= 10) return 85;     // Within 10km
    if (distance <= 20) return 70;     // Within 20km
    if (distance <= 50) return 50;     // Within 50km
    return 20; // More than 50km
  }
  
  /**
   * Score based on provider quality metrics
   */
  private static calculateQualityScore(provider: Provider): number {
    let score = 0;
    
    // Verification status (30% of quality score)
    if (provider.isVerified) {
      score += 30;
    }
    
    // Average rating (50% of quality score)
    if (provider.averageRating) {
      const ratingScore = (provider.averageRating / 5) * 50;
      score += ratingScore;
    } else {
      score += 25; // Default for new providers
    }
    
    // Completed jobs (20% of quality score)
    if (provider.completedJobs) {
      if (provider.completedJobs >= 50) score += 20;
      else if (provider.completedJobs >= 20) score += 15;
      else if (provider.completedJobs >= 5) score += 10;
      else score += 5;
    } else {
      score += 5; // New provider baseline
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Score based on availability for the request
   */
  private static calculateAvailabilityScore(request: ServiceRequest, provider: Provider): number {
    if (!provider.availability) {
      return 50; // Default score if availability unknown
    }
    
    let score = 0;
    
    // Currently available
    if (provider.availability.isAvailable) {
      score += 60;
    } else {
      score += 20;
    }
    
    // Urgency matching
    if (request.isUrgent) {
      if (provider.availability.isAvailable) {
        score += 40; // Perfect for urgent requests
      } else {
        score += 10; // Not ideal for urgent
      }
    } else {
      score += 30; // Normal requests
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Score based on typical response time
   */
  private static calculateResponseScore(provider: Provider): number {
    if (!provider.responseTimeHours) {
      return 60; // Default score
    }
    
    if (provider.responseTimeHours <= 1) return 100;      // Within 1 hour
    if (provider.responseTimeHours <= 4) return 85;       // Within 4 hours
    if (provider.responseTimeHours <= 12) return 70;      // Within 12 hours
    if (provider.responseTimeHours <= 24) return 50;      // Within 1 day
    return 30; // More than 1 day
  }
  
  /**
   * Score based on credits (ability to respond)
   */
  private static calculateCreditsScore(provider: Provider): number {
    if (provider.credits >= 20) return 100;
    if (provider.credits >= 10) return 80;
    if (provider.credits >= 5) return 60;
    if (provider.credits >= 1) return 40;
    return 0; // No credits
  }
  
  /**
   * Calculate distance between request and provider using Haversine formula
   */
  private static calculateDistance(request: ServiceRequest, provider: Provider): number {
    if (!request.latitude || !provider.latitude) {
      return 0; // Cannot calculate without coordinates
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(provider.latitude - request.latitude);
    const dLon = this.toRadians((provider.longitude || 0) - (request.longitude || 0));
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(request.latitude)) * 
              Math.cos(this.toRadians(provider.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }
  
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Estimate response time based on provider metrics
   */
  private static estimateResponseTime(provider: Provider): string {
    const hours = provider.responseTimeHours || 12;
    
    if (hours <= 1) return "En 1 hora";
    if (hours <= 4) return "En 4 horas";
    if (hours <= 12) return "Hoy";
    if (hours <= 24) return "En 24 horas";
    return "En 1-2 días";
  }
  
  /**
   * Generate AI-like recommendation reason
   */
  private static generateRecommendationReason(breakdown: any, provider: Provider): string {
    const reasons = [];
    
    if (breakdown.qualityScore >= 80) {
      reasons.push("⭐ Excelente calificación");
    }
    
    if (breakdown.locationScore >= 80) {
      reasons.push("📍 Muy cerca de ti");
    }
    
    if (breakdown.responseScore >= 80) {
      reasons.push("⚡ Respuesta rápida");
    }
    
    if (breakdown.availabilityScore >= 80) {
      reasons.push("✅ Disponible ahora");
    }
    
    if (provider.isVerified) {
      reasons.push("🛡️ Profesional verificado");
    }
    
    if (reasons.length === 0) {
      reasons.push("🔧 Especialista en el servicio");
    }
    
    return reasons.slice(0, 2).join(" • ");
  }
  
  /**
   * Get smart recommendations for a client based on their history
   */
  static async getPersonalizedRecommendations(
    customerId: number,
    categoryId?: number,
    limit: number = 3
  ): Promise<{
    recommended: Provider[];
    reason: string;
  }> {
    
    // TODO: Implement based on client's past bookings, ratings, and preferences
    // For now, return top-rated providers in the category
    
    return {
      recommended: [],
      reason: "Recomendados para ti basado en tu historial"
    };
  }
  
  /**
   * Machine learning-like provider ranking adjustment
   * Updates provider scores based on real performance
   */
  static async updateProviderPerformance(
    providerId: number,
    serviceRequestId: number,
    metrics: {
      responseTimeActual?: number;
      clientSatisfaction?: number;
      jobCompleted?: boolean;
      onTime?: boolean;
      budgetAccuracy?: number;
    }
  ): Promise<void> {
    
    // TODO: Implement machine learning-like updates to provider scoring
    // This would continuously improve the matching algorithm based on real outcomes
    
    console.log(`Updating performance metrics for provider ${providerId}:`, metrics);
  }
}

export default AIMatchingService;