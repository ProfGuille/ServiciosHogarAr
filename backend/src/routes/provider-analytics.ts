import express from 'express';
import { db } from "../db.js";
import { serviceProviders } from "../shared/schema/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/provider/analytics - Get comprehensive analytics data (mock)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const timeRange = parseInt(req.query.timeRange as string) || 30;

    // Mock analytics data
    const mockAnalyticsData = {
      overview: {
        totalRevenue: 45000,
        totalBookings: 12,
        averageRating: 4.8,
        responseRate: 95,
        conversionRate: 85,
        revenueChange: 15.5,
        bookingsChange: 8.2
      },
      revenueChart: Array.from({ length: Math.min(timeRange, 30) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (timeRange - 1 - i));
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000) + 1000,
          bookings: Math.floor(Math.random() * 3) + 1
        };
      }),
      servicePerformance: [
        {
          serviceId: 1,
          serviceName: "Plomería General",
          bookings: 8,
          revenue: 25000,
          averageRating: 4.9,
          responseTime: 2
        },
        {
          serviceId: 2,
          serviceName: "Reparación de Grifos",
          bookings: 4,
          revenue: 12000,
          averageRating: 4.7,
          responseTime: 1
        },
        {
          serviceId: 3,
          serviceName: "Instalación de Tuberías",
          bookings: 2,
          revenue: 8000,
          averageRating: 5.0,
          responseTime: 3
        }
      ],
      clientMetrics: {
        newClients: 6,
        returningClients: 4,
        clientSatisfaction: 92,
        averageProjectValue: 3750
      },
      monthlyTrends: [
        { month: "Jul 2024", revenue: 32000, bookings: 9, newClients: 5 },
        { month: "Ago 2024", revenue: 28000, bookings: 8, newClients: 4 },
        { month: "Sep 2024", revenue: 35000, bookings: 11, newClients: 7 },
        { month: "Oct 2024", revenue: 42000, bookings: 13, newClients: 8 },
        { month: "Nov 2024", revenue: 38000, bookings: 10, newClients: 6 },
        { month: "Dic 2024", revenue: 45000, bookings: 12, newClients: 6 }
      ]
    };

    res.json(mockAnalyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/provider/analytics/summary - Get quick summary stats (mock)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Mock summary data
    const mockSummary = {
      totalRevenue: 145000,
      totalBookings: 38,
      averageRating: 4.8,
      activeServices: 5
    };

    res.json(mockSummary);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;