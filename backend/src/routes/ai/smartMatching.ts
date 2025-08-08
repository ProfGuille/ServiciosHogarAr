// backend/src/routes/ai/smartMatching.ts
import { Router } from 'express';
import { AIMatchingService } from '../../services/ai/matchingService.js';
import { db } from '../../db.js';
import { serviceProviders, serviceCategories, serviceRequests } from '../../../shared/schema.js';
import { eq, and, gte } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/ai/find-matches
 * Find the best matching providers for a service request using AI algorithms
 */
router.post('/find-matches', async (req, res) => {
  try {
    const { 
      categoryId, 
      city, 
      latitude, 
      longitude, 
      estimatedBudget, 
      isUrgent = false,
      preferredDate,
      maxResults = 5 
    } = req.body;

    if (!categoryId || !city) {
      return res.status(400).json({ 
        error: 'Category ID and city are required' 
      });
    }

    // Fetch all active providers with credits
    const providers = await db.select({
      id: serviceProviders.id,
      businessName: serviceProviders.businessName,
      city: serviceProviders.city,
      latitude: serviceProviders.latitude,
      longitude: serviceProviders.longitude,
      serviceCategories: serviceProviders.serviceCategories,
      isVerified: serviceProviders.isVerified,
      credits: serviceProviders.credits,
      phone: serviceProviders.phone,
      averageRating: serviceProviders.averageRating,
      completedJobs: serviceProviders.completedJobs,
      responseTimeHours: serviceProviders.responseTimeHours,
      isOnline: serviceProviders.isOnline,
      lastSeenAt: serviceProviders.lastSeenAt
    })
    .from(serviceProviders)
    .where(
      and(
        gte(serviceProviders.credits, 1),
        eq(serviceProviders.isVerified, true)
      )
    );

    // Create mock service request for matching
    const mockRequest = {
      id: 0,
      title: `Service Request`,
      description: `Service needed in ${city}`,
      categoryId: parseInt(categoryId),
      customerId: req.user?.id || 0,
      city,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
      isUrgent: Boolean(isUrgent),
      preferredDate,
      preferredTime: undefined
    };

    // Enhanced providers with availability info
    const enhancedProviders = providers.map(provider => ({
      ...provider,
      availability: {
        isAvailable: provider.isOnline || false,
        nextAvailableDate: new Date().toISOString(),
        workingHours: {
          start: "08:00",
          end: "18:00"
        }
      }
    }));

    // Find matches using AI algorithm
    const matches = await AIMatchingService.findMatches(
      mockRequest,
      enhancedProviders,
      parseInt(maxResults)
    );

    // Fetch category info for context
    const category = await db.select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, categoryId))
      .limit(1);

    res.json({
      success: true,
      data: {
        requestInfo: {
          categoryId,
          categoryName: category[0]?.name || 'Unknown',
          city,
          isUrgent,
          totalProviders: providers.length,
          matchingProviders: matches.length
        },
        matches: matches.map(match => ({
          providerId: match.providerId,
          provider: {
            id: match.provider.id,
            businessName: match.provider.businessName,
            city: match.provider.city,
            phone: match.provider.phone,
            isVerified: match.provider.isVerified,
            averageRating: match.provider.averageRating || 4.5,
            completedJobs: match.provider.completedJobs || 0
          },
          matchScore: match.totalScore,
          distance: match.distance,
          estimatedResponseTime: match.estimatedResponseTime,
          recommendationReason: match.recommendationReason,
          breakdown: match.breakdown
        }))
      }
    });

  } catch (error) {
    console.error('Error in AI matching:', error);
    res.status(500).json({ 
      error: 'Error finding matches',
      details: error.message 
    });
  }
});

/**
 * GET /api/ai/recommendations/:userId
 * Get personalized provider recommendations for a user
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { categoryId, limit = 3 } = req.query;

    const recommendations = await AIMatchingService.getPersonalizedRecommendations(
      parseInt(userId),
      categoryId ? parseInt(categoryId) : undefined,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      error: 'Error getting recommendations',
      details: error.message 
    });
  }
});

/**
 * POST /api/ai/update-performance
 * Update provider performance metrics for machine learning
 */
router.post('/update-performance', async (req, res) => {
  try {
    const { 
      providerId, 
      serviceRequestId, 
      responseTimeActual, 
      clientSatisfaction, 
      jobCompleted, 
      onTime, 
      budgetAccuracy 
    } = req.body;

    if (!providerId || !serviceRequestId) {
      return res.status(400).json({ 
        error: 'Provider ID and Service Request ID are required' 
      });
    }

    await AIMatchingService.updateProviderPerformance(
      parseInt(providerId),
      parseInt(serviceRequestId),
      {
        responseTimeActual: responseTimeActual ? parseFloat(responseTimeActual) : undefined,
        clientSatisfaction: clientSatisfaction ? parseFloat(clientSatisfaction) : undefined,
        jobCompleted: jobCompleted !== undefined ? Boolean(jobCompleted) : undefined,
        onTime: onTime !== undefined ? Boolean(onTime) : undefined,
        budgetAccuracy: budgetAccuracy ? parseFloat(budgetAccuracy) : undefined
      }
    );

    res.json({
      success: true,
      message: 'Provider performance updated successfully'
    });

  } catch (error) {
    console.error('Error updating performance:', error);
    res.status(500).json({ 
      error: 'Error updating performance',
      details: error.message 
    });
  }
});

/**
 * GET /api/ai/match-stats
 * Get statistics about the AI matching system
 */
router.get('/match-stats', async (req, res) => {
  try {
    // Get basic stats
    const totalProviders = await db.select({ count: serviceProviders.id })
      .from(serviceProviders);
    
    const verifiedProviders = await db.select({ count: serviceProviders.id })
      .from(serviceProviders)
      .where(eq(serviceProviders.isVerified, true));

    const activeProviders = await db.select({ count: serviceProviders.id })
      .from(serviceProviders)
      .where(
        and(
          eq(serviceProviders.isVerified, true),
          gte(serviceProviders.credits, 1)
        )
      );

    res.json({
      success: true,
      data: {
        totalProviders: totalProviders.length,
        verifiedProviders: verifiedProviders.length,
        activeProviders: activeProviders.length,
        matchingAlgorithm: {
          version: "1.0",
          factors: [
            { name: "Category Match", weight: "25%" },
            { name: "Location", weight: "20%" },
            { name: "Quality Score", weight: "20%" },
            { name: "Availability", weight: "15%" },
            { name: "Response Time", weight: "10%" },
            { name: "Credits", weight: "10%" }
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error getting match stats:', error);
    res.status(500).json({ 
      error: 'Error getting statistics',
      details: error.message 
    });
  }
});

export default router;