import { db } from "./db";
import { analyticsEvents, dailyStats, providerMetrics } from "@shared/schema";

export async function seedAnalyticsData() {
  console.log("Seeding analytics data...");

  try {
    // Create sample analytics events
    const sampleEvents = [
      {
        eventType: "page_view" as const,
        userId: "1",
        sessionId: "sess_123",
        metadata: { page: "landing", timestamp: new Date().toISOString() }
      },
      {
        eventType: "service_search" as const,
        userId: "2", 
        sessionId: "sess_456",
        metadata: { searchTerm: "plomero", category: "plomeria", resultsCount: 5 }
      },
      {
        eventType: "provider_view" as const,
        userId: "3",
        sessionId: "sess_789",
        metadata: { providerId: "1", providerName: "Juan Pérez" }
      },
      {
        eventType: "request_created" as const,
        userId: "4",
        sessionId: "sess_abc",
        metadata: { requestId: "1", category: "electricidad", amount: 5000 }
      },
      {
        eventType: "message_sent" as const,
        userId: "5",
        sessionId: "sess_def",
        metadata: { conversationId: "1", messageLength: 45 }
      }
    ];

    await db.insert(analyticsEvents).values(sampleEvents);

    // Create sample daily stats for the last 30 days
    const dailyStatsData = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      dailyStatsData.push({
        date,
        totalUsers: 100 + Math.floor(Math.random() * 50),
        newUsers: Math.floor(Math.random() * 10),
        totalProviders: 25 + Math.floor(Math.random() * 15),
        newProviders: Math.floor(Math.random() * 3),
        totalRequests: 200 + Math.floor(Math.random() * 100),
        newRequests: Math.floor(Math.random() * 20),
        completedRequests: Math.floor(Math.random() * 15),
        totalRevenue: "15000.00",
        newRevenue: (Math.random() * 2000).toFixed(2),
        avgResponseTime: (Math.random() * 24).toFixed(2),
        conversionRate: (Math.random() * 0.25).toFixed(4)
      });
    }

    await db.insert(dailyStats).values(dailyStatsData);

    // Create sample provider metrics
    const providerMetricsData = [];
    for (let providerId = 1; providerId <= 5; providerId++) {
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        providerMetricsData.push({
          providerId,
          date,
          profileViews: Math.floor(Math.random() * 50),
          requestsReceived: Math.floor(Math.random() * 10),
          requestsAccepted: Math.floor(Math.random() * 8),
          requestsCompleted: Math.floor(Math.random() * 6),
          totalEarnings: (Math.random() * 5000).toFixed(2),
          avgRating: (3.5 + Math.random() * 1.5).toFixed(2),
          responseTimeHours: (Math.random() * 12).toFixed(2),
          creditsUsed: Math.floor(Math.random() * 20),
          messagesCount: Math.floor(Math.random() * 30)
        });
      }
    }

    await db.insert(providerMetrics).values(providerMetricsData);

    console.log("Analytics data seeded successfully!");
  } catch (error) {
    console.error("Error seeding analytics data:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedAnalyticsData().then(() => process.exit(0));
}