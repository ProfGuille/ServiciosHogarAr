import { useAuth } from './useAuth';

// Generate a session ID for analytics tracking
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get or create session ID from sessionStorage
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export function useAnalytics() {
  const { user } = useAuth();

  const trackEvent = async (
    eventType: 'page_view' | 'service_search' | 'provider_view' | 'request_created' | 'message_sent' | 'payment_completed' | 'review_created',
    metadata: Record<string, any> = {}
  ) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          userId: user?.id || null,
          sessionId: getSessionId(),
          metadata,
        }),
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  };

  const trackPageView = (pageName: string, additionalData: Record<string, any> = {}) => {
    trackEvent('page_view', {
      page: pageName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ...additionalData,
    });
  };

  const trackServiceSearch = (searchTerm: string, category?: string, resultsCount?: number) => {
    trackEvent('service_search', {
      searchTerm,
      category,
      resultsCount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackProviderView = (providerId: string | number, providerName?: string) => {
    trackEvent('provider_view', {
      providerId,
      providerName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRequestCreated = (requestId: string | number, category: string, amount?: number) => {
    trackEvent('request_created', {
      requestId,
      category,
      amount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackMessageSent = (conversationId: string | number, messageLength: number) => {
    trackEvent('message_sent', {
      conversationId,
      messageLength,
      timestamp: new Date().toISOString(),
    });
  };

  const trackPaymentCompleted = (paymentId: string | number, amount: number, method: string) => {
    trackEvent('payment_completed', {
      paymentId,
      amount,
      method,
      timestamp: new Date().toISOString(),
    });
  };

  const trackReviewCreated = (requestId: string | number, rating: number) => {
    trackEvent('review_created', {
      requestId,
      rating,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackServiceSearch,
    trackProviderView,
    trackRequestCreated,
    trackMessageSent,
    trackPaymentCompleted,
    trackReviewCreated,
  };
}