import { db } from "../db.js";
import { 
  webhookEvents,
  thirdPartyPartners,
  partnerIntegrations,
  users,
  serviceProviders,
  serviceRequests,
  payments,
  reviews
} from "../shared/schema.js";

import { eq, and, lte, sql } from "drizzle-orm";

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  source: string;
}

export class WebhookService {
  
  // Send webhook to partner
  static async sendWebhook(
    partnerId: number, 
    eventType: string, 
    payload: any
  ): Promise<boolean> {
    try {
      // Get partner webhook URL
      const [partner] = await db
        .select({
          id: thirdPartyPartners.id,
          name: thirdPartyPartners.name,
          webhookUrl: thirdPartyPartners.webhookUrl,
          status: thirdPartyPartners.status,
        })
        .from(thirdPartyPartners)
        .where(and(
          eq(thirdPartyPartners.id, partnerId),
          eq(thirdPartyPartners.status, 'active')
        ));

      if (!partner || !partner.webhookUrl) {
        console.log(`No webhook URL for partner ${partnerId}`);
        return false;
      }

      // Create webhook event record
      const [webhookEvent] = await db
        .insert(webhookEvents)
        .values({
          partnerId,
          eventType: eventType as any,
          webhookUrl: partner.webhookUrl,
          payload: {
            event: eventType,
            data: payload,
            timestamp: new Date().toISOString(),
            source: 'ServiciosHogar.com.ar'
          },
          status: 'pending',
        })
        .returning();

      // Send webhook
      const success = await this.deliverWebhook(webhookEvent.id);
      return success;
    } catch (error) {
      console.error("Error sending webhook:", error);
      return false;
    }
  }

  // Deliver webhook with retry logic
  static async deliverWebhook(webhookEventId: number): Promise<boolean> {
    try {
      const [event] = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.id, webhookEventId));

      if (!event) {
        console.error(`Webhook event ${webhookEventId} not found`);
        return false;
      }

      const response = await fetch(event.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ServiciosHogar-Webhook/1.0',
          'X-Webhook-Event': event.eventType,
          'X-Webhook-Timestamp': new Date().toISOString(),
        },
        body: JSON.stringify(event.payload),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseBody = await response.text().catch(() => '');
      
      if (response.ok) {
        // Success
        await db
          .update(webhookEvents)
          .set({
            status: 'sent',
            httpStatus: response.status,
            responseBody: responseBody.substring(0, 1000), // Limit response body size
            deliveredAt: new Date(),
            attemptCount: event.attemptCount + 1,
          })
          .where(eq(webhookEvents.id, webhookEventId));

        console.log(`Webhook ${webhookEventId} delivered successfully`);
        return true;
      } else {
        // Failed - schedule retry if under max attempts
        const newAttemptCount = event.attemptCount + 1;
        const shouldRetry = newAttemptCount < event.maxAttempts;
        
        const updateData: any = {
          status: shouldRetry ? 'retrying' : 'failed',
          httpStatus: response.status,
          responseBody: responseBody.substring(0, 1000),
          attemptCount: newAttemptCount,
        };

        if (shouldRetry) {
          // Exponential backoff: 2^attempt minutes
          const retryDelayMinutes = Math.pow(2, newAttemptCount);
          const nextRetryAt = new Date();
          nextRetryAt.setMinutes(nextRetryAt.getMinutes() + retryDelayMinutes);
          updateData.nextRetryAt = nextRetryAt;
        }

        await db
          .update(webhookEvents)
          .set(updateData)
          .where(eq(webhookEvents.id, webhookEventId));

        console.log(`Webhook ${webhookEventId} failed, attempt ${newAttemptCount}/${event.maxAttempts}`);
        return false;
      }
    } catch (error) {
      console.error(`Error delivering webhook ${webhookEventId}:`, error);
      
      // Update as failed
      await db
        .update(webhookEvents)
        .set({
          status: 'failed',
          attemptCount: sql`${webhookEvents.attemptCount} + 1`,
          responseBody: error instanceof Error ? error.message : 'Network error',
        })
        .where(eq(webhookEvents.id, webhookEventId));

      return false;
    }
  }

  // Process retry queue
  static async processRetryQueue(): Promise<void> {
    try {
      const retryEvents = await db
        .select()
        .from(webhookEvents)
        .where(and(
          eq(webhookEvents.status, 'retrying'),
          lte(webhookEvents.nextRetryAt, new Date())
        ))
        .limit(50); // Process max 50 retries per batch

      console.log(`Processing ${retryEvents.length} webhook retries`);

      for (const event of retryEvents) {
        await this.deliverWebhook(event.id);
        
        // Small delay between retries to avoid overwhelming partners
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error processing webhook retry queue:", error);
    }
  }

  // Event handlers for different platform events
  static async onUserCreated(userId: string, userData: any): Promise<void> {
    try {
      // Get all partners interested in user.created events
      const partners = await db
        .select({ partnerId: partnerIntegrations.partnerId })
        .from(partnerIntegrations)
        .innerJoin(thirdPartyPartners, eq(partnerIntegrations.partnerId, thirdPartyPartners.id))
        .where(and(
          eq(partnerIntegrations.integrationType, 'webhook'),
          eq(partnerIntegrations.isEnabled, true),
          eq(thirdPartyPartners.status, 'active')
        ));

      const payload = {
        userId,
        userType: userData.userType,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: userData.createdAt,
      };

      for (const partner of partners) {
        await this.sendWebhook(partner.partnerId, 'user.created', payload);
      }
    } catch (error) {
      console.error("Error sending user.created webhooks:", error);
    }
  }

  static async onProviderVerified(providerId: number): Promise<void> {
    try {
      const [provider] = await db
        .select({
          id: serviceProviders.id,
          businessName: serviceProviders.businessName,
          city: serviceProviders.city,
          province: serviceProviders.province,
          rating: serviceProviders.rating,
          experienceYears: serviceProviders.experienceYears,
        })
        .from(serviceProviders)
        .where(eq(serviceProviders.id, providerId));

      if (!provider) return;

      const partners = await db
        .select({ partnerId: partnerIntegrations.partnerId })
        .from(partnerIntegrations)
        .innerJoin(thirdPartyPartners, eq(partnerIntegrations.partnerId, thirdPartyPartners.id))
        .where(and(
          eq(partnerIntegrations.integrationType, 'webhook'),
          eq(partnerIntegrations.isEnabled, true),
          eq(thirdPartyPartners.status, 'active')
        ));

      const payload = {
        providerId: provider.id,
        businessName: provider.businessName,
        location: `${provider.city}, ${provider.province}`,
        rating: provider.rating,
        experienceYears: provider.experienceYears,
        verifiedAt: new Date().toISOString(),
      };

      for (const partner of partners) {
        await this.sendWebhook(partner.partnerId, 'provider.verified', payload);
      }
    } catch (error) {
      console.error("Error sending provider.verified webhooks:", error);
    }
  }

static async onRequestCreated(requestId: number): Promise<void> {
  try {
    const [request] = await db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        description: serviceRequests.description,
        budget: serviceRequests.estimatedBudget,
        city: serviceRequests.city,
        categoryId: serviceRequests.categoryId,
        scheduledDate: serviceRequests.preferredDate,  // Cambiado aquí
        urgency: serviceRequests.isUrgent,
        createdAt: serviceRequests.createdAt,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!request) return;

    const partners = await db
      .select({ partnerId: partnerIntegrations.partnerId })
      .from(partnerIntegrations)
      .innerJoin(thirdPartyPartners, eq(partnerIntegrations.partnerId, thirdPartyPartners.id))
      .where(
        and(
          eq(partnerIntegrations.integrationType, 'webhook'),
          eq(partnerIntegrations.isEnabled, true),
          eq(thirdPartyPartners.status, 'active')
        )
      );

    const payload = {
      requestId: request.id,
      title: request.title,
      description: request.description,
      budget: request.budget,
      location: request.city,
      categoryId: request.categoryId,
      scheduledDate: request.scheduledDate,   // Y aquí también
      urgency: request.urgency,
      createdAt: request.createdAt,
    };

    for (const partner of partners) {
      await this.sendWebhook(partner.partnerId, 'request.created', payload);
    }
  } catch (error) {
    console.error('Error sending request.created webhooks:', error);
  }
}

  static async onRequestCompleted(requestId: number): Promise<void> {
  try {
    const [request] = await db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        budget: serviceRequests.estimatedBudget,        // corregido
        providerId: serviceRequests.providerId,
        categoryId: serviceRequests.categoryId,
        completedAt: serviceRequests.completedAt,        // corregido: no uses updatedAt, sino completedAt
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId));

    if (!request) return;

    const partners = await db
      .select({ partnerId: partnerIntegrations.partnerId })
      .from(partnerIntegrations)
      .innerJoin(
        thirdPartyPartners,
        eq(partnerIntegrations.partnerId, thirdPartyPartners.id)
      )
      .where(
        and(
          eq(partnerIntegrations.integrationType, 'webhook'),
          eq(partnerIntegrations.isEnabled, true),
          eq(thirdPartyPartners.status, 'active')
        )
      );

    const payload = {
      requestId: request.id,
      title: request.title,
      budget: request.budget,
      providerId: request.providerId,
      categoryId: request.categoryId,
      completedAt: request.completedAt,
    };

    for (const partner of partners) {
      await this.sendWebhook(partner.partnerId, 'request.completed', payload);
    }
  } catch (error) {
    console.error('Error sending request.completed webhooks:', error);
  }
}


  static async onPaymentProcessed(paymentId: number): Promise<void> {
    try {
      const [payment] = await db
        .select({
          id: payments.id,
          amount: payments.amount,
          currency: payments.currency,
          serviceRequestId: payments.serviceRequestId,
          providerId: payments.providerId,
          customerId: payments.customerId,
          status: payments.status,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(eq(payments.id, paymentId));

      if (!payment) return;

      const partners = await db
        .select({ partnerId: partnerIntegrations.partnerId })
        .from(partnerIntegrations)
        .innerJoin(thirdPartyPartners, eq(partnerIntegrations.partnerId, thirdPartyPartners.id))
        .where(and(
          eq(partnerIntegrations.integrationType, 'webhook'),
          eq(partnerIntegrations.isEnabled, true),
          eq(thirdPartyPartners.status, 'active')
        ));

      const payload = {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        serviceRequestId: payment.serviceRequestId,
        providerId: payment.providerId,
        customerId: payment.customerId,
        status: payment.status,
        processedAt: payment.createdAt,
      };

      for (const partner of partners) {
        await this.sendWebhook(partner.partnerId, 'payment.processed', payload);
      }
    } catch (error) {
      console.error("Error sending payment.processed webhooks:", error);
    }
  }

  static async onReviewCreated(reviewId: number): Promise<void> {
    try {
      const [review] = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          serviceRequestId: reviews.serviceRequestId,
          reviewerId: reviews.reviewerId,
          revieweeId: reviews.revieweeId,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(eq(reviews.id, reviewId));

      if (!review) return;

      const partners = await db
        .select({ partnerId: partnerIntegrations.partnerId })
        .from(partnerIntegrations)
        .innerJoin(thirdPartyPartners, eq(partnerIntegrations.partnerId, thirdPartyPartners.id))
        .where(and(
          eq(partnerIntegrations.integrationType, 'webhook'),
          eq(partnerIntegrations.isEnabled, true),
          eq(thirdPartyPartners.status, 'active')
        ));

      const payload = {
        reviewId: review.id,
        rating: review.rating,
        comment: review.comment,
        serviceRequestId: review.serviceRequestId,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        createdAt: review.createdAt,
      };

      for (const partner of partners) {
        await this.sendWebhook(partner.partnerId, 'review.created', payload);
      }
    } catch (error) {
      console.error("Error sending review.created webhooks:", error);
    }
  }
}

// Schedule webhook retry processing every 5 minutes
setInterval(() => {
  WebhookService.processRetryQueue();
}, 5 * 60 * 1000);
